import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function RecruiterDashboard() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch recruiter profile to get company_id
  const { data: profile } = await supabase.from('recruiter_profiles').select('*, companies(name, logo_url, description, website_url)').eq('user_id', user.id).single();
  
  const companyId = profile?.company_id;
  const company = Array.isArray(profile?.companies) ? profile.companies[0] : profile?.companies;

  let jobs: any[] = [];
  let applications: any[] = [];

  if (companyId) {
    // Fetch jobs for this company
    const { data: jobsData } = await supabase.from('jobs').select('id, title, status, created_at, expires_at').eq('company_id', companyId);
    jobs = jobsData || [];
    
    // Fetch applications for these jobs
    if (jobs.length > 0) {
      const jobIds = jobs.map((j: any) => j.id);
      
      // Fetch applications without candidate_profiles join
      const { data: appsData } = await supabase.from('applications').select('id, job_id, user_id, status, created_at').in('job_id', jobIds);
      applications = appsData || [];
      
      if (applications.length > 0) {
        // Fetch candidate profiles separately
        const userIds = applications.map(a => a.user_id);
        const { data: profilesData } = await supabase.from('candidate_profiles').select('user_id, first_name, last_name').in('user_id', userIds);
        
        // Manually attach profiles
        applications = applications.map(app => ({
          ...app,
          candidate_profiles: profilesData?.find(p => p.user_id === app.user_id) || null
        }));
      }
    }
  }

  const activeJobs = jobs.filter(j => j.status === 'active');

  const profileIncomplete = !company?.description || !company?.website_url;

  return (
    <div className="container fade-in" style={{ padding: '60px 0', minHeight: '80vh' }}>
      
      {profileIncomplete && (
        <div style={{ background: '#fff3cd', color: '#856404', padding: '16px', borderRadius: 'var(--radius-sm)', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>⚠️ Incomplete Profile:</strong> You must complete your company profile before posting new contracts.
          </div>
          <Link href="/dashboard/recruiter/settings" className="btn btn-sm btn-secondary">
            Complete Profile
          </Link>
        </div>
      )}

      {/* Hero Banner */}
      <div className="glass-panel" style={{ 
        padding: '40px', 
        marginBottom: '32px',
        background: 'linear-gradient(135deg, var(--color-outside-glow) 0%, transparent 100%)',
        borderLeft: '4px solid var(--color-outside)'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: '600' }}>
              Employer Portal
            </span>
            <h1 style={{ fontSize: '36px', fontFamily: 'var(--font-header)', marginBottom: '8px', color: 'var(--text-primary)' }}>
              {company ? company.name : 'Recruiter'} Dashboard
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '18px', maxWidth: '600px' }}>
              Welcome back, <strong>{profile?.first_name || user.email}</strong>! Manage your active contract listings and review incoming candidates.
            </p>
          </div>
          <div>
            <Link href="/dashboard/recruiter/jobs/new" className="btn btn-primary">
              + Post New Contract
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ 
        display: 'grid', 
        gap: '24px', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        marginBottom: '40px' 
      }}>
        {/* Metric Card 1 */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Active Listings
          </span>
          <span style={{ fontSize: '48px', fontFamily: 'var(--font-header)', fontWeight: '800', color: 'var(--color-primary)' }}>
            {activeJobs.length}
          </span>
          <Link href="#listings" style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'underline' }}>
            Manage listings &rarr;
          </Link>
        </div>

        {/* Metric Card 2 */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Candidates
          </span>
          <span style={{ fontSize: '48px', fontFamily: 'var(--font-header)', fontWeight: '800', color: 'var(--color-outside)' }}>
            {applications.length}
          </span>
          <Link href="#candidates" style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'underline' }}>
            Review pipeline &rarr;
          </Link>
        </div>

        {/* Metric Card 3 */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', opacity: companyId ? 1 : 0.5 }}>
          <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Company Profile
          </span>
          <span style={{ fontSize: '48px', fontFamily: 'var(--font-header)', fontWeight: '800', color: 'var(--text-primary)' }}>
            {companyId ? 'Live' : 'Pending'}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {companyId ? 'Company profile is linked.' : 'Please complete your company profile.'}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid-dashboard-main">
        
        {/* Job Listings Section */}
        <section id="listings" className="glass-panel" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px', fontFamily: 'var(--font-header)' }}>Your Active Contracts</h2>
          
          {jobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-color)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '32px', marginBottom: '16px', display: 'block' }}>💼</span>
              <p style={{ color: 'var(--text-muted)' }}>You don't have any active job listings.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {jobs.map((job: any) => {
                const jobApps = applications.filter(a => a.job_id === job.id);
                return (
                  <Link href={`/dashboard/recruiter/jobs/${job.id}/edit`} key={job.id} style={{ 
                    padding: '16px', border: '1px solid var(--panel-border)', borderRadius: 'var(--radius-sm)',
                    background: 'var(--panel-bg-solid)', display: 'block', textDecoration: 'none', color: 'inherit'
                  }} className="glass-panel-hover">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{job.title}</h4>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Posted: {new Date(job.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="tag-badge tag-outside">{jobApps.length} Candidates</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Recent Candidates Section */}
        <section id="candidates" className="glass-panel" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px', fontFamily: 'var(--font-header)' }}>Recent Applications</h2>
          
          {applications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-color)', borderRadius: 'var(--radius-sm)' }}>
              <p style={{ color: 'var(--text-muted)' }}>No recent applications to display.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {applications.slice(0, 5).map((app: any) => {
                const candidate = Array.isArray(app.candidate_profiles) ? app.candidate_profiles[0] : app.candidate_profiles;
                const job = jobs.find(j => j.id === app.job_id);
                
                return (
                  <Link href={`/dashboard/recruiter/applications/${app.id}`} key={app.id} style={{ 
                    padding: '12px 16px', border: '1px solid var(--panel-border)', borderRadius: 'var(--radius-sm)',
                    background: 'var(--panel-bg-solid)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    textDecoration: 'none', color: 'inherit'
                  }} className="glass-panel-hover">
                    <div>
                      <h5 style={{ margin: '0 0 4px 0', fontSize: '14px', color: 'var(--text-primary)' }}>
                        {candidate ? `${candidate.first_name} ${candidate.last_name}` : 'Private Profile'}
                      </h5>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Applied for: {job?.title || 'Unknown Role'}
                      </span>
                    </div>
                    <span className="tag-badge tag-normal" style={{ fontSize: '10px' }}>{app.status}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>

    </div>
  );
}
