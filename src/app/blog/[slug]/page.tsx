import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getBlogPostBySlugServer } from '@/lib/server-data';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlugServer(slug);
  if (!post) return { title: 'Article not found' };
  return { title: `${post.title} | OutsideIR35`, description: post.excerpt };
}

export default async function BlogPostDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlugServer(slug);
  if (!post) notFound();

  return (
    <div className="container fade-in" style={{ padding: '40px 0', maxWidth: '800px' }}>
      <Link href="/blog" style={{ display: 'inline-flex', marginBottom: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>&larr; Back to blog</Link>
      <article className="glass-panel" style={{ padding: '40px' }}>
        <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-header)', marginBottom: '16px' }}>{post.title}</h1>
        <div className="job-description-content" style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: post.contentHtml || '' }} />
      </article>
    </div>
  );
}
