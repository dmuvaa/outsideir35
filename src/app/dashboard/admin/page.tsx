import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import AdminTools from './AdminTools';

export default async function AdminDashboard() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ count: jobCount }, { data: jobs }, { data: companies }, { count: userCount }, { count: appCount }] = await Promise.all([
    supabase.from('jobs').select('*', { count: 'exact', head: true }),
    supabase.from('jobs').select('id, title, status, ir35_status, created_at, companies(name)').order('created_at', { ascending: false }).limit(20),
    supabase.from('companies').select('id, name, is_verified, slug').order('name').limit(20),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('applications').select('*', { count: 'exact', head: true }),
  ]);

  return (
    <div className="fade-in">
      <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-header)', marginBottom: '8px' }}>Admin</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Moderation and listing health. No billing tools yet.</p>
      <p style={{ marginBottom: '32px' }}>
        <Link href="/dashboard/admin/scrape" className="btn btn-primary btn-sm">LinkedIn scrape inbox</Link>
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}><div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Jobs</div><div style={{ fontSize: '32px', fontWeight: 800 }}>{jobCount ?? 0}</div></div>
        <div className="glass-panel" style={{ padding: '20px' }}><div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Users</div><div style={{ fontSize: '32px', fontWeight: 800 }}>{userCount ?? 0}</div></div>
        <div className="glass-panel" style={{ padding: '20px' }}><div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Applications</div><div style={{ fontSize: '32px', fontWeight: 800 }}>{appCount ?? 0}</div></div>
      </div>

      <AdminTools jobs={jobs || []} companies={companies || []} />
    </div>
  );
}
