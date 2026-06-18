'use strict';

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db, Company, Job } from '@/lib/db';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CompanyDetailsPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const slug = resolvedParams.slug;

  const [company, setCompany] = useState<Company | null>(null);
  const [companyJobs, setCompanyJobs] = useState<Job[]>([]);

  useEffect(() => {
    async function loadData() {
      const foundCompany = await db.getCompanyBySlug(slug);
      if (foundCompany) {
        setCompany(foundCompany);
        // Fetch open jobs for this company
        const allJobs = await db.getJobs();
        const jobs = allJobs.filter(j => j.companyId === foundCompany.id && j.status === 'active');
        setCompanyJobs(jobs);
      }
    }
    loadData();
  }, [slug]);

  if (!company) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Company profile not found</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '16px 0' }}>The company may have removed its profile.</p>
        <Link href="/companies" className="btn btn-primary">Back to Directory</Link>
      </div>
    );
  }

  return (
    <div className="container fade-in" style={{ padding: '40px 0' }}>
      <Link href="/companies" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
        &larr; Back to directory
      </Link>

      {/* Hero Header Card */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '64px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
            {company.logo}
          </span>
          <div style={{ flex: '1' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-header)' }}>{company.name}</h1>
              {company.verified && (
                <span className="tag-badge tag-outside">Verified</span>
              )}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '600px' }}>
              {company.industry} &bull; {company.location}
            </p>
            <div style={{ marginTop: '12px', display: 'flex', gap: '16px', fontSize: '13px' }}>
              <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>
                🔗 Visit Website &raquo;
              </a>
              <span style={{ color: 'var(--text-muted)' }}>|</span>
              <span style={{ color: 'var(--text-muted)' }}>Staff Scale: {company.size} employees</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two column detail layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
        {/* Left Col: Overview & Open Jobs */}
        <div>
          <div className="glass-panel" style={{ padding: '32px', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>About {company.name}</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
              {company.description}
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              We collaborate with highly specialized contractors across multiple operational units. Our internal determinations ensure fast onboarding and contract compliance (complying fully with HMRC rules on substitution and mutuality of obligation).
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '22px', marginBottom: '16px' }}>Active Contract Roles</h2>
            {companyJobs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {companyJobs.map((job) => (
                  <div key={job.id} className="glass-panel glass-panel-hover job-card">
                    <div className="job-card-header">
                      <div>
                        <h3 className="job-title">
                          <Link href={`/jobs/${job.slug}`}>{job.title}</Link>
                        </h3>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                          📍 {job.location} &bull; 💻 {job.remoteType.toUpperCase()}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>
                          £{job.dayRateMin} - £{job.dayRateMax}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>per day</div>
                      </div>
                    </div>

                    <div className="job-tags-row" style={{ marginTop: '12px' }}>
                      <span className={`tag-badge ${job.ir35Status === 'outside' ? 'tag-outside' : 'tag-inside'}`} style={{ fontSize: '10px' }}>
                        {job.ir35Status === 'outside' ? 'Outside IR35' : 'Inside IR35'}
                      </span>
                      {job.clearanceLevel !== 'none' && (
                        <span className="tag-badge tag-clearance" style={{ fontSize: '10px' }}>
                          Clearance: {job.clearanceLevel}
                        </span>
                      )}
                      {job.skills.slice(0, 3).map((skill) => (
                        <span key={skill} className="tag-badge tag-normal" style={{ fontSize: '10px' }}>{skill}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>There are currently no active contract postings for this company.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Stats */}
        <aside>
          <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Employer Statistics</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ACTIVE ROLES</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-primary)' }}>{companyJobs.length} postings</div>
              </div>
              <hr style={{ borderColor: 'var(--panel-border)' }} />
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>OUTSIDE IR35 COMPLIANCE RATIO</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-outside)' }}>92%</div>
              </div>
              <hr style={{ borderColor: 'var(--panel-border)' }} />
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>CONTRACT TERMS</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Typically 6 - 12 Months</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
