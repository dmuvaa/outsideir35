'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { sendSignInCode, verifySignInCode } from '@/app/actions/auth';

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams?.get('next') || '';
  const [email, setEmail] = useState(searchParams?.get('email') || '');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  async function handleSend(formData: FormData) {
    setIsPending(true);
    setError('');
    const result = await sendSignInCode(formData);
    setIsPending(false);
    if (result && 'error' in result && result.error) {
      setError(result.error);
      return;
    }
    setEmail(String(formData.get('email') || ''));
    setSent(true);
  }

  async function handleVerify(formData: FormData) {
    setIsPending(true);
    setError('');
    const result = await verifySignInCode(formData);
    if (result && 'error' in result && result.error) {
      setError(result.error);
      setIsPending(false);
    }
  }

  return (
    <div className="container fade-in" style={{ padding: '80px 0', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '40px', backgroundColor: 'var(--panel-bg-solid)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-header)', marginBottom: '8px' }}>
            {sent ? 'Check your email' : 'Sign in'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            {sent
              ? `Enter the code we sent to ${email}. New addresses get an account when the code is accepted.`
              : 'We email you a one-time code. There is no password.'}
          </p>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-inside-glow)', border: '1px solid var(--color-inside)', borderRadius: 'var(--radius-sm)', color: 'var(--color-inside)', fontSize: '13px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {!sent ? (
          <form action={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="filter-group">
              <label className="filter-title" style={{ fontSize: '11px' }}>Email Address</label>
              <input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. sarah@contractor.co.uk" required />
            </div>
            <button type="submit" disabled={isPending} className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
              {isPending ? 'Sending code...' : 'Email me a code'}
            </button>
          </form>
        ) : (
          <form action={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="next" value={next} />
            <div className="filter-group">
              <label className="filter-title" style={{ fontSize: '11px' }}>Email code</label>
              <input name="token" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]*" maxLength={8} placeholder="123456" required />
            </div>
            <button type="submit" disabled={isPending} className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
              {isPending ? 'Checking code...' : 'Continue'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={isPending}
              onClick={() => { setSent(false); setError(''); }}
            >
              Use a different email
            </button>
          </form>
        )}
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
