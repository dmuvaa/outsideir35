import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

import SidebarNav from './SidebarNav';
import { getDbRole } from '@/lib/auth-role';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return <>{children}</>;

  const role = await getDbRole(supabase, user);

  const isRecruiter = role === 'recruiter';
  const isCandidate = role === 'candidate';
  const isAdmin = role === 'admin';

  return (
    <div className="dashboard-shell" style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      {/* Sidebar */}
      <SidebarNav role={role} isRecruiter={isRecruiter} isCandidate={isCandidate} isAdmin={isAdmin} />

      {/* Main Content */}
      <main style={{ padding: '32px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
