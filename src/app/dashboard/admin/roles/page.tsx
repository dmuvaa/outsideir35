import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getDbRole } from '@/lib/auth-role';
import { redirect } from 'next/navigation';
import RoleManager, { type ManagedRole } from './RoleManager';

export default async function AdminRolesPage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const role = await getDbRole(supabase, user);
  if (role !== 'admin') redirect('/dashboard/admin');

  const { data, error } = await supabase
    .from('jobs')
    .select('id, title, slug, status, source, ir35_status, location, day_rate_min, day_rate_max, created_at, companies(name)')
    .order('created_at', { ascending: false })
    .limit(1000);

  const roles = (error
    ? (await supabase
      .from('jobs')
      .select('id, title, slug, status, ir35_status, location, day_rate_min, day_rate_max, created_at, companies(name)')
      .order('created_at', { ascending: false })
      .limit(1000)).data || []
    : data || []) as ManagedRole[];

  return (
    <div className="fade-in">
      <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-header)', marginBottom: '8px' }}>Roles</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '720px' }}>
        These are the contracts on the site. Edit a role, or remove it so candidates no longer see it.
        Removing a post from the LinkedIn inbox also removes it here when it was published.
      </p>
      <RoleManager roles={roles} />
    </div>
  );
}
