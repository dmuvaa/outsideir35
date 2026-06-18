'use strict';

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db, Job } from '@/lib/db';

export default function Home() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [guides, setGuides] = useState<any[]>([]);

  // Homepage quick filters states
  const [showFilters, setShowFilters] = useState(false);
  const [ir35Status, setIr35Status] = useState('all');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [scCleared, setScCleared] = useState(false);

  useEffect(() => {
    // Fetch seed data
    db.getJobs().then(jobs => {
      setFeaturedJobs(jobs.filter(j => j.featured).slice(0, 3));
    });
    db.getCompanies().then(comps => {
      setCompanies(comps.slice(0, 4));
    });
    db.getGuides().then(g => {
      setGuides(g.slice(0, 3));
    });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set('q', keyword);
    if (location) params.set('location', location);
    if (ir35Status !== 'all') params.set('ir35', ir35Status);
    if (remoteOnly) params.set('remote', 'remote');
    if (scCleared) params.set('clearance', 'SC');
    router.push(`/jobs?${params.toString()}`);
  };

  const categories = [
    { name: 'Technology', icon: '💻', count: 12, slug: 'technology-contract-jobs' },
    { name: 'Finance', icon: '📈', count: 8, slug: 'finance-contract-jobs' },
    { name: 'Engineering', icon: '⚙️', count: 5, slug: 'engineering-contract-jobs' },
    { name: 'Healthcare', icon: '💙', count: 6, slug: 'healthcare-contract-jobs' },
    { name: 'Construction', icon: '🏗️', count: 4, slug: 'construction-contract-jobs' },
    { name: 'Government', icon: '🏛️', count: 7, slug: 'government-contract-jobs' }
  ];

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
            Assess your status, search verified Outside IR35 contract roles, and optimize your take-home tax strategies in one unified platform.
          </p>

          {/* Large Search Bar Wrapper */}
          <div style={{ position: 'relative', width: '100%' }}>
            <form onSubmit={handleSearch} className="glass-panel search-hero-box" style={{
              boxShadow: 'var(--shadow-lg), var(--shadow-glow)',
              position: 'relative',
              zIndex: 10
            }}>
              <div className="search-input-group">
                <span style={{ fontSize: '18px' }}>🔍</span>
                <input
                  type="text"
                  placeholder="Keywords, skills, or roles..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
              <div className="search-input-group">
                <span style={{ fontSize: '18px' }}>📍</span>
                <input
                  type="text"
                  placeholder="Location (e.g. London, Remote)..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              
              {/* Quick Filters Toggle Button inside the bar */}
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-secondary"
                style={{
                  padding: '10px 16px',
                  border: '1px solid var(--panel-border)',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                🎛️ Filters { (ir35Status !== 'all' || remoteOnly || scCleared) && <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>•</span> }
              </button>

              <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px', whiteSpace: 'nowrap' }}>
                Search Contracts
              </button>
            </form>

            {/* Quick Filters Dropdown Panel */}
            {showFilters && (
              <div className="glass-panel fade-in" style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                right: 0,
                padding: '20px',
                zIndex: 9,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                textAlign: 'left',
                backgroundColor: 'var(--panel-bg-solid)',
                boxShadow: 'var(--shadow-lg)'
              }}>
                {/* IR35 Group */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    IR35 Compliance
                  </span>
                  <select
                    value={ir35Status}
                    onChange={(e) => setIr35Status(e.target.value)}
                    style={{
                      padding: '10px 12px',
                      fontSize: '14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-color)',
                      border: '1px solid var(--panel-border)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="all">Show All Roles</option>
                    <option value="outside">Outside IR35 Only</option>
                    <option value="inside">Inside IR35 Only</option>
                  </select>
                </div>

                {/* Remote Work Group */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Workplace Type
                  </span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    <input
                      type="checkbox"
                      checked={remoteOnly}
                      onChange={(e) => setRemoteOnly(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
                    />
                    Remote Contracts Only
                  </label>
                </div>

                {/* Clearance Group */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Security Clearance
                  </span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    <input
                      type="checkbox"
                      checked={scCleared}
                      onChange={(e) => setScCleared(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
                    />
                    Requires SC Clearance
                  </label>
                </div>
              </div>
            )}
          </div>

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
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Latest handpicked contract roles assessed as compliant</p>
            </div>
            <Link href="/jobs" className="nav-link" style={{ fontWeight: '600' }}>
              View all contracts &rarr;
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {featuredJobs.map((job) => (
              <div key={job.id} className="glass-panel glass-panel-hover job-card">
                <div className="job-card-header">
                  <div>
                    <h3 className="job-title">
                      <Link href={`/jobs/${job.slug}`}>{job.title}</Link>
                    </h3>
                    <Link href={`/companies/${job.companyId}`} className="job-company">
                      {job.companyLogo} {job.companyName}
                    </Link>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>
                      £{job.dayRateMin} - £{job.dayRateMax}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>per day</div>
                  </div>
                </div>

                <div className="job-meta-row">
                  <div className="job-meta-item">📍 {job.location}</div>
                  <div className="job-meta-item">💻 {job.remoteType.toUpperCase()}</div>
                  <div className="job-meta-item">🛡️ Clearance: {job.clearanceLevel}</div>
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
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '40px'
          }}>
            {/* Left: Latest Companies */}
            <div>
              <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Top Contract Employers</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {companies.map((comp) => (
                  <Link key={comp.id} href={`/companies/${comp.slug}`} className="glass-panel glass-panel-hover" style={{
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <span style={{ fontSize: '24px', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)' }}>
                      {comp.logo}
                    </span>
                    <div>
                      <h4 style={{ color: 'var(--text-primary)', fontSize: '15px' }}>
                        {comp.name} {comp.verified && <span style={{ color: 'var(--color-outside)', fontSize: '12px' }}>✓ Verified</span>}
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
                {guides.map((guide) => (
                  <Link key={guide.id} href={`/guides/${guide.slug}`} className="glass-panel glass-panel-hover" style={{
                    padding: '16px',
                    display: 'block'
                  }}>
                    <span className="tag-badge tag-normal" style={{ marginBottom: '8px' }}>
                      {guide.guideCategory.toUpperCase()}
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
