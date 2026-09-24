import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { getDbRole } from '@/lib/auth-role';

export default async function CandidateProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: candidateId } = await params;
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from('candidate_profiles').select('*').eq('user_id', candidateId).maybeSingle();
  if (!profile) {
    return <div className="container" style={{ padding: '40px', textAlign: 'center' }}>Profile not found.</div>;
  }

  const role = user ? await getDbRole(supabase, user) : null;
  const isOwner = user?.id === candidateId;
  const canSeePrivate = isOwner || role === 'admin' || role === 'recruiter';
  const isPublic = profile.is_profile_public;

  if (!isPublic && !canSeePrivate) {
    return (
      <div className="container" style={{ padding: '40px', textAlign: 'center' }}>
        This profile is private. <Link href="/login">Sign in</Link> as a recruiter if you have access.
      </div>
    );
  }

  return (
    <div className="container fade-in" style={{ padding: '60px 0' }}>
      <Link href={role === 'recruiter' ? '/dashboard/recruiter/applications' : '/candidates'} className="btn-text" style={{ marginBottom: '24px', display: 'inline-block' }}>
        &larr; Back
      </Link>

      <div className="glass-panel" style={{ padding: '40px', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '36px', fontFamily: 'var(--font-header)', marginBottom: '8px' }}>
          {profile.first_name} {profile.last_name}
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>{profile.headline || 'Contractor'}</p>
        <div style={{ display: 'flex', gap: '24px', marginTop: '24px', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
          {profile.location && <div>{profile.location}</div>}
          {profile.min_day_rate && <div>£{profile.min_day_rate}{profile.max_day_rate ? `–£${profile.max_day_rate}` : '+'} / day</div>}
          {profile.clearance_level && profile.clearance_level !== 'none' && <div>Clearance: {profile.clearance_level}</div>}
        </div>
        {profile.bio && <p style={{ marginTop: '24px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{profile.bio}</p>}
        <div style={{ display: 'flex', gap: '16px', marginTop: '24px', flexWrap: 'wrap' }}>
          {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
          {profile.website_url && <a href={profile.website_url} target="_blank" rel="noopener noreferrer">Website</a>}
          {profile.github_url && <a href={profile.github_url} target="_blank" rel="noopener noreferrer">GitHub</a>}
        </div>
        {canSeePrivate && profile.resume_url && (
          <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ marginTop: '24px' }}>
            Download CV
          </a>
        )}
      </div>
    </div>
  );
}
