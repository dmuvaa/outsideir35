import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { Job } from '@/lib/db';
import { getProxyImageUrl } from '@/lib/image-utils';
import { isLiveJob } from '@/lib/platform';
import { parentNameFor } from '@/lib/job-taxonomy';

const JOB_SELECT = `
  id, title, slug, company_id, description_html,
  requirements, responsibilities, benefits,
  day_rate_min, day_rate_max, ir35_status, remote_type,
  clearance_level, location, status, featured, created_at,
  expires_at, views_count, applications_count,
  source, source_url, external_apply_url,
  companies ( name, logo_url, industry, slug, is_verified, headquarters_location ),
  job_skills ( skills ( name ) ),
  job_categories ( categories ( name, slug ) )
`;

function jobCategoryName(job: any) {
  const links = Array.isArray(job.job_categories) ? job.job_categories : [];
  const names = links.map((link: any) => {
    const category = Array.isArray(link?.categories) ? link.categories[0] : link?.categories;
    return parentNameFor(category?.slug) || category?.name || '';
  }).filter(Boolean);
  return names[0] || '';
}

function mapJob(job: any): Job & {
  companySlug?: string;
  companyVerified?: boolean;
  engagementModel?: string;
  feePayer?: string;
  endClient?: string;
  sdsAvailable?: boolean;
  contractLength?: string;
  source?: string;
  sourceUrl?: string;
  externalApplyUrl?: string;
} {
  const companies = Array.isArray(job.companies) ? job.companies[0] : job.companies;
  return {
    id: job.id,
    title: job.title,
    slug: job.slug,
    companyId: job.company_id,
    companyName: companies?.name || 'Unknown Company',
    companyLogo: getProxyImageUrl(companies?.logo_url) || '',
    companySlug: companies?.slug,
    companyVerified: companies?.is_verified || false,
    descriptionHtml: job.description_html,
    requirements: typeof job.requirements === 'string' ? safeJson(job.requirements) : job.requirements || [],
    responsibilities: typeof job.responsibilities === 'string' ? safeJson(job.responsibilities) : job.responsibilities || [],
    benefits: typeof job.benefits === 'string' ? safeJson(job.benefits) : job.benefits || [],
    dayRateMin: Number(job.day_rate_min),
    dayRateMax: Number(job.day_rate_max),
    ir35Status: job.ir35_status,
    remoteType: job.remote_type,
    clearanceLevel: job.clearance_level,
    location: job.location || '',
    industry: jobCategoryName(job) || companies?.industry || '',
    skills: job.job_skills?.map((js: any) => js.skills?.name).filter(Boolean) || [],
    createdAt: job.created_at,
    expiresAt: job.expires_at,
    views: job.views_count,
    applications: job.applications_count,
    featured: job.featured || false,
    status: job.status,
    engagementModel: job.engagement_model,
    feePayer: job.fee_payer,
    endClient: job.end_client,
    sdsAvailable: job.sds_available,
    contractLength: job.contract_length,
    source: job.source,
    sourceUrl: job.source_url,
    externalApplyUrl: job.external_apply_url,
  };
}

function safeJson(value: string) {
  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function getJobsServer(): Promise<ReturnType<typeof mapJob>[]> {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase
    .from('jobs')
    .select(JOB_SELECT)
    .in('status', ['active', 'open', 'published'])
    .order('created_at', { ascending: false });

  if (error || !data) {
    if (error) {
      const fallback = await supabase
        .from('jobs')
        .select(`
          id, title, slug, company_id, description_html,
          requirements, responsibilities, benefits,
          day_rate_min, day_rate_max, ir35_status, remote_type,
          clearance_level, location, status, featured, created_at,
          expires_at, views_count, applications_count,
          companies ( name, logo_url, industry, slug, is_verified, headquarters_location ),
          job_skills ( skills ( name ) ),
          job_categories ( categories ( name, slug ) )
        `)
        .in('status', ['active', 'open', 'published'])
        .order('created_at', { ascending: false });
      if (fallback.error || !fallback.data) return [];
      return fallback.data.map(mapJob).filter((job) => isLiveJob(job));
    }
    return [];
  }

  return data.map(mapJob).filter((job) => isLiveJob(job));
}

export async function getCompaniesServer() {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('name');

  if (error || !data) return [];
  return data.map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    logo: getProxyImageUrl(c.logo_url) || '',
    logo_url: getProxyImageUrl(c.logo_url),
    description: c.description || '',
    website: c.website_url || '',
    website_url: c.website_url,
    size: c.size_band || '1-10',
    size_band: c.size_band,
    industry: c.industry || '',
    location: c.headquarters_location || '',
    headquarters_location: c.headquarters_location,
    verified: c.is_verified || false,
    is_verified: c.is_verified || false,
  }));
}

export async function getCompanyBySlugServer(slug: string) {
  const companies = await getCompaniesServer();
  return companies.find((c) => c.slug === slug || c.id === slug) || null;
}

export async function getGuidesServer() {
  const supabase = createClient(await cookies());
  const published = await supabase
    .from('guides')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (!published.error && published.data) return published.data;

  const { data, error } = await supabase.from('guides').select('*').order('title');
  if (error || !data) return [];
  return data;
}

export async function getGuideBySlugServer(slug: string) {
  const guides = await getGuidesServer();
  return guides.find((g: any) => g.slug === slug) || null;
}

export async function getBlogPostsServer() {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('published_at', { ascending: false });

  if (error || !data) return [];
  return data
    .filter((b: any) => !b.status || b.status === 'published')
    .map((b: any) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt || '',
      featuredImageUrl: b.featured_image_url || '',
      status: b.status,
      contentHtml: b.content_html,
      createdAt: b.created_at,
      publishedAt: b.published_at,
    }));
}

export async function getBlogPostBySlugServer(slug: string) {
  const posts = await getBlogPostsServer();
  return posts.find((p) => p.slug === slug) || null;
}

export async function getPublicCandidatesServer() {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase
    .from('candidate_profiles')
    .select('user_id, first_name, last_name, headline, location, min_day_rate, max_day_rate, availability, clearance_level, is_profile_public')
    .eq('is_profile_public', true)
    .order('updated_at', { ascending: false })
    .limit(60);

  if (error || !data) return [];
  return data;
}
