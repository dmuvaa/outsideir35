'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { requestPasswordReset } from '@/app/actions/auth';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError('');
    const result = await requestPasswordReset(formData);
    setIsPending(false);
    if (result && 'error' in result && result.error) {
      setError(result.error);
      return;
    }
    setSent(true);
  }

  return (
    <div className="container fade-in" style={{ padding: '80px 0', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '40px', backgroundColor: 'var(--panel-bg-solid)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-header)', marginBottom: '8px' }}>
            {sent ? 'Check your email' : 'Reset your password'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            {sent
              ? 'If that address has an account, a reset link is on its way. Open it in this browser.'
              : 'We will email a link to choose a new password.'}
          </p>
        </div>
        {error && (
          <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-inside-glow)', border: '1px solid var(--color-inside)', borderRadius: 'var(--radius-sm)', color: 'var(--color-inside)', fontSize: '13px', marginBottom: '20px' }}>
            {error}
          </div>
        )}
        {!sent ? (
          <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="filter-group">
              <label className="filter-title" style={{ fontSize: '11px' }}>Email Address</label>
              <input name="email" type="email" autoComplete="email" placeholder="e.g. sarah@contractor.co.uk" required />
            </div>
            <button type="submit" disabled={isPending} className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
              {isPending ? 'Sending...' : 'Email reset link'}
            </button>
          </form>
        ) : null}
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px' }}>
          <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
