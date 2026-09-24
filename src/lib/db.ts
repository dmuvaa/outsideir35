import { createClient } from '@/utils/supabase/client';
import { getProxyImageUrl } from '@/lib/image-utils';

export interface Company {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  website: string;
  size: string;
  industry: string;
  location: string;
  verified: boolean;
}

export interface Job {
  id: string;
  title: string;
  slug: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  descriptionHtml: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  dayRateMin: number;
  dayRateMax: number;
  ir35Status: 'outside' | 'inside' | 'undecided';
  remoteType: 'remote' | 'hybrid' | 'onsite';
  clearanceLevel: 'none' | 'BPSS' | 'SC' | 'DV';
  location: string;
  industry: string;
  skills: string[];
  createdAt: string;
  expiresAt: string;
  views: number;
  applications: number;
  featured: boolean;
  status: 'active' | 'draft' | 'expired' | 'archived';
  companySlug?: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  userId: string;
  candidateName: string;
  resumeUrl: string;
  coverLetter?: string;
  status: 'applied' | 'reviewing' | 'interviewing' | 'offered' | 'rejected' | 'withdrawn';
  notes?: string;
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  role: 'candidate' | 'recruiter' | 'admin';
  name: string;
  headline?: string;
  bio?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  availability: 'immediate' | '1_month' | 'not_available';
  minDayRate?: number;
  maxDayRate?: number;
  clearanceLevel: 'none' | 'BPSS' | 'SC' | 'DV';
  resumeName?: string;
  savedJobs: string[]; // jobIds
  savedSearches: Array<{ id: string; name: string; filters: any }>;
  alerts: Array<{ id: string; savedSearchId: string; frequency: 'immediate' | 'daily' | 'weekly' }>;
  consent: Array<{ type: string; granted: boolean; ip: string; date: string }>;
}

export interface RecruiterProfile {
  userId: string;
  email: string;
  name: string;
  phone?: string;
  companyId?: string;
}

const supabase = createClient();

class SupabaseDB {
  private isClient = typeof window !== 'undefined';

  constructor() {
    if (this.isClient) {
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const { data: dbUser } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();

          const role = dbUser?.role || 'candidate';
          localStorage.setItem('ob_auth_user', JSON.stringify({
            id: session.user.id,
            email: session.user.email,
            role: role
          }));
        } else {
          localStorage.removeItem('ob_auth_user');
        }
      });
    }
  }

  // Helper for safe JSON parsing
  private safeJsonParse(val: any): string[] {
    if (!val) return [];
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [val];
      } catch {
        return val.split('\n').map((s: string) => s.trim()).filter(Boolean);
      }
    }
    if (Array.isArray(val)) return val;
    return [];
  }

  // Jobs
  public async getJobs(): Promise<Job[]> {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        companies (
          id,
          name,
          logo_url,
          industry,
          headquarters_location,
          size_band,
          is_verified
        ),
        job_skills (
          skills (
            name
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('Error fetching jobs:', error?.message);
      return [];
    }

    return data.map((j: any) => ({
      id: j.id,
      title: j.title,
      slug: j.slug,
      companyId: j.company_id,
      companyName: j.companies?.name || 'Unknown Company',
      companyLogo: getProxyImageUrl(j.companies?.logo_url) || '🏢',
      descriptionHtml: j.description_html,
      requirements: this.safeJsonParse(j.requirements),
      responsibilities: this.safeJsonParse(j.responsibilities),
      benefits: this.safeJsonParse(j.benefits),
      dayRateMin: Number(j.day_rate_min),
      dayRateMax: Number(j.day_rate_max),
      ir35Status: j.ir35_status,
      remoteType: j.remote_type,
      clearanceLevel: j.clearance_level,
      location: j.location || '',
      industry: j.companies?.industry || 'Technology',
      skills: j.job_skills?.map((js: any) => js.skills?.name).filter(Boolean) || [],
      createdAt: j.created_at,
      expiresAt: j.expires_at,
      views: j.views_count,
      applications: j.applications_count,
      featured: j.featured || false,
      status: j.status
    }));
  }

  public async getJobBySlug(slug: string): Promise<Job | undefined> {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        companies (
          id,
          name,
          logo_url,
          industry,
          headquarters_location,
          size_band,
          is_verified
        ),
        job_skills (
          skills (
            name
          )
        )
      `)
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) {
      return undefined;
    }

    return {
      id: data.id,
      title: data.title,
      slug: data.slug,
      companyId: data.company_id,
      companyName: data.companies?.name || 'Unknown Company',
      companyLogo: getProxyImageUrl(data.companies?.logo_url) || '🏢',
      descriptionHtml: data.description_html,
      requirements: this.safeJsonParse(data.requirements),
      responsibilities: this.safeJsonParse(data.responsibilities),
      benefits: this.safeJsonParse(data.benefits),
      dayRateMin: Number(data.day_rate_min),
      dayRateMax: Number(data.day_rate_max),
      ir35Status: data.ir35_status,
      remoteType: data.remote_type,
      clearanceLevel: data.clearance_level,
      location: data.location || '',
      industry: data.companies?.industry || 'Technology',
      skills: data.job_skills?.map((js: any) => js.skills?.name).filter(Boolean) || [],
      createdAt: data.created_at,
      expiresAt: data.expires_at,
      views: data.views_count,
      applications: data.applications_count,
      featured: data.featured || false,
      status: data.status
    };
  }

  public async createJob(jobData: Omit<Job, 'id' | 'createdAt' | 'views' | 'applications' | 'companyLogo' | 'companyName'>): Promise<Job> {
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        title: jobData.title,
        slug: jobData.slug,
        company_id: jobData.companyId,
        description_html: jobData.descriptionHtml,
        requirements: JSON.stringify(jobData.requirements),
        responsibilities: JSON.stringify(jobData.responsibilities),
        benefits: JSON.stringify(jobData.benefits),
        day_rate_min: jobData.dayRateMin,
        day_rate_max: jobData.dayRateMax,
        ir35_status: jobData.ir35Status,
        remote_type: jobData.remoteType,
        clearance_level: jobData.clearanceLevel,
        location: jobData.location,
        status: jobData.status,
        featured: false
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create job in Supabase: ${error?.message}`);
    }

    // Add skills association
    for (const skillName of jobData.skills) {
      // Get or create skill
      let skillId = '';
      const { data: existingSkill } = await supabase
        .from('skills')
        .select('id')
        .eq('name', skillName)
        .maybeSingle();

      if (existingSkill) {
        skillId = existingSkill.id;
      } else {
        const skillSlug = skillName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const { data: newSkill } = await supabase
          .from('skills')
          .insert({ name: skillName, slug: skillSlug })
          .select('id')
          .single();
        if (newSkill) skillId = newSkill.id;
      }

      if (skillId) {
        await supabase.from('job_skills').insert({
          job_id: data.id,
          skill_id: skillId
        });
      }
    }

    await this.logAudit('Job Created', `Created job posting: ${jobData.title}`);

    const company = await this.getCompanyById(jobData.companyId);
    return {
      id: data.id,
      title: data.title,
      slug: data.slug,
      companyId: data.company_id,
      companyName: company ? company.name : 'Unknown Company',
      companyLogo: company ? company.logo : '🏢', // already proxied via getCompanyById
      descriptionHtml: data.description_html,
      requirements: jobData.requirements,
      responsibilities: jobData.responsibilities,
      benefits: jobData.benefits,
      dayRateMin: Number(data.day_rate_min),
      dayRateMax: Number(data.day_rate_max),
      ir35Status: data.ir35_status,
      remoteType: data.remote_type,
      clearanceLevel: data.clearance_level,
      location: data.location || '',
      industry: company ? company.industry : 'Technology',
      skills: jobData.skills,
      createdAt: data.created_at,
      expiresAt: data.expires_at,
      views: data.views_count,
      applications: data.applications_count,
      featured: data.featured || false,
      status: data.status
    };
  }

  // Companies
  public async getCompanies(): Promise<Company[]> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name');

    if (error || !data) {
      console.error('Error fetching companies:', error?.message);
      return [];
    }

    return data.map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      logo: getProxyImageUrl(c.logo_url) || '🏢',
      description: c.description || '',
      website: c.website_url || '',
      size: c.size_band || '1-10',
      industry: c.industry || 'Technology',
      location: c.headquarters_location || 'London',
      verified: c.is_verified || false
    }));
  }

  public async getCompanyBySlug(slug: string): Promise<Company | undefined> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) {
      return undefined;
    }

    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      logo: getProxyImageUrl(data.logo_url) || '🏢',
      description: data.description || '',
      website: data.website_url || '',
      size: data.size_band || '1-10',
      industry: data.industry || 'Technology',
      location: data.headquarters_location || 'London',
      verified: data.is_verified || false
    };
  }

  private async getCompanyById(id: string): Promise<Company | undefined> {
    const { data } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!data) return undefined;
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      logo: getProxyImageUrl(data.logo_url) || '🏢',
      description: data.description || '',
      website: data.website_url || '',
      size: data.size_band || '1-10',
      industry: data.industry || 'Technology',
      location: data.headquarters_location || 'London',
      verified: data.is_verified || false
    };
  }

  // Guides & Blog
  public async getGuides(): Promise<any[]> {
    const { data, error } = await supabase
      .from('guides')
      .select('*')
      .order('title');

    if (error || !data) {
      return [];
    }

    return data.map((g: any) => ({
      id: g.id,
      title: g.title,
      slug: g.slug,
      guideCategory: g.guide_category,
      contentHtml: g.content_html
    }));
  }

  public async getBlogPosts(): Promise<any[]> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('published_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((b: any) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt || '',
      featuredImageUrl: b.featured_image_url || '📊',
      status: b.status,
      contentHtml: b.content_html,
      createdAt: b.created_at,
      publishedAt: b.published_at
    }));
  }

  public async getBlogPostBySlug(slug: string): Promise<any | undefined> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) {
      return undefined;
    }

    return {
      id: data.id,
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || '',
      featuredImageUrl: data.featured_image_url || '📊',
      status: data.status,
      contentHtml: data.content_html,
      createdAt: data.created_at,
      publishedAt: data.published_at
    };
  }

  // Auth User Session (Synchronous Client Persistence)
  public getAuthUser(): { id: string; email: string; role: 'candidate' | 'recruiter' | 'admin' } | null {
    if (this.isClient) {
      const user = localStorage.getItem('ob_auth_user');
      return user ? JSON.parse(user) : null;
    }
    // SSR Fallback
    return null;
  }

  public setAuthUser(user: { id: string; email: string; role: 'candidate' | 'recruiter' | 'admin' } | null): void {
    if (this.isClient) {
      if (user) {
        localStorage.setItem('ob_auth_user', JSON.stringify(user));
        this.logAudit('User Login', `Logged in as ${user.email} (${user.role})`);
      } else {
        localStorage.removeItem('ob_auth_user');
        this.logAudit('User Logout', 'Session destroyed');
      }
    }
  }

  // Profiles
  public async getCandidateProfile(): Promise<UserProfile> {
    const user = this.getAuthUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: profile } = await supabase
      .from('candidate_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const { data: savedJobsData } = await supabase
      .from('saved_jobs')
      .select('job_id')
      .eq('user_id', user.id);

    const { data: consentsData } = await supabase
      .from('consent_records')
      .select('*')
      .eq('user_id', user.id);

    return {
      userId: user.id,
      email: user.email,
      role: 'candidate',
      name: profile ? `${profile.first_name} ${profile.last_name}`.trim() : 'Sarah Jenkins',
      headline: profile?.headline || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      website: profile?.website_url || '',
      linkedin: profile?.linkedin_url || '',
      availability: profile?.availability || 'immediate',
      minDayRate: profile?.min_day_rate ? Number(profile.min_day_rate) : undefined,
      maxDayRate: profile?.max_day_rate ? Number(profile.max_day_rate) : undefined,
      clearanceLevel: profile?.clearance_level || 'none',
      resumeName: profile?.resume_url || '',
      savedJobs: savedJobsData?.map((sj: any) => sj.job_id) || [],
      savedSearches: [],
      alerts: [],
      consent: consentsData?.map((c: any) => ({
        type: c.consent_type,
        granted: c.is_granted,
        ip: c.ip_address || '127.0.0.1',
        date: c.created_at
      })) || []
    };
  }

  public async saveCandidateProfile(profile: UserProfile): Promise<void> {
    const [firstName, ...lastNameParts] = profile.name.split(' ');
    const lastName = lastNameParts.join(' ') || ' ';

    // Ensure parent user exists
    await supabase.from('users').upsert({
      id: profile.userId,
      email: profile.email,
      role: 'candidate'
    });

    // 1. Save candidate profile fields
    const { error: profileError } = await supabase
      .from('candidate_profiles')
      .upsert({
        user_id: profile.userId,
        first_name: firstName,
        last_name: lastName,
        headline: profile.headline || null,
        bio: profile.bio || null,
        location: profile.location || null,
        website_url: profile.website || null,
        linkedin_url: profile.linkedin || null,
        availability: profile.availability,
        min_day_rate: profile.minDayRate || null,
        max_day_rate: profile.maxDayRate || null,
        clearance_level: profile.clearanceLevel,
        resume_url: profile.resumeName || null
      });

    if (profileError) {
      throw new Error(`Failed to save candidate profile: ${profileError.message}`);
    }

    // 2. Save saved jobs links
    await supabase.from('saved_jobs').delete().eq('user_id', profile.userId);
    if (profile.savedJobs.length > 0) {
      await supabase.from('saved_jobs').insert(
        profile.savedJobs.map(jobId => ({
          user_id: profile.userId,
          job_id: jobId
        }))
      );
    }

    // 3. Save GDPR consents
    if (profile.consent.length > 0) {
      for (const consent of profile.consent) {
        await supabase.from('consent_records').upsert({
          user_id: profile.userId,
          consent_type: consent.type,
          is_granted: consent.granted,
          ip_address: consent.ip
        });
      }
    }

    await this.logAudit('Profile Update', 'Candidate profile updated');
  }

  public async getRecruiterProfile(): Promise<RecruiterProfile> {
    const user = this.getAuthUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: profile } = await supabase
      .from('recruiter_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    return {
      userId: user.id,
      email: user.email,
      name: profile ? `${profile.first_name} ${profile.last_name}`.trim() : 'James Caan',
      phone: profile?.phone || '',
      companyId: profile?.company_id || ''
    };
  }

  public async saveRecruiterProfile(profile: RecruiterProfile): Promise<void> {
    const [firstName, ...lastNameParts] = profile.name.split(' ');
    const lastName = lastNameParts.join(' ') || ' ';

    // Ensure parent user exists
    await supabase.from('users').upsert({
      id: profile.userId,
      email: profile.email,
      role: 'recruiter'
    });

    const { error } = await supabase
      .from('recruiter_profiles')
      .upsert({
        user_id: profile.userId,
        first_name: firstName,
        last_name: lastName,
        phone: profile.phone || null,
        company_id: profile.companyId || null
      });

    if (error) {
      throw new Error(`Failed to save recruiter profile: ${error.message}`);
    }

    await this.logAudit('Profile Update', 'Recruiter profile updated');
  }

  // Applications
  public async getApplications(): Promise<Application[]> {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        jobs (
          title,
          companies (
            name
          )
        ),
        candidate_profiles (
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('Error fetching applications:', error?.message);
      return [];
    }

    return data.map((a: any) => ({
      id: a.id,
      jobId: a.job_id,
      jobTitle: a.jobs?.title || 'Unknown Job',
      companyName: a.jobs?.companies?.name || 'Unknown Company',
      userId: a.user_id,
      candidateName: a.candidate_profiles 
        ? `${a.candidate_profiles.first_name} ${a.candidate_profiles.last_name}`.trim() 
        : 'Sarah Jenkins',
      resumeUrl: a.resume_url,
      coverLetter: a.cover_letter || '',
      status: a.status,
      notes: a.recruiter_notes || '',
      createdAt: a.created_at
    }));
  }

  public async applyToJob(applicationData: Omit<Application, 'id' | 'createdAt' | 'status'>): Promise<Application> {
    const { data, error } = await supabase
      .from('applications')
      .insert({
        job_id: applicationData.jobId,
        user_id: applicationData.userId,
        resume_url: applicationData.resumeUrl,
        cover_letter: applicationData.coverLetter || null,
        status: 'applied'
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to apply to job: ${error?.message}`);
    }

    // Increment job applications count
    const { data: job } = await supabase
      .from('jobs')
      .select('applications_count')
      .eq('id', applicationData.jobId)
      .maybeSingle();

    if (job) {
      await supabase
        .from('jobs')
        .update({ applications_count: (job.applications_count || 0) + 1 })
        .eq('id', applicationData.jobId);
    }

    await this.logAudit('Job Application', `Applied to job: ${applicationData.jobTitle}`);

    return {
      id: data.id,
      jobId: data.job_id,
      jobTitle: applicationData.jobTitle,
      companyName: applicationData.companyName,
      userId: data.user_id,
      candidateName: applicationData.candidateName,
      resumeUrl: data.resume_url,
      coverLetter: data.cover_letter || '',
      status: data.status,
      createdAt: data.created_at
    };
  }

  public async updateApplicationStatus(appId: string, status: Application['status'], notes?: string): Promise<void> {
    const updates: Record<string, any> = { status };
    if (notes !== undefined) {
      updates.recruiter_notes = notes;
    }

    const { error } = await supabase
      .from('applications')
      .update(updates)
      .eq('id', appId);

    if (error) {
      throw new Error(`Failed to update application: ${error.message}`);
    }

    await this.logAudit('Application Review', `Updated application ${appId} status to: ${status}`);
  }

  // GDPR Actions
  public async deleteAccountData(): Promise<void> {
    const user = this.getAuthUser();
    if (!user) return;

    await this.logAudit('Account Deletion Requested', 'Purging all data for candidate');
    
    // Cascading deletes will remove profiles, saved_jobs, etc. in DB
    await supabase.from('users').delete().eq('id', user.id);
    
    if (this.isClient) {
      localStorage.removeItem('ob_profile');
      localStorage.removeItem('ob_auth_user');
    }
  }

  // Audit Logs
  public async getAuditLogs(): Promise<Array<{ id: string; action: string; date: string; ip: string }>> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !data) {
      return [];
    }

    return data.map((l: any) => ({
      id: l.id,
      action: l.action,
      date: l.created_at,
      ip: l.ip_address || '127.0.0.1'
    }));
  }

  public async logAudit(action: string, description: string): Promise<void> {
    const user = this.getAuthUser();
    await supabase.from('audit_logs').insert({
      user_id: user ? user.id : null,
      action: `${action}: ${description}`,
      ip_address: '192.168.1.1'
    });
  }

  public async deleteJob(id: string): Promise<void> {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete job: ${error.message}`);
    }

    await this.logAudit('Job Deleted', `Deleted job ID: ${id}`);
  }

  public async getPlatformUsers(): Promise<Array<{ id: string; email: string; name: string; role: string; status: string }>> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        role,
        is_active,
        candidate_profiles (
          first_name,
          last_name
        ),
        recruiter_profiles (
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('Error fetching users:', error?.message);
      return [];
    }

    return data.map((u: any) => {
      let name = 'System User';
      if (u.role === 'candidate' && u.candidate_profiles) {
        name = `${u.candidate_profiles.first_name} ${u.candidate_profiles.last_name}`.trim();
      } else if (u.role === 'recruiter' && u.recruiter_profiles) {
        name = `${u.recruiter_profiles.first_name} ${u.recruiter_profiles.last_name}`.trim();
      } else if (u.role === 'admin') {
        name = 'System Administrator';
      }
      return {
        id: u.id,
        email: u.email,
        name: name || u.email,
        role: u.role.toUpperCase(),
        status: u.is_active ? 'Active' : 'Inactive'
      };
    });
  }

  public async login(_email: string, _password: string): Promise<{ id: string; email: string; role: 'candidate' | 'recruiter' | 'admin' }> {
    throw new Error('Sign in on /login.');
  }

  public async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    }
    this.setAuthUser(null);
  }

  public async register(_email: string, _password: string, _role: 'candidate' | 'recruiter' | 'admin'): Promise<{ id: string; email: string; role: 'candidate' | 'recruiter' | 'admin' }> {
    throw new Error('Create an account on /register.');
  }

  public async uploadCV(file: File): Promise<string> {
    const user = this.getAuthUser();
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `cvs/${fileName}`;

    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      throw new Error(`Failed to upload CV: ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }
}

export const db = new SupabaseDB();
