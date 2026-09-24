'use client';

import React, { useState } from 'react';
import { archiveJobAsAdmin, setCompanyVerified } from '@/app/actions/admin';

export default function AdminTools({ jobs, companies }: { jobs: any[]; companies: any[] }) {
  const [message, setMessage] = useState('');

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      {message && <p style={{ color: 'var(--color-outside)' }}>{message}</p>}
      <section className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Recent jobs</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {jobs.map((job) => {
            const company = Array.isArray(job.companies) ? job.companies[0] : job.companies;
            return (
              <div key={job.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{job.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{company?.name} • {job.status} • {job.ir35_status}</div>
                </div>
                {job.status !== 'archived' && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={async () => {
                      const res = await archiveJobAsAdmin(job.id);
                      setMessage(res.error || 'Job archived');
                    }}
                  >
                    Archive
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>
      <section className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Companies</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {companies.map((c) => (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{c.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.is_verified ? 'Verified' : 'Unverified'}</div>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={async () => {
                  const res = await setCompanyVerified(c.id, !c.is_verified);
                  setMessage(res.error || 'Company updated');
                }}
              >
                {c.is_verified ? 'Remove verified' : 'Mark verified'}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
