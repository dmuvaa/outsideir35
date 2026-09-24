import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCompanyBySlugServer, getJobsServer } from '@/lib/server-data';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyBySlugServer(slug);
  if (!company) return { title: 'Company not found' };
  return {
    title: `${company.name} contracts | OutsideIR35`,
    description: company.description?.slice(0, 160) || `Live contractor roles from ${company.name}.`,
  };
}

export default async function CompanyDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const company = await getCompanyBySlugServer(slug);
  if (!company) notFound();

  const jobs = (await getJobsServer()).filter((j) => j.companyId === company.id);
  const outsideRatio = jobs.length
    ? Math.round((jobs.filter((j) => j.ir35Status === 'outside').length / jobs.length) * 100)
    : 0;

  return (
    <div className="container fade-in" style={{ padding: '40px 0' }}>
      <Link href="/companies" style={{ display: 'inline-flex', marginBottom: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
        &larr; Back to directory
      </Link>

      <div className="glass-panel" style={{ padding: '32px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '64px', width: '120px', height: '120px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            {company.logo && (company.logo.startsWith('/') || company.logo.startsWith('http')) ? (
              <img src={company.logo} alt={company.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (company.logo || '🏢')}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-header)' }}>{company.name}</h1>
              {company.verified && <span className="tag-badge tag-outside">Verified</span>}
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>{company.industry} {company.location ? `• ${company.location}` : ''}</p>
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '13px' }}>
                Visit website
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="seo-two-col" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
        <div>
          <div className="glass-panel" style={{ padding: '32px', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>About {company.name}</h2>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: company.description || 'No company description yet.' }} />
          </div>
          <h2 style={{ fontSize: '22px', marginBottom: '16px' }}>Active contract roles</h2>
          {jobs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {jobs.map((job) => (
                <div key={job.id} className="glass-panel glass-panel-hover job-card">
                  <h3 className="job-title"><Link href={`/jobs/${job.slug}`}>{job.title}</Link></h3>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{job.location} • {job.remoteType}</div>
                  <div className="job-tags-row" style={{ marginTop: '12px' }}>
                    <span className={`tag-badge ${job.ir35Status === 'outside' ? 'tag-outside' : 'tag-inside'}`}>
                      {job.ir35Status === 'outside' ? 'Outside IR35' : 'Inside IR35'}
                    </span>
                    <span className="tag-badge tag-normal">£{job.dayRateMin}-{job.dayRateMax}/day</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No live contract postings for this company.</p>
            </div>
          )}
        </div>
        <aside>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Listing stats</h3>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ACTIVE ROLES</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary)' }}>{jobs.length}</div>
            <hr style={{ borderColor: 'var(--panel-border)', margin: '16px 0' }} />
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>OUTSIDE IR35 SHARE</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-outside)' }}>{jobs.length ? `${outsideRatio}%` : '—'}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
