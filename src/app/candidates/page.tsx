import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPublicCandidatesServer } from '@/lib/server-data';

export const metadata: Metadata = {
  title: 'Contractor directory | OutsideIR35',
  description: 'Public contractor profiles available to recruiters on OutsideIR35.',
};

export default async function CandidatesPage() {
  const candidates = await getPublicCandidatesServer();

  return (
    <div className="container fade-in" style={{ padding: '40px 0' }}>
      <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-header)', marginBottom: '8px' }}>Contractor directory</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Profiles opted in as public. Recruiters can open a profile after signing in.
      </p>
      {candidates.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          No public contractor profiles yet.
        </div>
      ) : (
        <div className="card-grid">
          {candidates.map((c: any) => (
            <Link key={c.user_id} href={`/candidates/${c.user_id}`} className="glass-panel glass-panel-hover" style={{ padding: '24px', display: 'block' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '6px' }}>{c.first_name} {c.last_name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{c.headline || 'Contractor'}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '8px' }}>
                {c.location || 'UK'} {c.min_day_rate ? `• £${c.min_day_rate}+ /day` : ''}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
