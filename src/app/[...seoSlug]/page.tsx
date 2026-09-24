import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getJobsServer } from '@/lib/server-data';
import { companyHref, jobMatchesSeoIntent, parseSeoIntent, seoCopy } from '@/lib/platform';

interface PageProps {
  params: Promise<{ seoSlug: string[] }>;
}

function rawSlugFrom(params: { seoSlug: string[] }) {
  return params.seoSlug.join('/');
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await params;
  const intent = parseSeoIntent(rawSlugFrom(resolved));
  const jobs = await getJobsServer();
  const matched = jobs.filter((job) => jobMatchesSeoIntent(job, intent));
  const copy = seoCopy(intent, matched.length);
  return {
    title: copy.title,
    description: copy.description,
  };
}

export default async function ProgrammaticSeoPage({ params }: PageProps) {
  const resolved = await params;
  const rawSlug = rawSlugFrom(resolved);
  const intent = parseSeoIntent(rawSlug);
  const jobs = await getJobsServer();
  const matchedJobs = jobs.filter((job) => jobMatchesSeoIntent(job, intent));
  const copy = seoCopy(intent, matchedJobs.length);
  const skillsList = ['React', 'Python', 'AWS', 'SAP', 'Power BI'];
  const locationsList = ['London', 'Manchester', 'Bristol', 'Birmingham', 'Glasgow'];

  const faqs = [
    {
      q: `Are ${intent.skill || intent.sector || 'contract'} roles ${intent.location ? `in ${intent.location}` : 'in the UK'} typically Outside IR35?`,
      a: 'IR35 depends on working practices, not the job title. Roles with substitution, limited control, and deliverables-based work are more often determined Outside IR35. Listings here show the status the recruiter attested.',
    },
    {
      q: `What is the average day rate for ${intent.skill || intent.sector || 'contract'} roles?`,
      a: matchedJobs.length
        ? `Live rates on this page currently range from £${Math.min(...matchedJobs.map((j) => j.dayRateMin || 0))} to £${Math.max(...matchedJobs.map((j) => j.dayRateMax || 0))} per day.`
        : 'Rates vary by skill, clearance, and location. Open the full board to compare live day rates.',
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div className="container fade-in" style={{ padding: '40px 0' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        <Link href="/">Home</Link> &rsaquo; <Link href="/jobs">Contracts</Link> &rsaquo; <span style={{ color: 'var(--text-secondary)' }}>{copy.heading}</span>
      </div>

      <section className="glass-panel" style={{ padding: '32px', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-header)', marginBottom: '12px' }}>{copy.heading}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: '1.6', marginBottom: '24px' }}>{copy.intro}</p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link href={`/jobs?q=${encodeURIComponent(intent.skill || intent.sector)}&ir35=${intent.ir35 || 'outside'}`} className="btn btn-primary btn-sm">
            Open live filters
          </Link>
          <Link href="/guides/what-is-ir35-guide" className="btn btn-secondary btn-sm">
            Read IR35 guidelines
          </Link>
        </div>
      </section>

      <div className="seo-two-col" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
        <div>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Matching contracts ({matchedJobs.length})</h2>
          {matchedJobs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {matchedJobs.map((job) => (
                <div key={job.id} className="glass-panel glass-panel-hover job-card">
                  <div className="job-card-header">
                    <div>
                      <h3 className="job-title"><Link href={`/jobs/${job.slug}`}>{job.title}</Link></h3>
                      <Link href={companyHref({ slug: job.companySlug, id: job.companyId })} className="job-company">
                        {job.companyName}
                      </Link>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', fontWeight: '800' }}>£{job.dayRateMin} - £{job.dayRateMax}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>per day</div>
                    </div>
                  </div>
                  <div className="job-meta-row">
                    <div className="job-meta-item">{job.location}</div>
                    <div className="job-meta-item">{job.remoteType?.toUpperCase()}</div>
                    <div className="job-meta-item">Clearance: {job.clearanceLevel}</div>
                  </div>
                  <div className="job-tags-row">
                    <span className={`tag-badge ${job.ir35Status === 'outside' ? 'tag-outside' : 'tag-inside'}`}>
                      {job.ir35Status === 'outside' ? 'Outside IR35' : 'Inside IR35'}
                    </span>
                    {job.skills.slice(0, 3).map((skill) => (
                      <span key={skill} className="tag-badge tag-normal">{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No live postings match this combination yet.</p>
              <Link href="/jobs" className="btn btn-secondary btn-sm" style={{ marginTop: '16px' }}>View all contracts</Link>
            </div>
          )}

          <div className="glass-panel" style={{ padding: '32px', marginTop: '40px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Frequently asked questions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {faqs.map((faq) => (
                <div key={faq.q}>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '15px', marginBottom: '6px' }}>{faq.q}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside>
          <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '15px', marginBottom: '16px' }}>Related skills</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {skillsList.map((skill) => (
                <Link key={skill} href={`/${skill.toLowerCase()}-contract-jobs`} style={{ color: 'var(--color-primary)', fontSize: '13px' }}>
                  {skill} contract jobs
                </Link>
              ))}
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '15px', marginBottom: '16px' }}>Related locations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {locationsList.map((loc) => (
                <Link key={loc} href={`/${loc.toLowerCase()}-contract-jobs`} style={{ color: 'var(--color-primary)', fontSize: '13px' }}>
                  Contract jobs in {loc}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
