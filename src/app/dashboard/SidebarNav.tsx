'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SidebarNav({ role, isRecruiter, isCandidate, isAdmin }: { role: string, isRecruiter: boolean, isCandidate: boolean, isAdmin: boolean }) {
  const pathname = usePathname();

  const getLinkStyle = (href: string) => {
    // For overview, match exactly. For others, allow sub-paths to keep parent active.
    // E.g. /dashboard/candidate/settings/something -> Settings is active.
    const isOverview = href === `/dashboard/${role}`;
    let isActive = false;
    
    if (isOverview) {
      isActive = pathname === href;
    } else {
      // Don't let /jobs match everything if it's just a root check, but /jobs is fine here
      // Ignore hash in href for pathname matching
      const pathPart = href.split('#')[0];
      if (pathPart === `/dashboard/${role}`) {
        // if it's an anchor on the same page, we don't want it to override overview
        isActive = false; 
      } else {
        isActive = pathname?.startsWith(pathPart) || false;
      }
    }

    // Special case for Find Contracts (/jobs) when not in dashboard
    if (href === '/jobs' && pathname === '/jobs') isActive = true;

    return {
      textAlign: 'left' as const,
      padding: '8px 12px',
      borderRadius: 'var(--radius-sm)',
      background: isActive ? 'var(--panel-bg-hover)' : 'transparent',
      color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
      fontWeight: isActive ? '600' : '500',
      textDecoration: 'none',
      display: 'block',
      borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
      transition: 'all 0.2s',
      marginLeft: '-3px' // Offset border
    };
  };

  return (
    <aside className="glass-panel" style={{ borderRadius: 0, borderRight: '1px solid var(--panel-border)', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '16px' }}>
          {isRecruiter ? 'Employer Portal' : isCandidate ? 'Candidate Portal' : 'Admin Portal'}
        </h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link href={`/dashboard/${role}`} style={getLinkStyle(`/dashboard/${role}`)}>
            Overview
          </Link>

          {isRecruiter && (
            <>
              <Link href="/dashboard/recruiter/jobs" style={getLinkStyle('/dashboard/recruiter/jobs')}>
                My Contracts
              </Link>
              <Link href="/dashboard/recruiter/applications" style={getLinkStyle('/dashboard/recruiter/applications')}>
                Applications Pipeline
              </Link>
              <Link href="/candidates" style={getLinkStyle('/candidates')}>
                Contractor directory
              </Link>
            </>
          )}

          {isCandidate && (
            <>
              <Link href="/jobs" style={getLinkStyle('/jobs')}>
                Find Contracts
              </Link>
              <Link href="/dashboard/candidate#applications" style={getLinkStyle('/dashboard/candidate#applications')}>
                My Applications
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link href="/dashboard/admin/roles" style={getLinkStyle('/dashboard/admin/roles')}>
                Roles
              </Link>
              <Link href="/dashboard/admin/outreach" style={getLinkStyle('/dashboard/admin/outreach')}>
                Outreach
              </Link>
              <Link href="/dashboard/admin/scrape" style={getLinkStyle('/dashboard/admin/scrape')}>
                LinkedIn scrape
              </Link>
            </>
          )}

          <Link href={`/dashboard/${role}/settings`} style={getLinkStyle(`/dashboard/${role}/settings`)}>
            Settings
          </Link>
        </nav>
      </div>
    </aside>
  );
}
