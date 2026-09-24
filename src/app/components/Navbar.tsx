'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/actions/auth';

interface NavbarProps {
  user: { email: string | undefined; role: string } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <div className="container header-container" style={{ position: 'relative' }}>
        <Link href="/" className="logo-wrapper">
          <img src="/outsideir35-icon.svg" alt="" width="28" height="28" />
          OutsideIR35
        </Link>

        {/* Hamburger Menu Toggle (Mobile Only) */}
        <button 
          className="mobile-menu-toggle" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? '✖' : '☰'}
        </button>

        <nav className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {!user && (
            <>
              <Link href="/jobs" onClick={() => setMobileMenuOpen(false)} className={`nav-link ${pathname === '/jobs' ? 'active' : ''}`}>
                Find Contracts
              </Link>
              <Link href="/companies" onClick={() => setMobileMenuOpen(false)} className={`nav-link ${pathname === '/companies' ? 'active' : ''}`}>
                Companies
              </Link>
              <Link href="/register?role=recruiter" onClick={() => setMobileMenuOpen(false)} className={`nav-link`}>
                Post a Contract
              </Link>
              <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className={`nav-link ${pathname === '/pricing' ? 'active' : ''}`}>
                Pricing
              </Link>
            </>
          )}

          {user?.role === 'candidate' && (
            <>
              <Link href="/dashboard/candidate" onClick={() => setMobileMenuOpen(false)} className={`nav-link ${pathname === '/dashboard/candidate' ? 'active' : ''}`}>
                My Dashboard
              </Link>
              <Link href="/jobs" onClick={() => setMobileMenuOpen(false)} className={`nav-link ${pathname === '/jobs' ? 'active' : ''}`}>
                Find Contracts
              </Link>
              <Link href="/companies" onClick={() => setMobileMenuOpen(false)} className={`nav-link ${pathname === '/companies' ? 'active' : ''}`}>
                Companies
              </Link>
              <Link href="/dashboard/candidate/settings" onClick={() => setMobileMenuOpen(false)} className={`nav-link ${pathname?.includes('/settings') ? 'active' : ''}`}>
                Profile & Settings
              </Link>
            </>
          )}

          {user?.role === 'recruiter' && (
            <>
              <Link href="/dashboard/recruiter" onClick={() => setMobileMenuOpen(false)} className={`nav-link ${pathname === '/dashboard/recruiter' ? 'active' : ''}`}>
                Dashboard
              </Link>
              <Link href="/dashboard/recruiter/jobs" onClick={() => setMobileMenuOpen(false)} className={`nav-link ${pathname?.includes('/jobs') ? 'active' : ''}`}>
                Manage Postings
              </Link>
              <Link href="/dashboard/recruiter/applications" onClick={() => setMobileMenuOpen(false)} className={`nav-link ${pathname?.includes('/applications') ? 'active' : ''}`}>
                Applications
              </Link>
              <Link href="/dashboard/recruiter/settings" onClick={() => setMobileMenuOpen(false)} className={`nav-link ${pathname?.includes('/settings') ? 'active' : ''}`}>
                Company Settings
              </Link>
            </>
          )}

          {user?.role === 'admin' && (
            <>
              <Link href="/dashboard/admin" onClick={() => setMobileMenuOpen(false)} className={`nav-link ${pathname === '/dashboard/admin' ? 'active' : ''}`}>
                Admin Dashboard
              </Link>
            </>
          )}
        </nav>

        <div className={`nav-actions ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {/* Theme Switcher Toggle */}
          <button onClick={toggleTheme} className="btn btn-secondary btn-sm theme-toggle" aria-label="Toggle Theme" style={{ padding: '8px' }}>
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>

          {!user ? (
            <>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary btn-sm">
                Get started
              </Link>
            </>
          ) : (
            <>
              <span className="user-email">
                👤 {user.email}
              </span>
              <Link 
                href={user.role === 'candidate' ? '/dashboard/candidate' : user.role === 'recruiter' ? '/dashboard/recruiter' : '/dashboard/admin'} 
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary btn-sm"
              >
                {user.role === 'candidate' ? 'Candidate Dashboard' : user.role === 'recruiter' ? 'Recruiter Dashboard' : 'Admin Portal'}
              </Link>
              <form action={logout}>
                <button 
                  type="submit"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Logout
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
