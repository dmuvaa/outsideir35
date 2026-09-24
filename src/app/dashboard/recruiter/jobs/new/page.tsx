import React from 'react';
import JobForm from '../components/JobForm';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function NewJobPage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('recruiter_profiles').select('*, companies(*)').eq('user_id', user.id).single();
  const company = Array.isArray(profile?.companies) ? profile.companies[0] : profile?.companies;

  const profileIncomplete = !company?.description || !company?.website_url;

  if (profileIncomplete) {
    return (
      <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '60px 0' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-header)', marginBottom: '16px' }}>Profile Incomplete</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '18px' }}>
          You must complete your company profile before posting a new contract.
        </p>
        <Link href="/dashboard/recruiter/settings" className="btn btn-primary">
          Go to Settings
        </Link>
      </div>
    );
  }

  const { data: categories } = await supabase.from('categories').select('*').order('name');
  const { data: skills } = await supabase.from('skills').select('*').order('name');

  return (
    <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-header)', marginBottom: '8px' }}>Post New Contract</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Fill out the details below to publish a new contract opportunity.</p>
      
      <JobForm mode="create" categories={categories || []} skills={skills || []} />
    </div>
  );
}
