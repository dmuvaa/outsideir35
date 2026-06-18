'use strict';

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'candidate' | 'recruiter' | 'admin'>('candidate');
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all credentials.');
      return;
    }

    try {
      const user = await db.login(email, password);
      if (user.role !== role) {
        setError(`Account is not registered as a ${role}.`);
        return;
      }
      
      // Redirect based on selected persona
      if (role === 'candidate') router.push('/dashboard');
      else if (role === 'recruiter') router.push('/employer');
      else if (role === 'admin') router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    }
  };

  const handleGoogleSignIn = async () => {
    const defaultEmail = role === 'candidate' ? 'contractor@example.com' : 'hiring@devtech.example.com';
    try {
      await db.login(defaultEmail, 'Password123!');
      if (role === 'candidate') router.push('/dashboard');
      else router.push('/employer');
    } catch (err: any) {
      setError('Google Sign-In failed: ' + err.message);
    }
  };

  return (
    <div className="container fade-in" style={{ padding: '80px 0', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '40px', backgroundColor: 'var(--panel-bg-solid)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-header)', marginBottom: '8px' }}>Welcome back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Access your OutsideIR35 contract tracking dashboard
          </p>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-inside-glow)', border: '1px solid var(--color-inside)', borderRadius: 'var(--radius-sm)', color: 'var(--color-inside)', fontSize: '13px', marginBottom: '20px' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Role selector segment */}
          <div className="filter-group">
            <label className="filter-title" style={{ fontSize: '11px' }}>I am logging in as a:</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button" 
                onClick={() => setRole('candidate')}
                className={`btn btn-sm ${role === 'candidate' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
              >
                Candidate
              </button>
              <button 
                type="button" 
                onClick={() => setRole('recruiter')}
                className={`btn btn-sm ${role === 'recruiter' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
              >
                Recruiter
              </button>
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-title" style={{ fontSize: '11px' }}>Email Address</label>
            <input 
              type="email" 
              placeholder="e.g. sarah@contractor.co.uk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="filter-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <label className="filter-title" style={{ fontSize: '11px' }}>Password</label>
              <Link href="/login" style={{ fontSize: '11px', color: 'var(--color-primary)' }}>Forgot Password?</Link>
            </div>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            Sign In with Email
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '24px 0', fontSize: '12px', color: 'var(--text-muted)' }}>
          <hr style={{ flex: 1, borderColor: 'var(--panel-border)' }} />
          <span>OR CONTINUE WITH</span>
          <hr style={{ flex: 1, borderColor: 'var(--panel-border)' }} />
        </div>

        {/* Google OAuth Button */}
        <button onClick={handleGoogleSignIn} className="btn btn-secondary" style={{ width: '100%', gap: '10px' }}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.8 2.71v2.24h2.91c1.7-1.56 2.69-3.87 2.69-6.58z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.24c-.8.54-1.84.87-3.05.87-2.35 0-4.33-1.59-5.04-3.73H.95v2.3A9 9 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.96 10.72A5.4 5.4 0 0 1 3.6 9c0-.6.1-1.17.29-1.72V4.98H.95A9 9 0 0 0 .95 13.02l3.01-2.3z" fill="#FBBC05"/>
            <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.4A9 9 0 0 0 .95 4.98l3.01 2.3c.71-2.14 2.69-3.72 5.04-3.72z" fill="#EA4335"/>
          </svg>
          Sign In with Google
        </button>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          New to the portal? <Link href="/register" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>Register here</Link>
        </p>
      </div>
    </div>
  );
}
