'use strict';

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db, Company } from '@/lib/db';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    db.getCompanies().then(setCompanies);
  }, []);

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase()) ||
    c.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container fade-in" style={{ padding: '40px 0' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-header)' }}>Company Directory</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Explore corporations and agencies offering Outside & Inside IR35 engagements.
        </p>
      </div>

      {/* Directory Search Field */}
      <div className="glass-panel" style={{ padding: '16px 24px', marginBottom: '32px' }}>
        <input
          type="text"
          placeholder="Filter by company name, sector, or headquarters..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', fontSize: '15px' }}
        />
      </div>

      {/* Grid List */}
      <div className="card-grid">
        {filteredCompanies.map((c) => (
          <div key={c.id} className="glass-panel glass-panel-hover" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <span style={{ fontSize: '36px', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
                  {c.logo}
                </span>
                {c.verified && (
                  <span className="tag-badge tag-outside" style={{ fontSize: '10px' }}>
                    Verified Employer
                  </span>
                )}
              </div>
              
              <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                <Link href={`/companies/${c.slug}`}>{c.name}</Link>
              </h3>
              
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                📍 {c.location} &bull; 💼 {c.industry}
              </div>
              
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '20px' }}>
                {c.description.substring(0, 100)}...
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '16px', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Size: {c.size} employees</span>
              <Link href={`/companies/${c.slug}`} style={{ color: 'var(--color-primary)', fontSize: '13px', fontWeight: '600' }}>
                View Profile &raquo;
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
