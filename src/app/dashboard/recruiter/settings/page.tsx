import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import CompanyForm from './CompanyForm';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function RecruiterSettingsPage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('recruiter_profiles').select('company_id').eq('user_id', user.id).maybeSingle();

  let company = null;
  if (profile?.company_id) {
    const { data: comp } = await supabase.from('companies').select('*').eq('id', profile.company_id).single();
    company = comp;
  }

  const categoryQuery = await supabase.from('categories').select('id, name, parent_id').order('name');
  const categories = categoryQuery.error
    ? (await supabase.from('categories').select('id, name').order('name')).data || []
    : (categoryQuery.data || []).filter((category) => !category.parent_id);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-header)', marginBottom: '8px' }}>Company Profile</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Update your company details. A complete profile is required to post new contracts.</p>
      </div>

      <CompanyForm initialData={company || {}} categories={categories || []} />
    </div>
  );
}
