import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function ApplicationsPipelinePage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase.from('recruiter_profiles').select('company_id').eq('user_id', user.id).single();
  const companyId = profile?.company_id;

  let applications: any[] = [];
  if (companyId) {
    // We need to fetch all applications where the job's company_id == companyId
    const { data: jobs } = await supabase.from('jobs').select('id').eq('company_id', companyId);
    if (jobs && jobs.length > 0) {
      const jobIds = jobs.map(j => j.id);
      const { data: appsData } = await supabase.from('applications')
        .select(`
          id, status, created_at, user_id,
          jobs(title, slug)
        `)
        .in('job_id', jobIds)
        .order('created_at', { ascending: false });
        
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

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-header)' }}>Applications Pipeline</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your incoming candidates across all active roles.</p>
        </div>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--panel-bg-hover)', borderBottom: '1px solid var(--panel-border)' }}>
              <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>Candidate</th>
              <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>Applied For</th>
              <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>Date</th>
              <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>Status</th>
              <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No applications received yet.
                </td>
              </tr>
            ) : (
              applications.map(app => {
                const candidate = Array.isArray(app.candidate_profiles) ? app.candidate_profiles[0] : app.candidate_profiles;
                const job = Array.isArray(app.jobs) ? app.jobs[0] : app.jobs;
                
                return (
                  <tr key={app.id} style={{ borderBottom: '1px solid var(--panel-border)' }}>
                    <td style={{ padding: '16px', fontWeight: '500' }}>
                      {candidate ? `${candidate.first_name} ${candidate.last_name}` : 'Unknown Candidate'}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                      {job?.title || 'Unknown Role'}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span className={`tag-badge ${app.status === 'offered' ? 'tag-outside' : app.status === 'rejected' ? 'tag-inside' : 'tag-normal'}`}>
                        {app.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <Link href={`/dashboard/recruiter/applications/${app.id}`} className="btn btn-primary btn-sm">
                        Review
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
