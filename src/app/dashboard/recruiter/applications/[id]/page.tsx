import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import ApplicationStatusUpdater from './ApplicationStatusUpdater';

export default async function ApplicationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const applicationId = resolvedParams.id;

  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase.from('recruiter_profiles').select('company_id').eq('user_id', user.id).single();
  const companyId = profile?.company_id;

  if (!companyId) return <div>Unauthorized</div>;

  const { data: appData } = await supabase.from('applications')
    .select(`
      *,
      jobs!inner(title, company_id)
    `)
    .eq('id', applicationId)
    .single();

  if (!appData || appData.jobs.company_id !== companyId) {
    return <div className="container" style={{ padding: '40px' }}>Application not found or unauthorized.</div>;
  }

  const { data: candidateProfile } = await supabase.from('candidate_profiles')
    .select('user_id, first_name, last_name, bio')
    .eq('user_id', appData.user_id)
    .single();

  const candidate = candidateProfile || { first_name: 'Unknown', last_name: 'Candidate', user_id: appData.user_id, bio: '' };
  const job = Array.isArray(appData.jobs) ? appData.jobs[0] : appData.jobs;
  
  const app = { ...appData, candidate_profiles: candidateProfile };

  return (
    <div className="fade-in">
      <Link href="/dashboard/recruiter/applications" className="btn-text" style={{ marginBottom: '24px', display: 'inline-block' }}>
        &larr; Back to Pipeline
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        
        {/* Left Column: Application Content */}
        <div>
          <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontFamily: 'var(--font-header)', marginBottom: '8px' }}>
              Application for {job.title}
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Submitted on {new Date(app.created_at).toLocaleString()}
            </p>

            <h3 style={{ fontSize: '18px', marginBottom: '12px', borderBottom: '1px solid var(--panel-border)', paddingBottom: '8px' }}>Cover Letter</h3>
            {app.cover_letter ? (
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: 'var(--text-secondary)', background: 'var(--panel-bg-hover)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                {app.cover_letter}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No cover letter provided.</p>
            )}

            <h3 style={{ fontSize: '18px', marginTop: '32px', marginBottom: '12px', borderBottom: '1px solid var(--panel-border)', paddingBottom: '8px' }}>Resume / CV</h3>
            {app.resume_url ? (
              <div style={{ background: 'var(--panel-bg-hover)', padding: '16px', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'monospace' }}>📄 {app.resume_url.split('/').pop() || 'resume.pdf'}</span>
                <a href={app.resume_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                  View Document
                </a>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No resume attached.</p>
            )}
          </div>
        </div>

        {/* Right Column: Candidate Info & Actions */}
        <div>
          <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Candidate Details
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                {candidate.first_name} {candidate.last_name}
              </div>
              {candidate.bio && (
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  {candidate.bio.substring(0, 100)}...
                </div>
              )}
            </div>

            <Link href={`/candidates/${candidate.user_id}`} className="btn btn-secondary" style={{ width: '100%', textAlign: 'center' }}>
              View Full Profile
            </Link>
          </div>

          <ApplicationStatusUpdater 
            applicationId={app.id} 
            initialStatus={app.status} 
            initialNotes={app.recruiter_notes || ''} 
          />
        </div>
      </div>
    </div>
  );
}
