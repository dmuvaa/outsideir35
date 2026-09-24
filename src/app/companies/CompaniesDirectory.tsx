'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function CompaniesDirectory({ companies }: { companies: any[] }) {
  const [search, setSearch] = useState('');
  const filtered = companies.filter((c) =>
    `${c.name} ${c.industry} ${c.location}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container fade-in" style={{ padding: '40px 0' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-header)' }}>Company Directory</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Employers and agencies currently listed on OutsideIR35.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '16px 24px', marginBottom: '32px' }}>
        <input
          type="text"
          placeholder="Filter by company name, sector, or headquarters..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', fontSize: '15px' }}
        />
      </div>

      <div className="card-grid">
        {filtered.map((c) => (
          <div key={c.id} className="glass-panel glass-panel-hover" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <span style={{ fontSize: '36px', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px' }}>
                  {c.logo && (c.logo.startsWith('/') || c.logo.startsWith('http')) ? (
                    <img src={c.logo} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    c.logo || '🏢'
                  )}
                </span>
                {c.verified && <span className="tag-badge tag-outside">Verified</span>}
              </div>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>
                <Link href={`/companies/${c.slug}`}>{c.name}</Link>
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{c.industry} {c.location ? `• ${c.location}` : ''}</p>
            </div>
            <Link href={`/companies/${c.slug}`} style={{ color: 'var(--color-primary)', fontSize: '13px', fontWeight: '600' }}>
              View profile
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
