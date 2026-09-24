'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getDbRole } from '@/lib/auth-role';
import { parseApifyItems, type LinkedInPost, type ParsedLead } from '@/lib/scrape-parse';
import { slugify, uniqueSlug } from '@/lib/platform';

const DEFAULT_ACTOR = process.env.APIFY_ACTOR_ID || 'harvestapi/linkedin-post-search';

async function verifyAdmin() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  const role = await getDbRole(supabase, user);
  if (role !== 'admin') throw new Error('Admin access required');
  return { supabase, user };
}

function leadRow(lead: ParsedLead, raw: unknown) {
  return {
    source_post_id: lead.sourcePostId,
    source_url: lead.sourceUrl,
    raw,
    title: lead.title.slice(0, 255),
    description_html: lead.descriptionHtml,
    company_name: lead.companyName,
    recruiter_name: lead.recruiterName,
    location: lead.location,
    remote_type: lead.remoteType,
    day_rate_min: lead.dayRateMin,
    day_rate_max: lead.dayRateMax,
    rate_note: lead.rateNote,
    ir35_status: lead.ir35Status,
    clearance_level: lead.clearanceLevel,
    contract_length: lead.contractLength,
    apply_url: lead.applyUrl,
    apply_email: lead.applyEmail || null,
    posted_at: lead.postedAt,
    classification: lead.classification,
    classification_reason: lead.reasons.join(' · '),
    confidence: lead.confidence,
    status: 'pending',
    updated_at: new Date().toISOString(),
  };
}

async function upsertLeads(supabase: ReturnType<typeof createClient>, posts: LinkedInPost[]) {
  const leads = parseApifyItems(posts);
  const rawById = new Map<string, LinkedInPost>();
  for (const post of posts) {
    if (post.id) rawById.set(String(post.id), post);
  }

  const counts = { publishable: 0, needs_review: 0, reject: 0 };
  let stored = 0;

  for (const lead of leads) {
    counts[lead.classification] += 1;
    const parentId = lead.sourcePostId.split(':')[0];
    const row = leadRow(lead, rawById.get(parentId) || { sourcePostId: lead.sourcePostId });
    let { error, data } = await supabase
      .from('scraped_jobs')
      .upsert(row, { onConflict: 'source_post_id', ignoreDuplicates: true })
      .select('id');
    if (error && /apply_email/.test(error.message)) {
      const { apply_email: _applyEmail, ...withoutEmail } = row;
      const retry = await supabase
        .from('scraped_jobs')
        .upsert(withoutEmail, { onConflict: 'source_post_id', ignoreDuplicates: true })
        .select('id');
      error = retry.error;
      data = retry.data;
    }
    if (error) throw new Error(error.message);
    if (data?.length) stored += 1;
  }

  return { imported: leads.length, stored, counts };
}

export async function importScrapedPosts(raw: string) {
  try {
    const { supabase } = await verifyAdmin();
    const parsed = JSON.parse(raw);
    const posts = Array.isArray(parsed) ? parsed : parsed?.items || parsed?.data || [];
    if (!Array.isArray(posts) || posts.length === 0) {
      return { error: 'Paste an Apify JSON array of LinkedIn posts.' };
    }
    const result = await upsertLeads(supabase, posts);
    revalidatePath('/dashboard/admin/scrape');
    return { success: true, ...result };
  } catch (error: any) {
    return { error: error.message || 'Could not import posts' };
  }
}

export async function startApifyScrape(formData: FormData) {
  try {
    await verifyAdmin();
    const token = process.env.APIFY_TOKEN;
    if (!token) {
      return { error: 'Set APIFY_TOKEN in the server environment to run live scrapes. You can still paste JSON.' };
    }

    const query = String(formData.get('query') || 'outside ir35').trim();
    const maxPosts = Math.min(Number(formData.get('maxPosts')) || 20, 50);
    const postedLimit = String(formData.get('postedLimit') || 'week');
    const actorId = encodeURIComponent(DEFAULT_ACTOR);
    const response = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs?token=${token}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contentType: 'all',
        maxPosts,
        postedLimit,
        searchQueries: [query],
        sortBy: 'date',
        scrapeComments: false,
        scrapeReactions: false,
        postNestedComments: false,
        postNestedReactions: false,
        profileScraperMode: 'short',
        reactionsProfileScraperMode: 'short',
        commentsProfileScraperMode: 'short',
        startPage: 1,
      }),
    });
    const body = await response.json();
    if (!response.ok) {
      return { error: body?.error?.message || `Apify returned ${response.status}` };
    }
    return { success: true, runId: body?.data?.id as string, status: body?.data?.status as string };
  } catch (error: any) {
    return { error: error.message || 'Could not start Apify run' };
  }
}

export async function ingestApifyDataset(datasetId: string) {
  try {
    const { supabase } = await verifyAdmin();
    const token = process.env.APIFY_TOKEN;
    if (!token) return { error: 'APIFY_TOKEN is not configured' };
    const id = datasetId.trim();
    if (!id) return { error: 'Missing Apify dataset id' };

    const itemsRes = await fetch(`https://api.apify.com/v2/datasets/${id}/items?token=${token}`);
    const items = await itemsRes.json();
    if (!itemsRes.ok) return { error: items?.error?.message || 'Could not read Apify dataset' };
    if (!Array.isArray(items)) return { error: 'Apify dataset was empty or invalid' };

    const result = await upsertLeads(supabase, items);
    revalidatePath('/dashboard/admin/scrape');
    return { success: true, ...result };
  } catch (error: any) {
    return { error: error.message || 'Could not ingest Apify dataset' };
  }
}

export async function ingestApifyRun(runId: string) {
  try {
    const { supabase } = await verifyAdmin();
    const token = process.env.APIFY_TOKEN;
    if (!token) return { error: 'APIFY_TOKEN is not configured' };
    if (!runId) return { error: 'Missing Apify run id' };

    const runRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${token}`);
    const runBody = await runRes.json();
    const status = runBody?.data?.status as string | undefined;
    if (!runRes.ok) return { error: runBody?.error?.message || 'Could not read Apify run' };
    if (status && !['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'].includes(status)) {
      return { pending: true, status };
    }
    if (status !== 'SUCCEEDED') {
      return { error: `Apify run ${status || 'failed'}` };
    }

    const datasetId = runBody?.data?.defaultDatasetId;
    const itemsRes = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}`);
    const items = await itemsRes.json();
    if (!Array.isArray(items)) return { error: 'Apify dataset was empty or invalid' };

    const result = await upsertLeads(supabase, items);
    revalidatePath('/dashboard/admin/scrape');
    return { success: true, status, ...result };
  } catch (error: any) {
    return { error: error.message || 'Could not ingest Apify run' };
  }
}

export async function rejectScrapedLead(leadId: string, contactEmail: string) {
  try {
    const { supabase, user } = await verifyAdmin();
    const email = cleanContactEmail(contactEmail);
    if (email.error) return { error: email.error };
    const { error } = await supabase.from('scraped_jobs').update({
      status: 'rejected',
      contact_email: email.value,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', leadId);
    if (error) return { error: contactEmailError(error.message) };
    revalidatePath('/dashboard/admin/scrape');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function publishScrapedLead(leadId: string, formData: FormData) {
  try {
    const { supabase, user } = await verifyAdmin();
    const { data: lead, error: leadError } = await supabase
      .from('scraped_jobs')
      .select('*')
      .eq('id', leadId)
      .single();
    if (leadError || !lead) throw new Error(leadError?.message || 'Lead not found');
    if (lead.status === 'published' && lead.published_job_id) {
      return { success: true, jobId: lead.published_job_id };
    }

    const title = String(formData.get('title') || lead.title).trim();
    const location = String(formData.get('location') || lead.location || 'United Kingdom').trim();
    const ir35 = String(formData.get('ir35_status') || lead.ir35_status || 'outside');
    if (!title) throw new Error('Title is required');
    if (ir35 !== 'outside') throw new Error('Only Outside IR35 leads can be published to the candidate board');

    const min = Number(formData.get('day_rate_min') || lead.day_rate_min || 0) || null;
    const max = Number(formData.get('day_rate_max') || lead.day_rate_max || min || 0) || null;
    const companyName = String(formData.get('company_name') || lead.company_name || lead.recruiter_name || 'LinkedIn recruiter').trim();
    const applyUrl = String(formData.get('apply_url') || lead.apply_url || lead.source_url || '').trim();
    const email = cleanContactEmail(String(formData.get('contact_email') || ''));
    if (email.error) return { error: email.error };
    const remoteType = String(formData.get('remote_type') || lead.remote_type || 'hybrid');
    const clearance = String(formData.get('clearance_level') || lead.clearance_level || 'none');
    const contractLength = String(formData.get('contract_length') || lead.contract_length || '');
    const description = String(formData.get('description_html') || lead.description_html);

    const companyId = await findOrCreateCompany(supabase, companyName);
    const slug = uniqueSlug(title);
    const now = new Date();
    const expires = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);

    const row: Record<string, unknown> = {
      title,
      slug,
      description_html: description,
      day_rate_min: min,
      day_rate_max: max,
      ir35_status: 'outside',
      remote_type: remoteType,
      location,
      clearance_level: clearance,
      contract_length: contractLength,
      status: 'active',
      company_id: companyId,
      recruiter_id: user.id,
      external_apply_url: applyUrl || null,
      source: 'linkedin',
      source_url: lead.source_url,
      source_post_id: lead.source_post_id,
      published_at: now.toISOString(),
      expires_at: expires.toISOString(),
    };

    const first = await supabase.from('jobs').insert(row).select('id, slug').single();
    let job = first.data;
    if (first.error) {
      const { source, source_url, source_post_id, contract_length, location, ...core } = row;
      const retry = await supabase.from('jobs').insert({
        ...core,
        external_apply_url: applyUrl || null,
      }).select('id, slug').single();
      if (retry.error) throw new Error(retry.error.message);
      job = retry.data;
    }

    const reviewed = {
      status: 'published',
      published_job_id: job!.id,
      title,
      location,
      day_rate_min: min,
      day_rate_max: max,
      company_name: companyName,
      apply_url: applyUrl,
      remote_type: remoteType,
      clearance_level: clearance,
      contract_length: contractLength,
      description_html: description,
      reviewed_by: user.id,
      reviewed_at: now.toISOString(),
      updated_at: now.toISOString(),
    };
    const saved = await supabase.from('scraped_jobs').update({
      ...reviewed,
      contact_email: email.value,
      apply_email: lead.apply_email || null,
    }).eq('id', leadId);
    if (saved.error && /contact_email|apply_email/.test(saved.error.message)) {
      const retry = await supabase.from('scraped_jobs').update(reviewed).eq('id', leadId);
      if (retry.error) return { error: retry.error.message };
      revalidatePath('/dashboard/admin/scrape');
      revalidatePath('/jobs');
      return { error: contactEmailError(saved.error.message) };
    }
    if (saved.error) return { error: saved.error.message };

    revalidatePath('/dashboard/admin/scrape');
    revalidatePath('/jobs');
    revalidatePath(`/jobs/${job!.slug}`);
    revalidatePath('/');
    return { success: true, jobId: job!.id, slug: job!.slug };
  } catch (error: any) {
    return { error: error.message };
  }
}

function contactEmailError(message: string) {
  if (/contact_email|apply_email/.test(message)) {
    return 'Run supabase/migrations/20260924233000_scraped_job_contact_email.sql in the Supabase SQL editor, then save again.';
  }
  return message;
}

function cleanContactEmail(value: string) {
  const email = value.trim().toLowerCase();
  if (!email) return { value: null as string | null };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { value: null, error: 'Enter a valid client email, or leave it blank.' };
  }
  return { value: email };
}

async function findOrCreateCompany(supabase: ReturnType<typeof createClient>, name: string) {
  const slug = slugify(name) || uniqueSlug('recruiter');
  const { data: bySlug } = await supabase.from('companies').select('id').eq('slug', slug).maybeSingle();
  if (bySlug?.id) return bySlug.id;
  const { data: byName } = await supabase.from('companies').select('id').ilike('name', name).maybeSingle();
  if (byName?.id) return byName.id;

  const insert = await supabase.from('companies').insert({
    name,
    slug,
    description: 'Recruiter sourced from a public LinkedIn post. This is not a verified hiring client.',
    website_url: null,
    is_verified: false,
  }).select('id').single();

  if (!insert.error && insert.data?.id) return insert.data.id;

  const { data: again } = await supabase.from('companies').select('id').eq('slug', slug).maybeSingle();
  if (again?.id) return again.id;
  throw new Error(insert.error?.message || 'Could not create recruiter company');
}
