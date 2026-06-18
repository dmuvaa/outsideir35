'use strict';

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { db } from '@/lib/db';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Sync theme
    const savedTheme = localStorage.getItem('ob_theme') as 'dark' | 'light' | null;
    const currentTheme = savedTheme || 'light';
    setTheme(currentTheme);
    if (currentTheme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    // Sync auth user
    setCurrentUser(db.getAuthUser());
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('ob_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  return (
    <header className="site-header">
      <div className="container header-container">
        <Link href="/" className="logo-wrapper">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: 'url(#violetGlow)' }}>
            <defs>
              <linearGradient id="violetGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          OutsideIR35
        </Link>

        <nav className="nav-links">
          <Link href="/jobs" className={`nav-link ${pathname === '/jobs' ? 'active' : ''}`}>
            Find Contracts
          </Link>
          <Link href="/companies" className={`nav-link ${pathname === '/companies' ? 'active' : ''}`}>
            Companies
          </Link>
          <Link href="/blog" className={`nav-link ${pathname?.startsWith('/blog') ? 'active' : ''}`}>
            Contractor Blog
          </Link>
          <Link href="/guides" className={`nav-link ${pathname?.startsWith('/guides') ? 'active' : ''}`}>
            Compliance Guides
          </Link>
        </nav>

        <div className="nav-actions">
          {/* Theme Switcher Toggle */}
          <button onClick={toggleTheme} className="btn btn-secondary btn-sm" aria-label="Toggle Theme" style={{ padding: '8px' }}>
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>

          {!currentUser ? (
            <>
              <Link href="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          ) : (
            <>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginRight: '8px' }}>
                👤 {currentUser.email}
              </span>
              <Link href={currentUser.role === 'candidate' ? '/dashboard' : currentUser.role === 'recruiter' ? '/employer' : '/admin'} className="btn btn-primary btn-sm">
                {currentUser.role === 'candidate' ? 'Candidate Dashboard' : currentUser.role === 'recruiter' ? 'Recruiter Dashboard' : 'Admin Portal'}
              </Link>
              <button 
                onClick={async () => {
                  await db.logout();
                  setCurrentUser(null);
                  router.push('/');
                  router.refresh();
                }} 
                className="btn btn-secondary btn-sm"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
