'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getDbRole } from '@/lib/auth-role';

export async function applyForJob(formData: FormData) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to apply' };
  }

  const role = await getDbRole(supabase, user);
  if (role !== 'candidate') {
    return { error: 'Only contractor accounts can apply for roles' };
  }

  const jobId = formData.get('jobId') as string;
  const coverLetter = formData.get('coverLetter') as string;
  const resumeUrl = formData.get('resumeUrl') as string;

  if (!jobId) {
    return { error: 'Invalid job ID' };
  }
  if (!resumeUrl) {
    return { error: 'Upload a CV in your profile before applying' };
  }

  const { data: existingApp } = await supabase
    .from('applications')
    .select('id')
    .eq('user_id', user.id)
    .eq('job_id', jobId)
    .maybeSingle();

  if (existingApp) {
    return { error: 'You have already applied for this role.' };
  }

  const { error } = await supabase.from('applications').insert({
    user_id: user.id,
    job_id: jobId,
    cover_letter: coverLetter,
    resume_url: resumeUrl,
    status: 'applied',
  });

  if (error) {
    if (error.code === '23505' || error.message.includes('unique_job_user_application')) {
      return { error: 'You have already applied for this role.' };
    }
    console.error('Job application error:', error);
    return { error: 'An unexpected error occurred while processing your application. Please try again.' };
  }

  revalidatePath('/jobs');
  revalidatePath('/dashboard/candidate');
  return { success: true };
}

export async function toggleSaveJob(jobId: string, currentlySaved: boolean) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to save jobs' };
  }

  if (currentlySaved) {
    await supabase.from('saved_jobs').delete().match({ user_id: user.id, job_id: jobId });
  } else {
    await supabase.from('saved_jobs').insert({ user_id: user.id, job_id: jobId });
  }

  revalidatePath('/jobs');
  revalidatePath('/dashboard/candidate');
  return { success: true };
}

export async function subscribeToJobAlerts(formData: FormData) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  const email = (formData.get('email') as string || '').trim();

  if (!user) {
    return {
      error: 'Create a free contractor account to receive Outside IR35 alerts.',
      redirect: `/register?email=${encodeURIComponent(email)}`,
    };
  }

  const { data: search, error: searchError } = await supabase.from('saved_searches').insert({
    user_id: user.id,
    name: 'Outside IR35 alerts',
    filters_json: { ir35: 'outside', email: user.email || email },
  }).select('id').single();

  if (searchError) {
    return { error: searchError.message };
  }

  await supabase.from('alerts').insert({
    user_id: user.id,
    saved_search_id: search.id,
    frequency: 'daily',
    is_active: true,
  });

  revalidatePath('/');
  return { success: true };
}
