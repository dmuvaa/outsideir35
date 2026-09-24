'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { login } from '@/app/actions/auth';

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams?.get('next') || '';
  const confirmed = searchParams?.get('notice') === 'confirmed' || searchParams?.get('error') === 'link';
  const [email, setEmail] = useState(searchParams?.get('email') || '');
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  async function handleLogin(formData: FormData) {
    setIsPending(true);
    setError('');
    const result = await login(formData);
    if (result && 'error' in result && result.error) {
      setError(result.error);
      setIsPending(false);
    }
  }

  return (
    <div className="container fade-in" style={{ padding: '80px 0', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '40px', backgroundColor: 'var(--panel-bg-solid)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-header)', marginBottom: '8px' }}>Welcome back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            {confirmed
              ? 'Your email is confirmed. Sign in with your password.'
              : 'Sign in with the email and password for your OutsideIR35 account.'}
          </p>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-inside-glow)', border: '1px solid var(--color-inside)', borderRadius: 'var(--radius-sm)', color: 'var(--color-inside)', fontSize: '13px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <form action={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input type="hidden" name="next" value={next} />
          <div className="filter-group">
            <label className="filter-title" style={{ fontSize: '11px' }}>Email Address</label>
            <input name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. sarah@contractor.co.uk" required />
          </div>
          <div className="filter-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <label className="filter-title" style={{ fontSize: '11px' }}>Password</label>
              <Link href="/forgot-password" style={{ fontSize: '11px', color: 'var(--color-primary)' }}>Forgot password?</Link>
            </div>
            <input name="password" type="password" autoComplete="current-password" placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={isPending} className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            {isPending ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          New to the portal? <Link href="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
