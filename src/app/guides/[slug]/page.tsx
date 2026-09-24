import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getGuideBySlugServer } from '@/lib/server-data';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuideBySlugServer(slug);
  if (!guide) return { title: 'Guide not found' };
  return { title: `${guide.title} | OutsideIR35`, description: `Contractor guide: ${guide.title}` };
}

export default async function GuideDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const guide = await getGuideBySlugServer(slug);
  if (!guide) notFound();

  return (
    <div className="container fade-in" style={{ padding: '40px 0', maxWidth: '800px' }}>
      <Link href="/guides" style={{ display: 'inline-flex', marginBottom: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>&larr; Back to guides</Link>
      <article className="glass-panel" style={{ padding: '40px' }}>
        <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-header)', marginBottom: '16px' }}>{guide.title}</h1>
        <div className="job-description-content" style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: guide.content_html || guide.contentHtml || '' }} />
      </article>
    </div>
  );
}
