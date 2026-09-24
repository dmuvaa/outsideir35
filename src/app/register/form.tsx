'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { completeProfile, logout, register } from '@/app/actions/auth';

function SignupFields({ email }: { email: string }) {
  const searchParams = useSearchParams();
  const invited = searchParams?.get('invite') === '1';
  const [role, setRole] = useState<'candidate' | 'recruiter'>(searchParams?.get('role') === 'recruiter' ? 'recruiter' : 'candidate');
  const [gdprConsent, setGdprConsent] = useState(false);
  const [error, setError] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
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
    const result = await register(formData);
    if (result && 'needsConfirmation' in result && result.needsConfirmation) {
      setNeedsConfirmation(true);
      setIsPending(false);
      return;
    }
    if (result && 'error' in result && result.error) {
      setError(result.error);
      setIsPending(false);
    }
  }

  if (needsConfirmation) {
    return (
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-header)', marginBottom: '8px' }}>Check your email</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
          Open the link we sent to finish creating your account. Then sign in with your password.
        </p>
        <Link href="/login" className="btn btn-primary" style={{ marginTop: '24px' }}>Sign in</Link>
      </div>
    );
  }

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-header)', marginBottom: '8px' }}>{invited ? 'Post your contract roles' : 'Create an account'}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
          {invited
            ? 'Add your name and work email, then list the Outside IR35 roles you are hiring for.'
            : 'Join OutsideIR35 with an email and password.'}
        </p>
      </div>
      {error && <ErrorBanner message={error} />}
      <form action={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <RoleToggle role={role} setRole={setRole} />
        <NameFields firstName={searchParams?.get('firstName') || ''} lastName={searchParams?.get('lastName') || ''} />
        <div className="filter-group">
          <label className="filter-title" style={{ fontSize: '11px' }}>Email Address</label>
          <input name="email" type="email" autoComplete="email" defaultValue={email || searchParams?.get('email') || ''} placeholder="e.g. contractor@example.com" required />
        </div>
        <div className="filter-group">
          <label className="filter-title" style={{ fontSize: '11px' }}>Password</label>
          <input name="password" type="password" autoComplete="new-password" placeholder="Minimum 8 characters" minLength={8} required />
        </div>
        {role === 'recruiter' && <CompanyField companyName={searchParams?.get('companyName') || ''} />}
        <ConsentField checked={gdprConsent} onChange={() => setGdprConsent(!gdprConsent)} />
        <button type="submit" disabled={isPending} className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
          {isPending ? 'Creating account...' : invited ? 'Continue' : 'Register account'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-secondary)' }}>
        Already have an account? <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign in</Link>
      </p>
    </>
  );
}

function ProfileFields() {
  const searchParams = useSearchParams();
  const [role, setRole] = useState<'candidate' | 'recruiter'>(searchParams?.get('role') === 'recruiter' ? 'recruiter' : 'candidate');
  const [gdprConsent, setGdprConsent] = useState(false);
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  async function handleProfileSubmit(formData: FormData) {
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
    <>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-header)', marginBottom: '8px' }}>Finish your profile</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
          Tell us how you will use OutsideIR35.
        </p>
      </div>
      {error && <ErrorBanner message={error} />}
      <form action={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <RoleToggle role={role} setRole={setRole} />
        <NameFields />
        {role === 'recruiter' && <CompanyField companyName="" />}
        <ConsentField checked={gdprConsent} onChange={() => setGdprConsent(!gdprConsent)} />
        <button type="submit" disabled={isPending} className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
          {isPending ? 'Saving...' : 'Continue'}
        </button>
      </form>
      <form action={logout} style={{ textAlign: 'center', marginTop: '24px' }}>
        <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>
          Sign out and use a different email
        </button>
      </form>
    </>
  );
}

function RoleToggle({ role, setRole }: { role: 'candidate' | 'recruiter'; setRole: (role: 'candidate' | 'recruiter') => void }) {
  return (
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
  );
}

function NameFields({ firstName = '', lastName = '' }: { firstName?: string; lastName?: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      <div className="filter-group">
        <label className="filter-title" style={{ fontSize: '11px' }}>First Name</label>
        <input name="firstName" type="text" autoComplete="given-name" defaultValue={firstName} placeholder="e.g. Sarah" required />
      </div>
      <div className="filter-group">
        <label className="filter-title" style={{ fontSize: '11px' }}>Last Name</label>
        <input name="lastName" type="text" autoComplete="family-name" defaultValue={lastName} placeholder="e.g. Jenkins" required />
      </div>
    </div>
  );
}

function CompanyField({ companyName = '' }: { companyName?: string }) {
  return (
    <div className="filter-group fade-in">
      <label className="filter-title" style={{ fontSize: '11px' }}>Company Name</label>
      <input name="companyName" type="text" autoComplete="organization" defaultValue={companyName} placeholder="e.g. Tech Corp Ltd" required />
    </div>
  );
}

function ConsentField({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <label className="filter-checkbox-item" style={{ marginTop: '8px', alignItems: 'flex-start' }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ marginTop: '4px' }} />
      <span style={{ fontSize: '12px', lineHeight: '1.4', color: 'var(--text-secondary)' }}>
        I agree to the privacy policy, consenting to secure storage of my CV and a consent record for this account.
      </span>
    </label>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-inside-glow)', border: '1px solid var(--color-inside)', borderRadius: 'var(--radius-sm)', color: 'var(--color-inside)', fontSize: '13px', marginBottom: '20px' }}>
      {message}
    </div>
  );
}

export function RegisterForm({ mode, email }: { mode: 'signup' | 'profile'; email: string }) {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>Loading...</div>}>
      <div className="container fade-in" style={{ padding: '80px 0', display: 'flex', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '460px', padding: '40px', backgroundColor: 'var(--panel-bg-solid)' }}>
          {mode === 'profile' ? <ProfileFields /> : <SignupFields email={email} />}
        </div>
      </div>
    </Suspense>
  );
}
