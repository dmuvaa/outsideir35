'use client';

import React, { useState } from 'react';
import { updatePassword } from '@/app/actions/auth';

export default function ResetPasswordPage() {
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError('');
    const result = await updatePassword(formData);
    if (result && 'error' in result && result.error) {
      setError(result.error);
      setIsPending(false);
    }
  }

  return (
    <div className="container fade-in" style={{ padding: '80px 0', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '40px', backgroundColor: 'var(--panel-bg-solid)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-header)', marginBottom: '8px' }}>Choose a new password</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Use at least 8 characters. You will be signed in afterwards.
          </p>
        </div>
        {error && (
          <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-inside-glow)', border: '1px solid var(--color-inside)', borderRadius: 'var(--radius-sm)', color: 'var(--color-inside)', fontSize: '13px', marginBottom: '20px' }}>
            {error}
          </div>
        )}
        <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="filter-group">
            <label className="filter-title" style={{ fontSize: '11px' }}>New password</label>
            <input name="password" type="password" autoComplete="new-password" minLength={8} required />
          </div>
          <div className="filter-group">
            <label className="filter-title" style={{ fontSize: '11px' }}>Confirm password</label>
            <input name="confirm" type="password" autoComplete="new-password" minLength={8} required />
          </div>
          <button type="submit" disabled={isPending} className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            {isPending ? 'Saving...' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}
