'use strict';

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db, Job, Application } from '@/lib/db';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function JobDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const slug = resolvedParams.slug;

  const [job, setJob] = useState<Job | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Application Form States
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [cvFile, setCvFile] = useState<string>('');
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Copy Link State
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      const foundJob = await db.getJobBySlug(slug);
      if (foundJob) {
        setJob(foundJob);
        
        // Check auth status
        const user = db.getAuthUser();
        setCurrentUser(user);

        // Check if job is bookmarked
        if (user && user.role === 'candidate') {
          const profile = await db.getCandidateProfile();
          setIsSaved(profile.savedJobs.includes(foundJob.id));
          setCvFile(profile.resumeName || '');
        }
      }
    }
    loadData();
  }, [slug]);

  if (!job) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Job posting not found</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '16px 0' }}>The posting may have expired or been removed.</p>
        <Link href="/jobs" className="btn btn-primary">Back to Contract Board</Link>
      </div>
    );
  }

  // Google JobPosting JSON-LD Structured Data
  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    'title': job.title,
    'description': job.descriptionHtml,
    'datePosted': job.createdAt,
    'validThrough': job.expiresAt,
    'employmentType': 'CONTRACTOR',
    'hiringOrganization': {
      '@type': 'Organization',
      'name': job.companyName,
      'sameAs': `https://outsideir35.co.uk/companies/${job.companyId}`
    },
    'jobLocation': {
      '@type': 'Place',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': job.location,
        'addressCountry': 'GB'
      }
    },
    'baseSalary': {
      '@type': 'MonetaryAmount',
      'currency': 'GBP',
      'value': {
        '@type': 'QuantitativeValue',
        'minValue': job.dayRateMin,
        'maxValue': job.dayRateMax,
        'unitText': 'DAY'
      }
    }
  };

  const handleSaveToggle = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    if (currentUser.role !== 'candidate') {
      alert('Only candidate accounts can save jobs.');
      return;
    }

    const profile = await db.getCandidateProfile();
    let updatedSaved = [...profile.savedJobs];
    if (isSaved) {
      updatedSaved = updatedSaved.filter(id => id !== job.id);
    } else {
      updatedSaved.push(job.id);
    }
    
    await db.saveCandidateProfile({
      ...profile,
      savedJobs: updatedSaved
    });
    setIsSaved(!isSaved);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      router.push('/login');
      return;
    }

    let candidateName = 'Test Recruiter User';
    if (currentUser.role === 'candidate') {
      const profile = await db.getCandidateProfile();
      candidateName = profile.name;
    }

    if (!cvFile) {
      alert('Please upload a CV to apply.');
      return;
    }

    const applicationPayload = {
      jobId: job.id,
      jobTitle: job.title,
      companyName: job.companyName,
      userId: currentUser.id,
      candidateName: candidateName,
      resumeUrl: cvFile,
      coverLetter: coverLetter
    };

    await db.applyToJob(applicationPayload);
    setAppliedSuccess(true);
    setShowApplyForm(false);
    
    // Auto reset success message after 5 seconds
    setTimeout(() => setAppliedSuccess(false), 5000);
  };

  const copyUrlToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container fade-in" style={{ padding: '40px 0' }}>
      {/* Schema injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      {/* Back Link */}
      <Link href="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
        &larr; Back to contract directory
      </Link>

      {/* Main layout: 2 cols */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
        
        {/* Left Column: Job Details */}
        <div>
          {/* Hero Header */}
          <div className="glass-panel" style={{ padding: '32px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span className={`tag-badge ${job.ir35Status === 'outside' ? 'tag-outside' : 'tag-inside'}`} style={{ marginBottom: '12px' }}>
                  {job.ir35Status === 'outside' ? 'Outside IR35' : 'Inside IR35'}
                </span>
                <span className="tag-badge tag-normal" style={{ marginLeft: '8px' }}>
                  🕒 Posted {new Date(job.createdAt).toLocaleDateString('en-GB')}
                </span>
                
                <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-header)', marginTop: '8px', marginBottom: '8px' }}>
                  {job.title}
                </h1>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
                  <span style={{ fontSize: '20px' }}>{job.companyLogo}</span>
                  <Link href={`/companies/${job.companyId}`} className="job-company" style={{ fontWeight: '600' }}>
                    {job.companyName}
                  </Link>
                </div>
              </div>

              {/* Day Rate & Save Actions */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>
                  £{job.dayRateMin} - £{job.dayRateMax}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>per day</div>
                
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button onClick={handleSaveToggle} className="btn btn-secondary btn-sm">
                    {isSaved ? '★ Saved' : '☆ Save Job'}
                  </button>
                  <button onClick={() => setShowApplyForm(true)} className="btn btn-primary btn-sm">
                    Apply Now
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Meta Indicators */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '24px',
              marginTop: '32px',
              paddingTop: '24px',
              borderTop: '1px solid var(--panel-border)',
              fontSize: '14px',
              color: 'var(--text-secondary)'
            }}>
              <div>📍 <strong>Location:</strong> {job.location}</div>
              <div>💻 <strong>Workspace:</strong> {job.remoteType.toUpperCase()}</div>
              <div>🛡️ <strong>Clearance Level:</strong> {job.clearanceLevel}</div>
              <div>📁 <strong>Sector:</strong> {job.industry}</div>
            </div>
          </div>

          {/* Description & Rich Text */}
          <div className="glass-panel" style={{ padding: '32px', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '22px', marginBottom: '16px' }}>Role Description</h2>
            <div 
              style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}
              dangerouslySetInnerHTML={{ __html: job.descriptionHtml }}
            />

            {/* Requirements Block */}
            {job.requirements && job.requirements.length > 0 && (
              <div style={{ marginTop: '32px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '12px', color: 'var(--text-primary)' }}>Requirements & Qualifications</h3>
                <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {job.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Responsibilities Block */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div style={{ marginTop: '32px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '12px', color: 'var(--text-primary)' }}>Key Responsibilities</h3>
                <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {job.responsibilities.map((resp, idx) => (
                    <li key={idx}>{resp}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits Block */}
            {job.benefits && job.benefits.length > 0 && (
              <div style={{ marginTop: '32px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '12px', color: 'var(--text-primary)' }}>Engagement Benefits</h3>
                <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {job.benefits.map((ben, idx) => (
                    <li key={idx}>{ben}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills Badges */}
            <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--panel-border)' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--text-muted)' }}>Target Skillsets</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {job.skills.map((skill) => (
                  <span key={skill} className="tag-badge tag-normal" style={{ fontSize: '12px', padding: '6px 12px' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Company Info & Action Panel */}
        <aside>
          {/* Company Brief Box */}
          <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Hiring Entity</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '36px' }}>{job.companyLogo}</span>
              <div>
                <h4 style={{ color: 'var(--text-primary)', fontSize: '16px' }}>{job.companyName}</h4>
                <Link href={`/companies/${job.companyId}`} style={{ color: 'var(--color-primary)', fontSize: '13px' }}>
                  View Profile &raquo;
                </Link>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>
              Verified employer hosting active contractor engagements.
            </p>
            <hr style={{ borderColor: 'var(--panel-border)', marginBottom: '16px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <div>🏢 Size Band: 50 - 200 contractors</div>
              <div>🌍 Location: London, UK</div>
              <div>💼 Tax Compliance Rate: 100% Outside status reliability</div>
            </div>
          </div>

          {/* Share Actions Box */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Share this contract</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={copyUrlToClipboard} className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }}>
                🔗 {copied ? 'Copied URL!' : 'Copy Share URL'}
              </button>
              <a href={`mailto:?subject=Contract Opportunity: ${job.title}&body=Check this out: `} className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }}>
                ✉️ Email to Friend
              </a>
            </div>
          </div>
        </aside>
      </div>

      {/* Dynamic Toast for Application Success */}
      {appliedSuccess && (
        <div className="toast-msg">
          🎉 Application submitted successfully! View status in Dashboard.
        </div>
      )}

      {/* Modal Overlay: Apply Form */}
      {showApplyForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '24px'
        }}>
          <div className="glass-panel" style={{
            backgroundColor: 'var(--panel-bg-solid)',
            width: '100%',
            maxWidth: '500px',
            padding: '32px',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowApplyForm(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '20px',
                cursor: 'pointer'
              }}
            >
              &times;
            </button>

            <h3 style={{ fontSize: '20px', marginBottom: '8px', fontFamily: 'var(--font-header)' }}>Apply for this contract</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px' }}>
              {job.title} at {job.companyName}
            </p>

            <form onSubmit={handleApplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="filter-group">
                <label className="filter-title" style={{ fontSize: '11px' }}>Your Contractor Resume / CV (PDF, Doc, Docx)</label>
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const publicUrl = await db.uploadCV(file);
                        setCvFile(publicUrl);
                        alert('CV uploaded successfully!');
                      } catch (err: any) {
                        alert('CV upload failed: ' + err.message);
                      }
                    }
                  }}
                  style={{ padding: '6px 0', border: 'none', background: 'none' }}
                />
                {cvFile ? (
                  <div style={{ marginTop: '8px', fontSize: '12px' }}>
                    Using CV: <a href={cvFile} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>{cvFile.split('/').pop()}</a>
                  </div>
                ) : (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--color-inside)' }}>
                    ⚠️ No CV uploaded yet. Please upload a file to apply.
                  </div>
                )}
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>GDPR: Resumes are stored privately in encrypted buckets.</span>
              </div>

              <div className="filter-group">
                <label className="filter-title" style={{ fontSize: '11px' }}>Cover Note (Optional)</label>
                <textarea 
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Outline your availability, day rate expectations, and right of substitution capabilities..."
                  rows={4}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowApplyForm(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
