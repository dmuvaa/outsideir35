import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import JobForm from '../../components/JobForm';
import { redirect } from 'next/navigation';

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const jobId = resolvedParams.id;

  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: job } = await supabase.from('jobs').select('*').eq('id', jobId).single();

  if (!job) {
    return <div className="container" style={{ padding: '40px' }}>Job not found</div>;
  }

  const { data: categories } = await supabase.from('categories').select('*').order('name');
  const { data: skills } = await supabase.from('skills').select('*').order('name');
  
  const { data: jobCategories } = await supabase.from('job_categories').select('category_id').eq('job_id', jobId);
  const { data: jobSkills } = await supabase.from('job_skills').select('skill_id').eq('job_id', jobId);

  const initialCategory = jobCategories && jobCategories.length > 0 ? jobCategories[0].category_id : '';
  const initialSkills = jobSkills ? jobSkills.map(s => s.skill_id) : [];

  return (
    <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-header)', marginBottom: '8px' }}>Edit Contract</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Update the details of your contract posting.</p>
      
      <JobForm 
        mode="edit" 
        initialData={{...job, category_id: initialCategory, skill_ids: initialSkills}} 
        categories={categories || []} 
        skills={skills || []} 
      />
    </div>
  );
}
