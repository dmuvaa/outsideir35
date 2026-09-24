import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getBlogPostsServer } from '@/lib/server-data';

export const metadata: Metadata = {
  title: 'Contractor insights | OutsideIR35',
  description: 'IR35, tax, and contracting articles for UK limited company contractors.',
};

export default async function BlogPage() {
  const posts = await getBlogPostsServer();
  return (
    <div className="container fade-in" style={{ padding: '40px 0' }}>
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '36px', fontFamily: 'var(--font-header)' }}>Contractor Insights & News</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '600px', margin: '8px auto 0 auto' }}>
          IR35 updates, tax notes, and UK contracting practice.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
        {posts.map((post) => (
          <article key={post.id} className="glass-panel glass-panel-hover" style={{ padding: '24px', display: 'flex', flexDirection: 'column', minHeight: '220px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.4, flex: 1 }}>{post.excerpt}</p>
            <Link href={`/blog/${post.slug}`} style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '13px', marginTop: '16px' }}>Read article</Link>
          </article>
        ))}
      </div>
    </div>
  );
}
