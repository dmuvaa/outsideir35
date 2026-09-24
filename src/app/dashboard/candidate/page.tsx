import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { profileCompletionScore } from '@/lib/platform';

export default async function CandidateDashboard() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch data
  const [profileRes, savedJobsRes, appsRes] = await Promise.all([
    supabase.from('candidate_profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('saved_jobs').select('job_id, jobs(title, slug, day_rate_min, day_rate_max, ir35_status, companies(name, logo_url))').eq('user_id', user.id),
    supabase.from('applications').select('job_id, status, created_at, jobs(title, slug, companies(name, logo_url))').eq('user_id', user.id)
  ]);

  const profile = profileRes.data;
  const savedJobs = savedJobsRes.data || [];
  const applications = appsRes.data || [];

  const renderLogo = (url: string | null, name: string = 'Company') => {
    if (url && url.startsWith('http')) {
      return <img src={url} alt={`${name} logo`} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'contain', background: 'white' }} />;
    }
    return <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{url || '🏢'}</div>;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied':
      case 'pending': return 'var(--color-primary)';
      case 'reviewing': return 'var(--color-outside)';
      case 'interviewing':
      case 'interview': return '#eab308';
      case 'rejected': return 'var(--color-inside)';
      case 'offered':
      case 'offer': return '#10b981';
      default: return 'var(--text-muted)';
    }
  };

  const profileCompletion = profileCompletionScore(profile);

  return (
    <div className="container fade-in" style={{ padding: '40px 0', minHeight: '80vh' }}>
      
      {/* Hero Banner */}
      <div className="glass-panel" style={{ 
        padding: '40px', 
        marginBottom: '32px',
        background: 'linear-gradient(135deg, var(--color-primary) 0%, #4c1d95 100%)',
        border: 'none',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(124, 58, 237, 0.3)'
      }}>
        {/* Animated Mesh Gradient Background Simulation */}
        <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 60%)', opacity: 0.5, filter: 'blur(80px)', animation: 'pulse 8s infinite alternate', zIndex: 0 }}></div>
        <div style={{ position: 'absolute', bottom: '-50%', right: '-20%', width: '500px', height: '500px', background: 'radial-gradient(circle, var(--color-outside) 0%, transparent 60%)', opacity: 0.4, filter: 'blur(60px)', animation: 'pulse 10s infinite alternate-reverse', zIndex: 0 }}></div>
        
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '50%', 
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '32px', color: 'white', fontWeight: 'bold',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}>
            {(profile?.first_name?.[0] || user.email?.[0] || 'C').toUpperCase()}
          </div>
          
          <div>
            <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-header)', marginBottom: '8px', color: 'white', letterSpacing: '-0.02em', marginTop: 0 }}>
              Candidate Overview
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px', maxWidth: '600px', lineHeight: '1.5', margin: 0 }}>
              Welcome back, <strong style={{ color: 'white' }}>{profile?.first_name || user.email}</strong>. Track your active applications and manage your saved premium contracts.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ 
        display: 'grid', 
        gap: '24px', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        marginBottom: '48px' 
      }}>
        {/* Metric Card 1 */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '32px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Active Applications
              </span>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
            </div>
            <div style={{ fontSize: '40px', fontFamily: 'var(--font-header)', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1' }}>
              {applications.length}
            </div>
          </div>
          <Link href="#applications" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '24px', fontWeight: '500' }} className="hover-primary">
            View pipeline <span style={{ transition: 'transform 0.2s' }}>&rarr;</span>
          </Link>
        </div>

        {/* Metric Card 2 */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '32px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Saved Contracts
              </span>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-outside)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
              </div>
            </div>
            <div style={{ fontSize: '40px', fontFamily: 'var(--font-header)', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1' }}>
              {savedJobs.length}
            </div>
          </div>
          <Link href="#saved" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '24px', fontWeight: '500' }} className="hover-outside">
            Review saved roles <span>&rarr;</span>
          </Link>
        </div>

        {/* Metric Card 3 */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '32px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Profile Completion
              </span>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <div style={{ fontSize: '40px', fontFamily: 'var(--font-header)', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1' }}>
                {profileCompletion}%
              </div>
            </div>
            
            {/* Progress Bar */}
            <div style={{ width: '100%', height: '6px', background: 'var(--bg-color)', borderRadius: '3px', marginTop: '16px', overflow: 'hidden' }}>
              <div style={{ width: `${profileCompletion}%`, height: '100%', background: profileCompletion === 100 ? 'var(--color-outside)' : 'var(--color-primary)', transition: 'width 1s ease-out' }}></div>
            </div>
          </div>
          <Link href="/dashboard/candidate/settings" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '24px', fontWeight: '500' }}>
            {profileCompletion === 100 ? 'Profile up to date' : 'Complete profile'} <span>&rarr;</span>
          </Link>
        </div>
      </div>

      {/* Profile Snapshot */}
      {profile && (
        <section className="glass-panel" style={{ padding: '32px', marginBottom: '48px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-header)', margin: 0 }}>Profile Snapshot</h2>
            <Link href="/dashboard/candidate/settings" className="btn-text" style={{ fontSize: '14px', padding: '6px 12px' }}>Edit Profile</Link>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Headline</div>
              <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{profile.headline || 'Not set'}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Location</div>
              <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{profile.location || 'Not set'}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Rate Expectations</div>
              <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                {profile.min_day_rate ? `£${profile.min_day_rate}` : 'TBD'} {profile.max_day_rate ? `- £${profile.max_day_rate}` : ''} / day
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Availability</div>
              <div style={{ fontWeight: '500', color: 'var(--text-primary)', textTransform: 'capitalize' }}>{profile.availability?.replace('_', ' ') || 'Immediate'}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Clearance</div>
              <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{profile.clearance_level && profile.clearance_level !== 'none' ? profile.clearance_level : 'None'}</div>
            </div>
          </div>
          
          {profile.bio && (
            <div style={{ paddingTop: '16px', borderTop: '1px solid var(--panel-border)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Bio</div>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{profile.bio}</p>
            </div>
          )}
        </section>
      )}

      <div className="grid-dashboard-main">
        
        {/* Left Column: Applications */}
        <section id="applications">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-header)', margin: 0 }}>Recent Applications</h2>
          </div>
          
          {applications.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '32px 24px', borderStyle: 'dashed' }}>
              <div style={{ width: '80px', height: '80px', background: 'rgba(124, 58, 237, 0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--color-primary)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
              </div>
              <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Your application pipeline is empty</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>Start applying to high-paying Outside IR35 roles today to see them tracked here.</p>
              <Link href="/jobs" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '15px' }}>Explore Contracts</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {applications.map((app: any) => {
                const job = Array.isArray(app.jobs) ? app.jobs[0] : app.jobs;
                const company = Array.isArray(job?.companies) ? job?.companies[0] : job?.companies;
                
                return (
                  <Link href={`/jobs/${job?.slug}`} key={app.job_id} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="glass-panel glass-panel-hover" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                      {/* Company Logo */}
                      <div style={{ flexShrink: 0, width: '56px', height: '56px', borderRadius: '12px', background: 'var(--bg-color)', border: '1px solid var(--panel-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {(company?.logo_url && (company.logo_url.startsWith('/') || company.logo_url.startsWith('http'))) ? (
                          <img src={company.logo_url} alt={`${company.name} logo`} style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'white', padding: '4px' }} />
                        ) : (
                          <span style={{ fontSize: '24px' }}>{company?.logo_url || '🏢'}</span>
                        )}
                      </div>
                      
                      {/* Job Details */}
                      <div style={{ flexGrow: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <h4 style={{ margin: '0', fontSize: '18px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {job?.title || 'Unknown Role'}
                          </h4>
                          <span style={{ 
                            fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '100px', letterSpacing: '0.05em', textTransform: 'uppercase',
                            background: `rgba(${getStatusColor(app.status) === 'var(--color-primary)' ? '124, 58, 237' : getStatusColor(app.status) === 'var(--color-outside)' ? '16, 185, 129' : getStatusColor(app.status) === '#eab308' ? '234, 179, 8' : getStatusColor(app.status) === '#10b981' ? '16, 185, 129' : '239, 68, 68'}, 0.1)`,
                            color: getStatusColor(app.status),
                            border: `1px solid rgba(${getStatusColor(app.status) === 'var(--color-primary)' ? '124, 58, 237' : getStatusColor(app.status) === 'var(--color-outside)' ? '16, 185, 129' : getStatusColor(app.status) === '#eab308' ? '234, 179, 8' : getStatusColor(app.status) === '#10b981' ? '16, 185, 129' : '239, 68, 68'}, 0.2)`
                          }}>
                            {app.status}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                            {company?.name}
                          </div>
                          {job?.day_rate_min && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
                              £{job.day_rate_min} - £{job.day_rate_max}/day
                            </div>
                          )}
                          <div style={{ color: 'var(--text-muted)' }}>
                            Applied {new Date(app.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Right Column: Saved Contracts */}
        <section id="saved">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-header)', margin: 0 }}>Saved Contracts</h2>
          </div>
          
          {savedJobs.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '32px 24px', borderStyle: 'dashed' }}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--color-outside)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Bookmark contracts to review them later.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {savedJobs.map((saved: any) => {
                const job = Array.isArray(saved.jobs) ? saved.jobs[0] : saved.jobs;
                const company = Array.isArray(job?.companies) ? job?.companies[0] : job?.companies;
                
                return (
                  <div key={saved.job_id} className="glass-panel glass-panel-hover" style={{ padding: '16px', position: 'relative' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg-color)', border: '1px solid var(--panel-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                        {(company?.logo_url && (company.logo_url.startsWith('/') || company.logo_url.startsWith('http'))) ? (
                          <img src={company.logo_url} alt={`${company.name} logo`} style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'white' }} />
                        ) : (
                          <span style={{ fontSize: '20px' }}>{company?.logo_url || '🏢'}</span>
                        )}
                      </div>
                      <div style={{ minWidth: 0, flexGrow: 1 }}>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <Link href={`/jobs/${job?.slug}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }} className="hover-primary">{job?.title || 'Unknown Role'}</Link>
                        </h4>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{company?.name}</span>
                          <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>£{job?.day_rate_min}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
