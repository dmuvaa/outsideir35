'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { subscribeToJobAlerts } from '@/app/actions/job';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const formData = new FormData();
    formData.set('email', email);
    const result = await subscribeToJobAlerts(formData);
    if (result.redirect) {
      window.location.href = result.redirect;
      return;
    }
    if (result.error) {
      setError(result.error);
      return;
    }
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer style={{
      marginTop: 'auto',
      backgroundColor: 'var(--bg-color)',
      borderTop: '1px solid var(--panel-border)',
      padding: '64px 0 32px 0',
      fontSize: '14px',
      color: 'var(--text-secondary)'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr',
          gap: '40px',
          marginBottom: '48px'
        }}>
          {/* Logo & Vision Block */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <img
              src="/outsideir35-logo.svg"
              alt="OutsideIR35"
              width="190"
              height="40"
              style={{ width: '190px', height: '40px', objectFit: 'contain', objectPosition: 'left center' }}
            />
            <p style={{ lineHeight: '1.6', fontSize: '13px', color: 'var(--text-muted)' }}>
              "Indeed meets Contractor UK". The definitive search engine and compliance authority for contract and freelance engagements in the UK and overseas.
            </p>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Compliance: UK GDPR | EU GDPR | KDPA compliant.<br />
              Secure document buckets with temporary signing credentials.
            </div>
          </div>

          {/* Column 1: Professions / Categories */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Professions
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <Link href="/technology-contract-jobs">Technology</Link>
              <Link href="/finance-contract-jobs">Finance</Link>
              <Link href="/engineering-contract-jobs">Engineering</Link>
              <Link href="/construction-contract-jobs">Construction</Link>
              <Link href="/healthcare-contract-jobs">Healthcare</Link>
            </div>
          </div>

          {/* Column 2: Programmatic Clearances & Remote */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Job Filters
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <Link href="/outside-ir35-jobs">Outside IR35</Link>
              <Link href="/inside-ir35-jobs">Inside IR35</Link>
              <Link href="/sc-cleared-jobs">SC Cleared Jobs</Link>
              <Link href="/dv-cleared-jobs">DV Cleared Jobs</Link>
              <Link href="/remote-contract-jobs">Remote Contracts</Link>
            </div>
          </div>

          {/* Column 3: Skills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Top Skills
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <Link href="/react-contract-jobs">React Contracts</Link>
              <Link href="/python-contract-jobs">Python Contracts</Link>
              <Link href="/aws-contract-jobs">AWS Architect</Link>
              <Link href="/sap-contract-jobs">SAP Consultant</Link>
              <Link href="/power-bi-contract-jobs">Power BI</Link>
            </div>
          </div>

          {/* Column 4: Newsletter Signup */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Contractor Alert
            </h4>
            <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-muted)' }}>
              Subscribe to receive high-value Outside IR35 roles matching your skills directly in your inbox.
            </p>
            {subscribed ? (
              <div style={{ color: 'var(--color-outside)', fontWeight: '600', fontSize: '13px' }}>
                Alert saved. We will email matching Outside IR35 roles.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="email"
                  placeholder="name@contractor.co.uk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ padding: '8px 12px', fontSize: '13px', flex: '1' }}
                />
                <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '8px 12px' }}>
                  Subscribe
                </button>
                {error && <div style={{ width: '100%', fontSize: '12px', color: 'var(--color-inside)' }}>{error}</div>}
              </form>
            )}
          </div>
        </div>

        {/* Bottom copyright block */}
        <div style={{
          borderTop: '1px solid var(--panel-border)',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '12px',
          color: 'var(--text-muted)'
        }}>
          <div>
            &copy; {new Date().getFullYear()} OutsideIR35 Portal. All rights reserved. Registered UK Private Limited Company Intermediary.
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link href="/guides/what-is-ir35-guide">IR35 Guide</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/dashboard/candidate/settings">Privacy settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
