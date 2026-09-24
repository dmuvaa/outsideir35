import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getDbRole } from '@/lib/auth-role';
import { redirect } from 'next/navigation';
import JobForm from '@/app/dashboard/recruiter/jobs/components/JobForm';

export default async function AdminEditRolePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = await params;
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const role = await getDbRole(supabase, user);
  if (role !== 'admin') redirect('/dashboard/admin');

  const { data: job } = await supabase.from('jobs').select('*').eq('id', jobId).single();
  if (!job) {
    return <div className="container" style={{ padding: '40px' }}>Role not found</div>;
  }

  const { data: categories } = await supabase.from('categories').select('*').order('name');
  const { data: skills } = await supabase.from('skills').select('*').order('name');
  const { data: jobCategories } = await supabase.from('job_categories').select('category_id').eq('job_id', jobId);
  const { data: jobSkills } = await supabase.from('job_skills').select('skill_id').eq('job_id', jobId);

  return (
    <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-header)', marginBottom: '8px' }}>Edit role</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Update this contract. Saving keeps it on the candidate board.</p>
      <JobForm
        mode="edit"
        returnTo="/dashboard/admin/roles"
        initialData={{
          ...job,
          category_id: jobCategories?.[0]?.category_id || '',
          skill_ids: (jobSkills || []).map((row) => row.skill_id),
        }}
        categories={categories || []}
        skills={skills || []}
      />
    </div>
  );
}
