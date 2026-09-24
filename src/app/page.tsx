import React from 'react';
import Link from 'next/link';
import { getJobsServer, getCompaniesServer, getGuidesServer } from '@/lib/server-data';
import SearchForm from './components/SearchForm';
import { companyHref, formatDayRate } from '@/lib/platform';

export default async function Home() {
  const [allJobs, companies, guides] = await Promise.all([
    getJobsServer(),
    getCompaniesServer(),
    getGuidesServer(),
  ]);

  const featuredJobs = [...allJobs]
    .sort((a, b) => Number(b.featured) - Number(a.featured) || Number(b.ir35Status === 'outside') - Number(a.ir35Status === 'outside'))
    .slice(0, 3);

  const industryCounts: Record<string, number> = {};
  for (const job of allJobs) {
    const key = job.industry || 'Technology';
    industryCounts[key] = (industryCounts[key] || 0) + 1;
  }

  const categories = [
    { name: 'Technology', icon: '💻', slug: 'technology-contract-jobs' },
    { name: 'Finance', icon: '📈', slug: 'finance-contract-jobs' },
    { name: 'Engineering', icon: '⚙️', slug: 'engineering-contract-jobs' },
    { name: 'Healthcare', icon: '💙', slug: 'healthcare-contract-jobs' },
    { name: 'Construction', icon: '🏗️', slug: 'construction-contract-jobs' },
    { name: 'Government', icon: '🏛️', slug: 'government-contract-jobs' }
  ].map((cat) => ({ ...cat, count: industryCounts[cat.name] || 0 }));

  const popularSkills = ['React', 'Python', 'AWS', 'SAP', 'Power BI', 'SQL', 'Terraform', 'Kubernetes'];

  return (
    <div className="fade-in" style={{ padding: '60px 0' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', marginBottom: '80px' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <span className="tag-badge tag-outside" style={{ marginBottom: '16px' }}>
            🇬🇧 UK Contractor Job Portal
          </span>
          <h1 style={{
            fontSize: '48px',
            fontFamily: 'var(--font-header)',
            fontWeight: '800',
            lineHeight: '1.1',
            marginBottom: '16px',
            background: 'var(--hero-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Indeed meets Contractor UK
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '18px',
            marginBottom: '40px',
            lineHeight: '1.6'
          }}>
            Assess IR35 status, search live Outside IR35 contracts, and apply with a single contractor profile.
          </p>

          <SearchForm />

          {/* Quick links search badges */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            marginTop: '24px',
            fontSize: '13px'
          }}>
            <span style={{ color: 'var(--text-muted)' }}>Quick Filters:</span>
            <Link href="/remote-contract-jobs" className="tag-badge tag-remote">Remote Jobs</Link>
            <Link href="/outside-ir35-jobs" className="tag-badge tag-outside">Outside IR35</Link>
            <Link href="/sc-cleared-jobs" className="tag-badge tag-clearance">SC Cleared</Link>
            <Link href="/finance-contract-jobs" className="tag-badge tag-normal">Finance Contracts</Link>
            <Link href="/construction-contract-jobs" className="tag-badge tag-normal">Construction Contracts</Link>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section style={{ marginBottom: '80px' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '24px'
          }}>
            <div>
              <h2 style={{ fontSize: '28px' }}>Featured Contracts</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Latest live contract roles on the board</p>
            </div>
            <Link href="/jobs" className="nav-link" style={{ fontWeight: '600' }}>
              View all contracts &rarr;
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {featuredJobs.length === 0 ? (
              <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>No live contracts yet. Check back shortly or post a role.</p>
                <Link href="/jobs" className="btn btn-secondary btn-sm" style={{ marginTop: '12px' }}>Browse the board</Link>
              </div>
            ) : featuredJobs.map((job) => (
              <div key={job.id} className="glass-panel glass-panel-hover job-card">
                <div className="job-card-header">
                  <div>
                    <h3 className="job-title">
                      <Link href={`/jobs/${job.slug}`}>{job.title}</Link>
                    </h3>
                    <Link href={companyHref({ slug: (job as any).companySlug, id: job.companyId })} className="job-company" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                      {(job.companyLogo && (job.companyLogo.startsWith('/') || job.companyLogo.startsWith('http'))) ? (
                        <img src={job.companyLogo} alt={`${job.companyName} logo`} style={{ width: '20px', height: '20px', borderRadius: '4px', objectFit: 'contain', background: 'white' }} />
                      ) : (
                        <span>{job.companyLogo}</span>
                      )}
                      {job.companyName}
                    </Link>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>
                      {formatDayRate(job.dayRateMin, job.dayRateMax)}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>per day</div>
                  </div>
                </div>

                <div className="job-meta-row">
                  <div className="job-meta-item">📍 {job.location}</div>
                  <div className="job-meta-item">💻 {job.remoteType?.toUpperCase() || 'UNKNOWN'}</div>
                  <div className="job-meta-item">🛡️ Clearance: {job.clearanceLevel || 'None'}</div>
                </div>

                <div className="job-tags-row">
                  <span className={`tag-badge ${job.ir35Status === 'outside' ? 'tag-outside' : 'tag-inside'}`}>
                    {job.ir35Status === 'outside' ? 'Outside IR35' : 'Inside IR35'}
                  </span>
                  {job.skills?.slice(0, 3).map((skill: string) => (
                    <span key={skill} className="tag-badge tag-normal">{skill}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories Grid */}
      <section style={{ marginBottom: '80px' }}>
        <div className="container">
          <h2 style={{ fontSize: '28px', marginBottom: '8px', textAlign: 'center' }}>Popular Industries</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center', marginBottom: '32px' }}>
            Browse active contract engagements sorted by sector
          </p>

          <div className="card-grid">
            {categories.map((cat) => (
              <Link key={cat.name} href={`/${cat.slug}`} className="glass-panel glass-panel-hover" style={{
                padding: '24px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '36px' }}>{cat.icon}</span>
                <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>{cat.name}</h3>
                <span className="tag-badge tag-normal" style={{ fontSize: '11px' }}>
                  {cat.count} Active Roles
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Skills / Technologies */}
      <section style={{ marginBottom: '80px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>Browse by Tech Stack</h2>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '12px',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {popularSkills.map((skill) => (
              <Link
                key={skill}
                href={`/${skill.toLowerCase()}-contract-jobs`}
                className="btn btn-secondary"
                style={{
                  borderRadius: 'var(--radius-full)',
                  padding: '8px 20px',
                  fontSize: '13px'
                }}
              >
                {skill} Contracts
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Companies & Guides Section */}
      <section>
        <div className="container">
          <div className="dashboard-grid">
            {/* Left: Latest Companies */}
            <div>
              <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Top Contract Employers</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {companies.slice(0, 4).map((comp: any) => (
                  <Link key={comp.id} href={`/companies/${comp.slug}`} className="glass-panel glass-panel-hover" style={{
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <div style={{ fontSize: '32px' }}>
                      {(comp?.logo_url && (comp.logo_url.startsWith('/') || comp.logo_url.startsWith('http'))) ? (
                        <img src={comp.logo_url} alt={`${comp.name} logo`} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'contain', background: 'white' }} />
                      ) : (
                        comp?.logo_url || '🏢'
                      )}
                    </div>
                    <div>
                      <h4 style={{ color: 'var(--text-primary)', fontSize: '15px' }}>
                        {comp.name} {(comp.verified || comp.is_verified) && <span style={{ color: 'var(--color-outside)', fontSize: '12px' }}>Verified</span>}
                      </h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{comp.industry} &bull; {comp.location}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: Latest Guides */}
            <div>
              <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Contractor Compliance Center</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {guides.slice(0, 3).map((guide: any) => (
                  <Link key={guide.id} href={`/guides/${guide.slug}`} className="glass-panel glass-panel-hover" style={{
                    padding: '16px',
                    display: 'block'
                  }}>
                    <span className="tag-badge tag-normal" style={{ marginBottom: '8px' }}>
                      {(guide.guide_category || '').toUpperCase()}
                    </span>
                    <h4 style={{ color: 'var(--text-primary)', fontSize: '15px', marginBottom: '6px' }}>
                      {guide.title}
                    </h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Read compliance criteria &raquo;</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
