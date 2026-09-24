import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import JobDeleteButton from './JobDeleteButton';

export default async function RecruiterJobsPage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase.from('recruiter_profiles').select('company_id').eq('user_id', user.id).single();
  const companyId = profile?.company_id;

  let jobs: any[] = [];
  if (companyId) {
    const { data } = await supabase.from('jobs')
      .select('id, title, status, created_at, day_rate_min, day_rate_max, applications(id)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    jobs = data || [];
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-header)' }}>My Contracts</h1>
        <Link href="/dashboard/recruiter/jobs/new" className="btn btn-primary">
          + Create New Contract
        </Link>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--panel-bg-hover)', borderBottom: '1px solid var(--panel-border)' }}>
              <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>Job Title</th>
              <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>Status</th>
              <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>Rate</th>
              <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>Applications</th>
              <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No contract jobs found.
                </td>
              </tr>
            ) : (
              jobs.map(job => (
                <tr key={job.id} style={{ borderBottom: '1px solid var(--panel-border)' }}>
                  <td style={{ padding: '16px', fontWeight: '500' }}>{job.title}</td>
                  <td style={{ padding: '16px' }}>
                    <span className={`tag-badge ${job.status === 'active' ? 'tag-outside' : job.status === 'draft' ? 'tag-normal' : 'tag-inside'}`}>
                      {job.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>£{job.day_rate_min} - £{job.day_rate_max}</td>
                  <td style={{ padding: '16px', fontWeight: 'bold' }}>{job.applications?.length || 0}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link href={`/dashboard/recruiter/jobs/${job.id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                      <JobDeleteButton jobId={job.id} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
