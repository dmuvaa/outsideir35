'use strict';

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db, Job } from '@/lib/db';

interface PageProps {
  params: Promise<{ seoSlug: string[] }>;
}

export default function ProgrammaticSeoPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const slugArray = resolvedParams.seoSlug;
  const rawSlug = slugArray.join('/');

  // Parsing States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [h1, setH1] = useState('');
  const [intro, setIntro] = useState('');
  const [matchedJobs, setMatchedJobs] = useState<Job[]>([]);
  const [faqs, setFaqs] = useState<Array<{ q: string; a: string }>>([]);
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [locationsList, setLocationsList] = useState<string[]>([]);

  useEffect(() => {
    // 1. Analyze the slug text to extract search intent parameters
    const slugStr = rawSlug.toLowerCase();
    
    // Taxonomy match definitions
    const skills = ['react', 'python', 'aws', 'sap', 'power-bi', 'sql', 'terraform', 'kubernetes'];
    const locations = ['london', 'manchester', 'bristol', 'gloucester', 'birmingham', 'glasgow'];
    const clearances = ['sc', 'dv', 'bpss'];
    const sectors = ['finance', 'construction', 'engineering', 'healthcare', 'technology', 'procurement', 'government', 'project-management', 'business-analysis'];
    
    let detectedSkill = '';
    let detectedLocation = '';
    let detectedClearance = '';
    let detectedSector = '';
    let detectedIr35 = '';

    // Check for IR35 terms
    if (slugStr.includes('outside-ir35')) detectedIr35 = 'outside';
    else if (slugStr.includes('inside-ir35')) detectedIr35 = 'inside';

    // Scan for clearance keyword match
    for (const c of clearances) {
      if (slugStr.includes(`${c}-`)) {
        detectedClearance = c.toUpperCase();
        break;
      }
    }

    // Scan for skill match
    for (const s of skills) {
      if (slugStr.includes(s)) {
        detectedSkill = s.toUpperCase().replace('-', ' ');
        break;
      }
    }

    // Scan for sector match
    for (const sec of sectors) {
      if (slugStr.includes(sec)) {
        detectedSector = sec.charAt(0).toUpperCase() + sec.slice(1).replace('-', ' ');
        break;
      }
    }

    // Scan for location match
    for (const l of locations) {
      if (slugStr.includes(l)) {
        detectedLocation = l.charAt(0).toUpperCase() + l.slice(1);
        break;
      }
    }

    // 2. Fetch and filter matching jobs based on detected intents
    db.getJobs().then(allJobs => {
      let jobs = [...allJobs];

      if (detectedSkill) {
        jobs = jobs.filter(j => j.skills.some(s => s.toLowerCase().includes(detectedSkill.toLowerCase())));
      }
      if (detectedLocation) {
        jobs = jobs.filter(j => j.location.toLowerCase() === detectedLocation.toLowerCase());
      }
      if (detectedClearance) {
        jobs = jobs.filter(j => j.clearanceLevel.toLowerCase() === detectedClearance.toLowerCase());
      }
      if (detectedSector) {
        jobs = jobs.filter(j => j.industry.toLowerCase() === detectedSector.toLowerCase());
      }
      if (detectedIr35) {
        jobs = jobs.filter(j => j.ir35Status === detectedIr35);
      }

      setMatchedJobs(jobs);

      // 3. Construct custom copy titles, descriptions, and FAQs based on matching metrics
      const termSkill = detectedSkill ? `${detectedSkill} ` : '';
      const termClearance = detectedClearance ? `${detectedClearance} Cleared ` : '';
      const termSector = detectedSector ? `${detectedSector} ` : '';
      const termIr35 = detectedIr35 ? `${detectedIr35.toUpperCase() === 'OUTSIDE' ? 'Outside IR35' : 'Inside IR35'} ` : '';
      const termLocation = detectedLocation ? `in ${detectedLocation}` : 'in the UK';

      const cleanTitle = `${termClearance}${termIr35}${termSkill}${termSector}Contract Jobs ${termLocation}`;
      setH1(cleanTitle);
      setTitle(`${cleanTitle} | OutsideIR35 Portal`);
      
      const cleanDesc = `Apply for ${jobs.length} active ${cleanTitle.toLowerCase()}. Search day rates, view Qdos assessed Outside IR35 compliance profiles, and submit your resume.`;
      setDescription(cleanDesc);

      const cleanIntro = `Welcome to the definitive portal for ${cleanTitle.toLowerCase()}. The UK contracting market is currently shifting toward verified compliant engagements. Explore verified rates, work scope parameters, and security requirements below.`;
      setIntro(cleanIntro);

      // Dynamic FAQs
      const generatedFaqs = [
        {
          q: `Are ${termSkill || termSector || 'contract'} roles ${detectedLocation ? `in ${detectedLocation}` : 'in the UK'} typically Outside IR35?`,
          a: `The IR35 status depends on the specific working practices rather than the job title. However, roles that allow direct right of substitution, involve minimal supervision or control, and operate on a deliverables-basis are commonly assessed as Outside IR35.`
        },
        {
          q: `What is the average day rate for ${termSkill || termSector || 'contract'} roles?`,
          a: `Currently, day rates for these engagements range from £${jobs[0]?.dayRateMin || 400} to £${jobs[0]?.dayRateMax || 900} per day, depending on the level of expertise, required security clearance, and industry sector.`
        }
      ];
      setFaqs(generatedFaqs);

      // Dynamic internal links lists
      setSkillsList(['React', 'Python', 'AWS', 'SAP', 'Power BI']);
      setLocationsList(['London', 'Manchester', 'Bristol', 'Birmingham', 'Glasgow']);
    });

  }, [rawSlug]);

  // Google FAQ Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(f => ({
      '@type': 'Question',
      'name': f.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': f.a
      }
    }))
  };

  return (
    <div className="container fade-in" style={{ padding: '40px 0' }}>
      {/* Dynamic SEO Tags Simulation & FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Breadcrumbs */}
      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        <Link href="/">Home</Link> &rsaquo; <Link href="/jobs">Contracts</Link> &rsaquo; <span style={{ color: 'var(--text-secondary)' }}>{h1}</span>
      </div>

      {/* SEO Intro Section */}
      <section className="glass-panel" style={{ padding: '32px', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-header)', marginBottom: '12px' }}>
          {h1}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: '1.6', marginBottom: '24px' }}>
          {intro}
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href={`/jobs?q=${h1.split(' ')[0]}`} className="btn btn-primary btn-sm">
            Configure Live Filters
          </Link>
          <Link href="/guides/what-is-ir35-guide" className="btn btn-secondary btn-sm">
            Read IR35 Guidelines
          </Link>
        </div>
      </section>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
        
        {/* Left Col: Job list */}
        <div>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Matching Contract Opportunities ({matchedJobs.length})</h2>
          
          {matchedJobs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {matchedJobs.map((job) => (
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
          ) : (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)' }}>There are currently no active contract postings matching this specific filter combination.</p>
              <Link href="/jobs" className="btn btn-secondary btn-sm" style={{ marginTop: '16px' }}>
                View all contracts
              </Link>
            </div>
          )}

          {/* Programmatic FAQ section */}
          <div className="glass-panel" style={{ padding: '32px', marginTop: '40px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Frequently Asked Questions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {faqs.map((faq, idx) => (
                <div key={idx}>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '15px', marginBottom: '6px' }}>
                    ❓ {faq.q}
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Internal link widgets & Related searches */}
        <aside>
          {/* Related Skills */}
          <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '15px', marginBottom: '16px' }}>Related Skills</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {skillsList.map((skill) => (
                <Link key={skill} href={`/${skill.toLowerCase()}-contract-jobs`} style={{ color: 'var(--color-primary)', fontSize: '13px' }}>
                  &bull; {skill} Contract Jobs
                </Link>
              ))}
            </div>
          </div>

          {/* Related Locations */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '15px', marginBottom: '16px' }}>Related Locations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {locationsList.map((loc) => (
                <Link key={loc} href={`/${loc.toLowerCase()}-contract-jobs`} style={{ color: 'var(--color-primary)', fontSize: '13px' }}>
                  &bull; Contract Jobs in {loc}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
