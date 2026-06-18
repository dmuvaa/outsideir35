'use strict';

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogPostDetailsPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const slug = resolvedParams.slug;

  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    db.getBlogPostBySlug(slug).then(foundPost => {
      if (foundPost) {
        setPost(foundPost);
      }
    });
  }, [slug]);

  if (!post) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Article not found</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '16px 0' }}>The article may have been archived.</p>
        <Link href="/blog" className="btn btn-primary">Back to Blog</Link>
      </div>
    );
  }

  return (
    <div className="container fade-in" style={{ padding: '40px 0', maxWidth: '800px' }}>
      <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
        &larr; Back to blog list
      </Link>

      <article className="glass-panel" style={{ padding: '40px' }}>
        <header style={{ marginBottom: '32px', textAlign: 'center' }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>{post.featuredImageUrl}</span>
          <span className="tag-badge tag-outside" style={{ marginBottom: '12px' }}>
            Tax & Legal Compliance
          </span>
          <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-header)', marginBottom: '8px', lineHeight: '1.2' }}>
            {post.title}
          </h1>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Published on {new Date(post.createdAt).toLocaleDateString('en-GB')} &bull; Author: System Compliance Editor
          </div>
        </header>

        <hr style={{ borderColor: 'var(--panel-border)', marginBottom: '32px' }} />

        <div 
          className="blog-content"
          style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '15px' }}
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        <hr style={{ borderColor: 'var(--panel-border)', margin: '40px 0' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Was this article helpful? Complying with HMRC requires continuous updates.
          </div>
          <Link href="/guides" className="btn btn-secondary btn-sm">
            Browse Compliance Guides &raquo;
          </Link>
        </div>
      </article>
    </div>
  );
}
