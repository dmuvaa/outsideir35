'use strict';

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function GuideDetailsPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const slug = resolvedParams.slug;

  const [guide, setGuide] = useState<any>(null);

  useEffect(() => {
    db.getGuides().then(list => {
      const found = list.find((g: any) => g.slug === slug);
      if (found) {
        setGuide(found);
      }
    });
  }, [slug]);

  if (!guide) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Guide not found</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '16px 0' }}>The guide may have been updated or moved.</p>
        <Link href="/guides" className="btn btn-primary">Back to Guides</Link>
      </div>
    );
  }

  return (
    <div className="container fade-in" style={{ padding: '40px 0', maxWidth: '800px' }}>
      <Link href="/guides" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
        &larr; Back to guides index
      </Link>

      <article className="glass-panel" style={{ padding: '40px' }}>
        <header style={{ marginBottom: '32px' }}>
          <span className="tag-badge tag-clearance" style={{ marginBottom: '12px' }}>
            🇬🇧 STATUTORY REFERENCE
          </span>
          <h1 style={{ fontSize: '30px', fontFamily: 'var(--font-header)', marginBottom: '8px', lineHeight: '1.2' }}>
            {guide.title}
          </h1>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Category: {guide.guideCategory.toUpperCase()} &bull; Last updated for 2025/2026 tax year
          </div>
        </header>

        <hr style={{ borderColor: 'var(--panel-border)', marginBottom: '32px' }} />

        <div 
          className="guide-content"
          style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '15px' }}
          dangerouslySetInnerHTML={{ __html: guide.contentHtml }}
        />

        <hr style={{ borderColor: 'var(--panel-border)', margin: '40px 0' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Disclaimer: Guides are for informational reference only. Review specific terms with a Qdos inspector or tax advisor.
          </div>
          <Link href="/jobs" className="btn btn-primary btn-sm">
            Search Open Contracts
          </Link>
        </div>
      </article>
    </div>
  );
}
