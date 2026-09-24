'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import {
  isAllowedApplicationStatus,
  jobEvidencePayload,
  slugify,
  uniqueSlug,
  validateJobPostInput,
} from '@/lib/platform';

async function verifyRecruiter() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase.from('recruiter_profiles').select('company_id').eq('user_id', user.id).single();
  if (!profile || !profile.company_id) throw new Error('Not a verified recruiter or no company linked');

  return { supabase, user, companyId: profile.company_id };
}

function coreJobFields(formData: FormData, userId: string, companyId: string, slug?: string) {
  const title = formData.get('title') as string;
  const parsed = validateJobPostInput({
    title,
    location: formData.get('location') as string,
    day_rate_min: Number(formData.get('day_rate_min')),
    day_rate_max: Number(formData.get('day_rate_max')),
    ir35_status: formData.get('ir35_status') as string,
    attested: formData.get('ir35_attested') === 'on' || formData.get('ir35_status') === 'inside',
    status: (formData.get('status') as string) || 'active',
  });
  if (parsed.error) throw new Error(parsed.error);

  return {
    parsed,
    row: {
      title,
      slug: slug || uniqueSlug(title),
      description_html: formData.get('description_html') as string,
      day_rate_min: Number(formData.get('day_rate_min')),
      day_rate_max: Number(formData.get('day_rate_max')),
      ir35_status: parsed.ir35,
      remote_type: formData.get('remote_type') as string,
      location: formData.get('location') as string,
      clearance_level: formData.get('clearance_level') as string,
      status: parsed.status,
      published_at: formData.get('published_at') ? new Date(formData.get('published_at') as string).toISOString() : new Date().toISOString(),
      expires_at: formData.get('expires_at') ? new Date(formData.get('expires_at') as string).toISOString() : null,
      company_id: companyId,
      recruiter_id: userId,
    },
  };
}

async function insertJobWithEvidence(supabase: any, row: Record<string, unknown>, formData: FormData) {
  const evidence = jobEvidencePayload(formData);
  const full = { ...row, ...evidence };
  const first = await supabase.from('jobs').insert(full).select().single();
  if (!first.error) return first;

  const core = await supabase.from('jobs').insert(row).select().single();
  if (core.error) throw new Error(core.error.message);
  return core;
}

export async function createJob(formData: FormData) {
  try {
    const { supabase, user, companyId } = await verifyRecruiter();
    const { row } = coreJobFields(formData, user.id, companyId);
    const { data, error } = await insertJobWithEvidence(supabase, row, formData);
    if (error) throw new Error(error.message);

    const category_id = formData.get('category_id') as string;
    const skill_ids_raw = formData.get('skill_ids') as string;
    const skill_ids: string[] = skill_ids_raw ? JSON.parse(skill_ids_raw) : [];

    if (category_id) {
      await supabase.from('job_categories').insert({ job_id: data.id, category_id });
    }
    if (skill_ids.length > 0) {
      await supabase.from('job_skills').insert(skill_ids.map((skill_id) => ({ job_id: data.id, skill_id })));
    }

    revalidatePath('/dashboard/recruiter/jobs');
    revalidatePath('/jobs');
    return { success: true, jobId: data.id };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateJob(jobId: string, formData: FormData) {
  try {
    const { supabase, user, companyId } = await verifyRecruiter();
    const { data: job } = await supabase.from('jobs').select('company_id, slug').eq('id', jobId).single();
    if (!job || job.company_id !== companyId) throw new Error('Unauthorized to edit this job');

    const { row } = coreJobFields(formData, user.id, companyId, job.slug);
    const { slug, company_id, recruiter_id, ...updateRow } = row;
    const evidence = jobEvidencePayload(formData);

    const { error } = await supabase.from('jobs').update({
      ...updateRow,
      ...evidence,
      updated_at: new Date().toISOString(),
    }).eq('id', jobId);

    if (error) {
      const retry = await supabase.from('jobs').update({
        ...updateRow,
        updated_at: new Date().toISOString(),
      }).eq('id', jobId);
      if (retry.error) throw new Error(retry.error.message);
    }

    const category_id = formData.get('category_id') as string;
    const skill_ids_raw = formData.get('skill_ids') as string;
    const skill_ids: string[] = skill_ids_raw ? JSON.parse(skill_ids_raw) : [];

    if (category_id) {
      await supabase.from('job_categories').delete().eq('job_id', jobId);
      await supabase.from('job_categories').insert({ job_id: jobId, category_id });
    }

    await supabase.from('job_skills').delete().eq('job_id', jobId);
    if (skill_ids.length > 0) {
      await supabase.from('job_skills').insert(skill_ids.map((skill_id) => ({ job_id: jobId, skill_id })));
    }

    revalidatePath('/dashboard/recruiter/jobs');
    revalidatePath('/jobs');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteJob(jobId: string) {
  try {
    const { supabase, companyId } = await verifyRecruiter();
    const { data: job } = await supabase.from('jobs').select('company_id').eq('id', jobId).single();
    if (job?.company_id !== companyId) throw new Error('Unauthorized to delete this job');

    const { error } = await supabase.from('jobs').delete().eq('id', jobId);
    if (error) throw new Error(error.message);

    revalidatePath('/dashboard/recruiter/jobs');
    revalidatePath('/jobs');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateApplicationStatus(applicationId: string, newStatus: string) {
  try {
    if (!isAllowedApplicationStatus(newStatus)) throw new Error('Invalid application status');
    const { supabase, companyId } = await verifyRecruiter();

    const { data: app } = await supabase.from('applications').select('jobs(company_id)').eq('id', applicationId).single();
    const appData: any = app;
    const appCompanyId = Array.isArray(appData?.jobs) ? appData?.jobs[0]?.company_id : appData?.jobs?.company_id;
    if (appCompanyId !== companyId) throw new Error('Unauthorized');

    const { error } = await supabase.from('applications').update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    }).eq('id', applicationId);

    if (error) throw new Error(error.message);

    revalidatePath('/dashboard/recruiter/applications');
    revalidatePath(`/dashboard/recruiter/applications/${applicationId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Action error (updateApplicationStatus):', error);
    return { error: error.message };
  }
}

export async function addRecruiterNote(applicationId: string, note: string) {
  try {
    const { supabase, companyId } = await verifyRecruiter();
    const { data: app } = await supabase.from('applications').select('jobs(company_id)').eq('id', applicationId).single();
    const appData: any = app;
    const appCompanyId = Array.isArray(appData?.jobs) ? appData?.jobs[0]?.company_id : appData?.jobs?.company_id;
    if (appCompanyId !== companyId) throw new Error('Unauthorized');

    const { error } = await supabase.from('applications').update({
      recruiter_notes: note,
      updated_at: new Date().toISOString(),
    }).eq('id', applicationId);

    if (error) throw new Error(error.message);

    revalidatePath(`/dashboard/recruiter/applications/${applicationId}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateCompanyProfile(formData: FormData) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const name = formData.get('name') as string;
    const website = formData.get('website') as string;
    const description = formData.get('description') as string;
    const industry = formData.get('industry') as string;
    const company_size = formData.get('company_size') as string;

    let logo_url = formData.get('existing_logo_url') as string;
    const logo_file = formData.get('logo_file') as File | null;

    if (logo_file && logo_file.size > 0) {
      const fileExt = logo_file.name.split('.').pop() || 'png';
      const fileName = `company-${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('media').upload(fileName, logo_file);
      if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);
      logo_url = publicUrl;
    }

    const { data: profile } = await supabase.from('recruiter_profiles').select('company_id').eq('user_id', user.id).maybeSingle();
    const slug = slugify(name) || uniqueSlug(name);

    if (profile?.company_id) {
      const { error } = await supabase.from('companies').update({
        name,
        slug,
        website_url: website,
        description,
        industry,
        size_band: company_size,
        logo_url,
        updated_at: new Date().toISOString(),
      }).eq('id', profile.company_id);
      if (error) throw new Error(error.message);
    } else {
      const { data: newCompany, error: compError } = await supabase.from('companies').insert({
        name,
        slug,
        website_url: website,
        description,
        industry,
        size_band: company_size,
        logo_url,
      }).select().single();
      if (compError) throw new Error(compError.message);

      const { error: profileError } = await supabase.from('recruiter_profiles')
        .update({ company_id: newCompany.id })
        .eq('user_id', user.id);
      if (profileError) throw new Error(`Failed to link company: ${profileError.message}`);
    }

    revalidatePath('/dashboard/recruiter');
    revalidatePath('/dashboard/recruiter/settings');
    revalidatePath('/companies');
    return { success: true };
  } catch (error: any) {
    console.error('Action error (updateCompanyProfile):', error);
    return { error: error.message };
  }
}
