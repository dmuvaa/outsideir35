'use strict';

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'candidate' | 'recruiter'>('candidate');
  const [gdprConsent, setGdprConsent] = useState(false);
  const [error, setError] = useState('');

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      setError('Please complete all form fields.');
      return;
    }
    const name = `${firstName} ${lastName}`.trim();
    if (!gdprConsent) {
      setError('You must accept the privacy policy & GDPR consent checklist.');
      return;
    }

    try {
      const user = await db.register(email, password, role);

      // Save profile baseline
      if (role === 'candidate') {
        const currentProfile = await db.getCandidateProfile();
        await db.saveCandidateProfile({
          ...currentProfile,
          userId: user.id,
          name: name,
          email: email,
          consent: [
            ...currentProfile.consent,
            { type: 'gdpr_privacy_policy', granted: true, ip: '192.168.1.1', date: new Date().toISOString() }
          ]
        });
        router.push('/dashboard');
      } else {
        const currentRecruiter = await db.getRecruiterProfile();
        await db.saveRecruiterProfile({
          ...currentRecruiter,
          userId: user.id,
          name: name,
          email: email
        });
        router.push('/employer');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="container fade-in" style={{ padding: '80px 0', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '460px', padding: '40px', backgroundColor: 'var(--panel-bg-solid)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-header)', marginBottom: '8px' }}>Create contractor account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Join OutsideIR35 to assess compliance and search roles
          </p>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-inside-glow)', border: '1px solid var(--color-inside)', borderRadius: 'var(--radius-sm)', color: 'var(--color-inside)', fontSize: '13px', marginBottom: '20px' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Persona selector toggle */}
          <div className="filter-group">
            <label className="filter-title" style={{ fontSize: '11px' }}>Account Classification</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button" 
                onClick={() => setRole('candidate')}
                className={`btn btn-sm ${role === 'candidate' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
              >
                👨‍💻 Candidate
              </button>
              <button 
                type="button" 
                onClick={() => setRole('recruiter')}
                className={`btn btn-sm ${role === 'recruiter' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
              >
                💼 Employer / Recruiter
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="filter-group">
              <label className="filter-title" style={{ fontSize: '11px' }}>First Name</label>
              <input 
                type="text" 
                placeholder="e.g. Sarah"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="filter-group">
              <label className="filter-title" style={{ fontSize: '11px' }}>Last Name</label>
              <input 
                type="text" 
                placeholder="e.g. Jenkins"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-title" style={{ fontSize: '11px' }}>Email Address</label>
            <input 
              type="email" 
              placeholder="e.g. contractor@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="filter-group">
            <label className="filter-title" style={{ fontSize: '11px' }}>Secure Password</label>
            <input 
              type="password" 
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* GDPR / KDPA Consent Checkbox */}
          <label className="filter-checkbox-item" style={{ marginTop: '8px', alignItems: 'flex-start' }}>
            <input 
              type="checkbox" 
              checked={gdprConsent} 
              onChange={() => setGdprConsent(!gdprConsent)}
              style={{ marginTop: '4px' }}
            />
            <span style={{ fontSize: '12px', lineHeight: '1.4', color: 'var(--text-secondary)' }}>
              I agree to the privacy policy terms, consenting to the secure storage of my CV in private buckets and recording of audit consent logs.
            </span>
          </label>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            Register Account
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
}
