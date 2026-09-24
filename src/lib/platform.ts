export const JOB_STATUSES = ['draft', 'active', 'expired', 'archived'] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const APPLICATION_STATUSES = [
  'applied',
  'reviewing',
  'interviewing',
  'offered',
  'rejected',
  'withdrawn',
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const IR35_STATUSES = ['outside', 'inside', 'undecided'] as const;
export type Ir35Status = (typeof IR35_STATUSES)[number];

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://outsideir35.co.uk';

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function uniqueSlug(value: string, salt = Date.now() % 10000): string {
  const base = slugify(value) || 'role';
  return `${base}-${salt}`;
}

export function normalizeIr35(value: string | null | undefined): Ir35Status | null {
  if (!value || value === 'all') return null;
  const v = value.trim().toLowerCase();
  if (v === 'outside' || v === 'inside' || v === 'undecided') return v;
  return null;
}

export function companyHref(company: { slug?: string | null; id?: string | null; companyId?: string | null } | null | undefined): string {
  if (!company) return '/companies';
  const slug = company.slug;
  if (slug) return `/companies/${slug}`;
  const id = company.id || company.companyId;
  return id ? `/companies/${id}` : '/companies';
}

export function formatDayRate(min?: number | null, max?: number | null): string {
  const low = Number(min);
  const high = Number(max);
  const hasLow = Number.isFinite(low) && low > 0;
  const hasHigh = Number.isFinite(high) && high > 0;
  if (hasLow && hasHigh && low !== high) return `£${low} – £${high}`;
  if (hasHigh) return `£${high}`;
  if (hasLow) return `£${low}`;
  return 'Rate DOE';
}

export function isSourcedJob(job: { source?: string | null } | null | undefined): boolean {
  return job?.source === 'linkedin' || job?.source === 'scraped';
}

export function isLiveJob(
  job: { status?: string | null; expires_at?: string | null; expiresAt?: string | null; published_at?: string | null },
  now = new Date()
): boolean {
  const status = (job.status || 'active').toLowerCase();
  if (status && !['active', 'open', 'published'].includes(status)) return false;
  const expires = job.expires_at || job.expiresAt;
  if (expires && new Date(expires) < now) return false;
  if (job.published_at && new Date(job.published_at) > now) return false;
  return true;
}

const LEGACY_APP_STATUS: Record<string, ApplicationStatus> = {
  pending: 'applied',
  interview: 'interviewing',
  offer: 'offered',
};

export function normalizeApplicationStatus(value: string | null | undefined): ApplicationStatus {
  const raw = (value || 'applied').toLowerCase();
  if (LEGACY_APP_STATUS[raw]) return LEGACY_APP_STATUS[raw];
  if ((APPLICATION_STATUSES as readonly string[]).includes(raw)) return raw as ApplicationStatus;
  return 'applied';
}

export function isAllowedApplicationStatus(value: string): boolean {
  return (APPLICATION_STATUSES as readonly string[]).includes(value);
}

export function applicationStatusLabel(status: string): string {
  const normalized = normalizeApplicationStatus(status);
  const labels: Record<ApplicationStatus, string> = {
    applied: 'Applied',
    reviewing: 'Reviewing',
    interviewing: 'Interviewing',
    offered: 'Offered',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
  };
  return labels[normalized];
}

export function profileCompletionScore(profile: Record<string, unknown> | null | undefined): number {
  if (!profile) return 15;
  const fields = [
    'first_name',
    'last_name',
    'headline',
    'bio',
    'location',
    'min_day_rate',
    'max_day_rate',
    'availability',
    'resume_url',
    'linkedin_url',
  ];
  const filled = fields.filter((key) => {
    const value = profile[key];
    return value !== null && value !== undefined && String(value).trim() !== '';
  }).length;
  return Math.round((filled / fields.length) * 100);
}

export interface SeoIntent {
  skill: string;
  location: string;
  clearance: string;
  sector: string;
  ir35: Ir35Status | '';
  remote: boolean;
}

export const SEO_SKILLS = ['react', 'python', 'aws', 'sap', 'power-bi', 'sql', 'terraform', 'kubernetes'];
export const SEO_LOCATIONS = ['london', 'manchester', 'bristol', 'gloucester', 'birmingham', 'glasgow'];
export const SEO_CLEARANCES = ['sc', 'dv', 'bpss'];
export const SEO_SECTORS = [
  'finance',
  'construction',
  'engineering',
  'healthcare',
  'technology',
  'procurement',
  'government',
  'project-management',
  'business-analysis',
];

export function parseSeoIntent(rawSlug: string): SeoIntent {
  const slugStr = rawSlug.toLowerCase();
  const intent: SeoIntent = {
    skill: '',
    location: '',
    clearance: '',
    sector: '',
    ir35: '',
    remote: slugStr.includes('remote'),
  };

  if (slugStr.includes('outside-ir35')) intent.ir35 = 'outside';
  else if (slugStr.includes('inside-ir35')) intent.ir35 = 'inside';

  for (const c of SEO_CLEARANCES) {
    if (slugStr.includes(`${c}-`) || slugStr.includes(`-${c}-`) || slugStr.startsWith(`${c}-`)) {
      intent.clearance = c.toUpperCase();
      break;
    }
  }

  for (const s of SEO_SKILLS) {
    if (slugStr.includes(s)) {
      intent.skill = s.replace('-', ' ').toUpperCase();
      break;
    }
  }

  for (const sec of SEO_SECTORS) {
    if (slugStr.includes(sec)) {
      intent.sector = sec.charAt(0).toUpperCase() + sec.slice(1).replace('-', ' ');
      break;
    }
  }

  for (const l of SEO_LOCATIONS) {
    if (slugStr.includes(l)) {
      intent.location = l.charAt(0).toUpperCase() + l.slice(1);
      break;
    }
  }

  return intent;
}

export function seoCopy(intent: SeoIntent, jobCount: number) {
  const termSkill = intent.skill ? `${intent.skill} ` : '';
  const termClearance = intent.clearance ? `${intent.clearance} Cleared ` : '';
  const termSector = intent.sector ? `${intent.sector} ` : '';
  const termIr35 = intent.ir35 === 'outside' ? 'Outside IR35 ' : intent.ir35 === 'inside' ? 'Inside IR35 ' : '';
  const termRemote = intent.remote ? 'Remote ' : '';
  const termLocation = intent.location ? `in ${intent.location}` : 'in the UK';

  const heading = `${termClearance}${termIr35}${termRemote}${termSkill}${termSector}Contract Jobs ${termLocation}`
    .replace(/\s+/g, ' ')
    .trim();

  return {
    heading,
    title: `${heading} | OutsideIR35`,
    description: `Browse ${jobCount} live ${heading.toLowerCase()}. Day rates, IR35 status, and clearance are listed on every role.`,
    intro: `Live UK contract roles matching ${heading.toLowerCase()}. Outside IR35 is the default view across the portal; inside IR35 roles are labelled separately when listed.`,
  };
}

export function jobMatchesSeoIntent(
  job: {
    skills?: string[];
    location?: string;
    clearanceLevel?: string;
    clearance_level?: string;
    industry?: string;
    ir35Status?: string;
    ir35_status?: string;
    remoteType?: string;
    remote_type?: string;
  },
  intent: SeoIntent
): boolean {
  if (intent.skill) {
    const skill = intent.skill.toLowerCase();
    if (!(job.skills || []).some((s) => s.toLowerCase().includes(skill))) return false;
  }
  if (intent.location && (job.location || '').toLowerCase() !== intent.location.toLowerCase()) {
    return false;
  }
  if (intent.clearance) {
    const clearance = (job.clearanceLevel || job.clearance_level || '').toLowerCase();
    if (clearance !== intent.clearance.toLowerCase()) return false;
  }
  if (intent.sector && (job.industry || '').toLowerCase() !== intent.sector.toLowerCase()) {
    return false;
  }
  if (intent.ir35) {
    const status = job.ir35Status || job.ir35_status;
    if (status !== intent.ir35) return false;
  }
  if (intent.remote) {
    const remote = job.remoteType || job.remote_type;
    if (remote !== 'remote') return false;
  }
  return true;
}

export function parseJobSearchParams(params: {
  q?: string | null;
  location?: string | null;
  ir35?: string | null;
  remote?: string | null;
  clearance?: string | null;
}) {
  return {
    q: params.q || '',
    location: params.location || '',
    ir35: normalizeIr35(params.ir35),
    remote: params.remote === 'remote' || params.remote === '1' || params.remote === 'true',
    clearance: params.clearance ? params.clearance.toUpperCase() : '',
  };
}

export function validateRegisterInput(input: {
  role?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  companyName?: string | null;
  consent?: boolean;
}) {
  if (!input.firstName || !input.lastName) {
    return { error: 'First and last name are required' };
  }
  const role = input.role || 'candidate';
  if (role !== 'candidate' && role !== 'recruiter') {
    return { error: 'Invalid account type' };
  }
  if (role === 'recruiter' && !input.companyName) {
    return { error: 'Company name is required for recruiter accounts' };
  }
  if (input.consent === false) {
    return { error: 'You must accept the privacy policy to create an account' };
  }
  return { error: null, role };
}

export function validateJobPostInput(input: {
  title?: string | null;
  location?: string | null;
  day_rate_min?: number;
  day_rate_max?: number;
  ir35_status?: string | null;
  attested?: boolean;
  status?: string | null;
}) {
  if (!input.title?.trim()) return { error: 'Job title is required' };
  if (!input.location?.trim()) return { error: 'Location is required' };
  if (!input.day_rate_min || !input.day_rate_max) return { error: 'Day rates are required' };
  if (input.day_rate_min > input.day_rate_max) {
    return { error: 'Minimum day rate cannot exceed maximum day rate' };
  }
  const ir35 = normalizeIr35(input.ir35_status);
  if (!ir35) return { error: 'IR35 status is required' };
  if (ir35 === 'outside' && input.attested === false) {
    return { error: 'Confirm the Outside IR35 determination before publishing' };
  }
  const status = input.status || 'active';
  if (!(JOB_STATUSES as readonly string[]).includes(status)) {
    return { error: 'Invalid job status' };
  }
  return { error: null, ir35, status };
}

export function isAllowedImagePath(path: string): boolean {
  if (!path) return false;
  if (path.includes('..') || path.includes('\\') || path.startsWith('http')) return false;
  if (path.startsWith('/')) return false;
  return /^[a-zA-Z0-9/_\-.]+$/.test(path);
}

export function allowedStorageUrl(targetUrl: string, supabaseUrl: string | undefined): boolean {
  if (!targetUrl || !supabaseUrl) return false;
  const prefix = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/`;
  return targetUrl.startsWith(prefix);
}

export function jobEvidencePayload(formData: FormData) {
  const determination = formData.get('determination_date') as string | null;
  return {
    engagement_model: (formData.get('engagement_model') as string) || 'psc',
    fee_payer: (formData.get('fee_payer') as string) || '',
    end_client: (formData.get('end_client') as string) || '',
    determination_date: determination || null,
    sds_available: formData.get('sds_available') === 'on' || formData.get('sds_available') === 'true',
    contract_length: (formData.get('contract_length') as string) || '',
    ir35_attested_at: formData.get('ir35_attested') === 'on' ? new Date().toISOString() : null,
  };
}
