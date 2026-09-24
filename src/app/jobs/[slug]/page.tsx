import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import JobActions from '@/app/components/JobActions';
import { getDbRole } from '@/lib/auth-role';
import { formatDayRate, isSourcedJob } from '@/lib/platform';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const supabase = createClient(await cookies());
  const { data: job } = await supabase.from('jobs').select('title, expires_at').eq('slug', resolvedParams.slug).single();
  
  if (!job) return { title: 'Job Not Found' };

  const isExpired = job.expires_at && new Date(job.expires_at) < new Date();
  
  return {
    title: `${job.title} | Outside IR35`,
    robots: isExpired ? { index: false, follow: true } : { index: true, follow: true }
  };
}

export default async function JobDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  const { data: job } = await supabase
    .from('jobs')
    .select('*, companies(name, logo_url, slug, is_verified)')
    .eq('slug', slug)
    .single();

  if (!job) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Job posting not found</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '16px 0' }}>The posting may have expired or been removed.</p>
        <Link href="/jobs" className="btn btn-primary">Back to Contract Board</Link>
      </div>
    );
  }

  const company = Array.isArray(job.companies) ? job.companies[0] : job.companies;
  const isExpired = job.expires_at && new Date(job.expires_at) < new Date();

  const { data: similarJobsRaw } = await supabase
    .from('jobs')
    .select('id, title, slug, day_rate_min, day_rate_max, ir35_status')
    .eq('status', 'active')
    .eq('ir35_status', job.ir35_status)
    .neq('id', job.id)
    .limit(3);
  const similarJobs = similarJobsRaw || [];

  let isSaved = false;
  let hasApplied = false;
  let isCandidate = false;

  let resumeUrl = '';
  if (user) {
    const role = await getDbRole(supabase, user);
    isCandidate = role === 'candidate';

    if (isCandidate) {
      const [savedRes, appsRes, profileRes] = await Promise.all([
        supabase.from('saved_jobs').select('id').match({ user_id: user.id, job_id: job.id }).maybeSingle(),
        supabase.from('applications').select('id').match({ user_id: user.id, job_id: job.id }).maybeSingle(),
        supabase.from('candidate_profiles').select('resume_url').eq('user_id', user.id).maybeSingle()
      ]);
      
      isSaved = !!savedRes.data;
      hasApplied = !!appsRes.data;
      resumeUrl = profileRes.data?.resume_url || '';
    }
  }

  // Google JobPosting JSON-LD Structured Data
  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    'title': job.title,
    'description': job.description_html,
    'datePosted': job.created_at,
    'validThrough': job.expires_at,
    'employmentType': 'CONTRACTOR',
    'hiringOrganization': {
      '@type': 'Organization',
      'name': company?.name,
      'sameAs': `https://outsideir35.co.uk/companies/${company?.slug || job.company_id}`
    },
    'jobLocation': {
      '@type': 'Place',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': job.location,
        'addressCountry': 'GB'
      }
    },
    'baseSalary': {
      '@type': 'MonetaryAmount',
      'currency': 'GBP',
      'value': {
        '@type': 'QuantitativeValue',
        'minValue': job.day_rate_min,
        'maxValue': job.day_rate_max,
        'unitText': 'DAY'
      }
    }
  };

  return (
    <div className="container fade-in" style={{ padding: '40px 0' }}>
      {/* Schema injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      {/* Back Link */}
      <Link href="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '14px', color: 'var(--text-secondary)', transition: 'color 0.2s' }} className="hover-primary">
        &larr; Back to contract directory
      </Link>

      {/* Hero Header */}
      <div className="glass-panel" style={{ 
        padding: '48px', 
        marginBottom: '40px',
        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, rgba(30, 27, 75, 0.4) 100%)',
        border: '1px solid rgba(124, 58, 237, 0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background element */}
        <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)', opacity: 0.05, filter: 'blur(50px)', zIndex: 0 }}></div>
        
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '32px' }}>
          
          {/* Title & Company */}
          <div style={{ flex: '1 1 300px', minWidth: 0, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <span className={`tag-badge ${job.ir35_status === 'outside' ? 'tag-outside' : 'tag-inside'}`} style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.05em' }}>
                {job.ir35_status === 'outside' ? 'OUTSIDE IR35' : 'INSIDE IR35'}
              </span>
              {isSourcedJob(job) && (
                <span className="tag-badge tag-normal" style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '600' }}>
                  Sourced from LinkedIn
                </span>
              )}
              <span className="tag-badge tag-normal" style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '600' }}>
                Posted {new Date(job.created_at).toLocaleDateString('en-GB')}
              </span>
            </div>
            
            <h1 style={{ fontSize: '42px', fontFamily: 'var(--font-header)', marginTop: '0', marginBottom: '20px', lineHeight: '1.1', color: 'var(--text-primary)', letterSpacing: '-0.02em', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
              {job.title}
            </h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', background: 'var(--bg-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid var(--panel-border)' }}>
                {(company?.logo_url && (company.logo_url.startsWith('/') || company.logo_url.startsWith('http'))) ? (
                  <img src={company.logo_url} alt={`${company.name} logo`} style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'white' }} />
                ) : (
                  <span style={{ fontSize: '24px' }}>{company?.logo_url || '🏢'}</span>
                )}
              </div>
              <div>
                <Link href={`/companies/${company?.slug || job.company_id}`} className="job-company" style={{ fontWeight: '700', fontSize: '18px', color: 'var(--text-primary)', textDecoration: 'none' }}>
                  {company?.name}
                </Link>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {isSourcedJob(job) ? 'Sourced recruiter listing' : 'Hiring Client'}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & CTA */}
          <div style={{ 
            background: 'var(--panel-bg-solid)', 
            padding: '24px 32px', 
            borderRadius: '16px', 
            border: '1px solid var(--panel-border)',
            minWidth: '280px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Contract Rate</div>
            <div style={{ fontSize: '36px', fontFamily: 'var(--font-header)', fontWeight: '800', color: 'var(--color-primary)', lineHeight: '1' }}>
              {formatDayRate(job.day_rate_min, job.day_rate_max)}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: '24px' }}>per day</div>
            
            {isExpired ? (
              <div style={{ padding: '14px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', fontWeight: '600', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                This application has closed
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <JobActions 
                  jobId={job.id} 
                  isSaved={isSaved} 
                  hasApplied={hasApplied} 
                  isCandidate={isCandidate} 
                  resumeUrl={resumeUrl}
                  externalApplyUrl={job.external_apply_url}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main layout: 2 cols */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '40px' }} className="job-detail-grid">
        
        {/* Left Column: Job Details */}
        <div>
          {/* Quick Meta Indicators */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '40px'
          }}>
            <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Location</div>
                <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{job.location}</div>
              </div>
            </div>
            
            <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-outside)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Workspace</div>
                <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{job.remote_type?.toUpperCase() || 'HYBRID'}</div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Clearance</div>
                <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{job.clearance_level || 'None required'}</div>
              </div>
            </div>
            
            {job.expires_at && (
              <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Deadline</div>
                  <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{new Date(job.expires_at).toLocaleDateString('en-GB')}</div>
                </div>
              </div>
            )}
          </div>

          {/* Description & Rich Text */}
          <div className="glass-panel" style={{ padding: '40px', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-header)', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--panel-border)' }}>Role Description</h2>
            <div 
              className="job-description-content"
              style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '16px' }}
              dangerouslySetInnerHTML={{ __html: job.description_html || '' }}
            />
          </div>
        </div>

        {/* Right Column: Sticky Sidebar */}
        <div>
          <div className="glass-panel" style={{ padding: '32px', position: 'sticky', top: '24px' }}>
            <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-header)', marginBottom: '24px', color: 'var(--text-primary)' }}>About the Client</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '16px', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--panel-border)', overflow: 'hidden' }}>
                {(company?.logo_url && (company.logo_url.startsWith('/') || company.logo_url.startsWith('http'))) ? (
                  <img src={company.logo_url} alt={`${company.name} logo`} style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'white' }} />
                ) : (
                  <span style={{ fontSize: '40px' }}>{company?.logo_url || '🏢'}</span>
                )}
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '18px', color: 'var(--text-primary)', marginBottom: '4px' }}>{company?.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {isSourcedJob(job) ? 'Sourced recruiter — not a verified client' : company?.is_verified ? 'Verified company' : 'Hiring client'}
                </div>
              </div>
            </div>
            
            <Link href={`/companies/${company?.slug || job.company_id}`} className="btn btn-secondary" style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}>
              View Company Profile
            </Link>
            {isSourcedJob(job) && job.source_url && (
              <a href={job.source_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ width: '100%', textAlign: 'center', justifyContent: 'center', marginTop: '8px' }}>
                View original post
              </a>
            )}
            
            <hr style={{ border: 'none', borderTop: '1px solid var(--panel-border)', margin: '32px 0' }} />
            
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-primary)' }}>Similar Contracts</h3>
            {similarJobs.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No similar live roles right now.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {similarJobs.map((s: any) => (
                  <Link key={s.id} href={`/jobs/${s.slug}`} style={{ fontSize: '14px' }}>
                    {s.title}
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>£{s.day_rate_min}–£{s.day_rate_max} • {s.ir35_status}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
