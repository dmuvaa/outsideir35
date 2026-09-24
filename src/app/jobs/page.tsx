import React, { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import ClientJobBoard from './ClientJobBoard';
import { isLiveJob } from '@/lib/platform';

export const metadata = {
  title: 'UK contract jobs | OutsideIR35',
  description: 'Live UK contractor roles. Outside IR35 is the default view. Filter by rate, location, remote, and clearance.',
};

export default async function JobsPage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  const { data: jobsRaw, error: jobsError } = await supabase
    .from('jobs')
    .select(`
      *, 
      companies(name, logo_url, slug, is_verified),
      job_categories(categories(id, name, slug)),
      job_skills(skills(id, name, slug))
    `)
    .in('status', ['active', 'open', 'published'])
    .order('created_at', { ascending: false });

  const jobs = (jobsRaw || []).filter((job) => isLiveJob(job));
  if (jobsError) {
    console.error('Jobs board query failed:', jobsError.message);
  }

  // Fetch all categories and skills for the filter sidebar
  const { data: categories } = await supabase.from('categories').select('*').order('name');
  const { data: skills } = await supabase.from('skills').select('*').order('name');

  // Fetch applications if user is logged in
  let applications: string[] = [];
  if (user) {
    const { data: apps } = await supabase
      .from('applications')
      .select('job_id')
      .eq('user_id', user.id);
    if (apps) {
      applications = apps.map(a => a.job_id);
    }
  }

  return (
    <Suspense fallback={<div className="container" style={{ padding: '40px 0', textAlign: 'center' }}>Loading contracts...</div>}>
      <ClientJobBoard 
        initialJobs={jobs || []} 
        applications={applications} 
        categories={categories || []} 
        skills={skills || []} 
      />
    </Suspense>
  );
}
