'use strict';

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';

export default function GuidesPage() {
  const [guides, setGuides] = useState<any[]>([]);

  useEffect(() => {
    db.getGuides().then(setGuides);
  }, []);

  return (
    <div className="container fade-in" style={{ padding: '40px 0' }}>
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '36px', fontFamily: 'var(--font-header)' }}>Contractor Compliance & Tax Guides</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '600px', margin: '8px auto 0 auto' }}>
          Your central repository for IR35 status definitions, government security clearance rules, and business setups.
        </p>
      </div>

      {/* Grid of guides */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
        {guides.map((guide) => (
          <article key={guide.id} className="glass-panel glass-panel-hover" style={{ padding: '24px', display: 'flex', flexDirection: 'column', minHeight: '220px' }}>
            <span className="tag-badge tag-clearance" style={{ alignSelf: 'flex-start', marginBottom: '16px' }}>
              📚 {guide.guideCategory.toUpperCase()} GUIDE
            </span>
            <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '12px', lineHeight: '1.3' }}>
              <Link href={`/guides/${guide.slug}`}>{guide.title}</Link>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.4', marginBottom: '20px' }}>
              Learn essential requirements, regulatory frameworks, and audit checklists.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'flex-end' }}>
              <Link href={`/guides/${guide.slug}`} style={{ color: 'var(--color-primary)', fontWeight: '600', fontSize: '13px' }}>
                Open Guide &raquo;
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
