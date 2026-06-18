'use strict';

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    db.getBlogPosts().then(setPosts);
  }, []);

  return (
    <div className="container fade-in" style={{ padding: '40px 0' }}>
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '36px', fontFamily: 'var(--font-header)' }}>Contractor Insights & News</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '600px', margin: '8px auto 0 auto' }}>
          Stay up to date with IR35 compliance updates, corporate tax optimization guidelines, and UK contracting trends.
        </p>
      </div>

      {/* Grid of posts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
        {posts.map((post) => (
          <article key={post.id} className="glass-panel glass-panel-hover" style={{ padding: '24px', display: 'flex', flexDirection: 'column', minHeight: '280px' }}>
            <span style={{ fontSize: '36px', marginBottom: '16px' }}>{post.featuredImageUrl}</span>
            <span className="tag-badge tag-normal" style={{ alignSelf: 'flex-start', marginBottom: '12px' }}>
              Tax & Legal
            </span>
            <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '8px', lineHeight: '1.3' }}>
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.4', marginBottom: '24px' }}>
              {post.excerpt}
            </p>
            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--panel-border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span>📅 {new Date(post.createdAt).toLocaleDateString('en-GB')}</span>
              <Link href={`/blog/${post.slug}`} style={{ color: 'var(--color-primary)', fontWeight: '600' }}>
                Read Article &raquo;
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
