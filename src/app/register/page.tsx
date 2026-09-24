'use client';

import React, { useState, Suspense } from 'react';
import { completeProfile, logout } from '@/app/actions/auth';
import { useSearchParams } from 'next/navigation';

function RegisterForm() {
  const searchParams = useSearchParams();
  const [role, setRole] = useState<'candidate' | 'recruiter'>(searchParams?.get('role') === 'recruiter' ? 'recruiter' : 'candidate');
  const [gdprConsent, setGdprConsent] = useState(false);
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  async function handleRegisterSubmit(formData: FormData) {
    setIsPending(true);
    setError('');

    if (!gdprConsent) {
      setError('You must accept the privacy policy & GDPR consent checklist.');
      setIsPending(false);
      return;
    }

    formData.append('role', role);
    formData.append('consent', 'true');

    const result = await completeProfile(formData);

    if (result && 'error' in result && result.error) {
      setError(result.error);
      setIsPending(false);
    }
  }

  return (
    <div className="container fade-in" style={{ padding: '80px 0', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '460px', padding: '40px', backgroundColor: 'var(--panel-bg-solid)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-header)', marginBottom: '8px' }}>Finish your profile</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Your email is already verified. Tell us how you will use OutsideIR35.
          </p>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-inside-glow)', border: '1px solid var(--color-inside)', borderRadius: 'var(--radius-sm)', color: 'var(--color-inside)', fontSize: '13px', marginBottom: '20px' }}>
            {error}
          </div>
        )}
        <form action={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="filter-group">
            <label className="filter-title" style={{ fontSize: '11px' }}>Account Classification</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={() => setRole('candidate')} className={`btn btn-sm ${role === 'candidate' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }}>
                Contractor
              </button>
              <button type="button" onClick={() => setRole('recruiter')} className={`btn btn-sm ${role === 'recruiter' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }}>
                Employer / Recruiter
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="filter-group">
              <label className="filter-title" style={{ fontSize: '11px' }}>First Name</label>
              <input name="firstName" type="text" placeholder="e.g. Sarah" required />
            </div>
            <div className="filter-group">
              <label className="filter-title" style={{ fontSize: '11px' }}>Last Name</label>
              <input name="lastName" type="text" placeholder="e.g. Jenkins" required />
            </div>
          </div>

          {role === 'recruiter' && (
            <div className="filter-group fade-in">
              <label className="filter-title" style={{ fontSize: '11px' }}>Company Name</label>
              <input name="companyName" type="text" placeholder="e.g. Tech Corp Ltd" required />
            </div>
          )}

          <label className="filter-checkbox-item" style={{ marginTop: '8px', alignItems: 'flex-start' }}>
            <input type="checkbox" checked={gdprConsent} onChange={() => setGdprConsent(!gdprConsent)} style={{ marginTop: '4px' }} />
            <span style={{ fontSize: '12px', lineHeight: '1.4', color: 'var(--text-secondary)' }}>
              I agree to the privacy policy, consenting to secure storage of my CV and a consent record for this account.
            </span>
          </label>

          <button type="submit" disabled={isPending} className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            {isPending ? 'Saving...' : 'Continue'}
          </button>
        </form>

        <form action={logout} style={{ textAlign: 'center', marginTop: '24px' }}>
          <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>
            Sign out and use a different email
          </button>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
