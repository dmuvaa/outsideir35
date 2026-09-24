import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getGuidesServer } from '@/lib/server-data';

export const metadata: Metadata = {
  title: 'Contractor guides | OutsideIR35',
  description: 'IR35, tax, clearance, and limited company guides for UK contractors.',
};

export default async function GuidesPage() {
  const guides = await getGuidesServer();
  return (
    <div className="container fade-in" style={{ padding: '40px 0' }}>
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '36px', fontFamily: 'var(--font-header)' }}>Contractor Compliance & Tax Guides</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '600px', margin: '8px auto 0 auto' }}>
          IR35 status, clearance, and business setup notes.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
        {guides.map((guide: any) => (
          <article key={guide.id} className="glass-panel glass-panel-hover" style={{ padding: '24px', minHeight: '200px', display: 'flex', flexDirection: 'column' }}>
            <span className="tag-badge tag-clearance" style={{ alignSelf: 'flex-start', marginBottom: '16px' }}>
              {(guide.guide_category || guide.guideCategory || 'guide').toString().toUpperCase()}
            </span>
            <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>
              <Link href={`/guides/${guide.slug}`}>{guide.title}</Link>
            </h3>
            <Link href={`/guides/${guide.slug}`} style={{ marginTop: 'auto', color: 'var(--color-primary)', fontWeight: 600, fontSize: '13px' }}>
              Open guide
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
