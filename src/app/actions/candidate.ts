'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function updateCandidateProfile(formData: FormData) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const updates: Record<string, unknown> = {
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    headline: formData.get('headline'),
    bio: formData.get('bio'),
    location: formData.get('location'),
    website_url: formData.get('website_url'),
    linkedin_url: formData.get('linkedin_url'),
    github_url: formData.get('github_url'),
    availability: formData.get('availability'),
    min_day_rate: formData.get('min_day_rate') ? parseInt(formData.get('min_day_rate') as string, 10) : null,
    max_day_rate: formData.get('max_day_rate') ? parseInt(formData.get('max_day_rate') as string, 10) : null,
    clearance_level: formData.get('clearance_level') || 'none',
    is_profile_public: formData.get('is_profile_public') === 'on',
  };

  let resume_url = formData.get('existing_resume_url') as string || formData.get('resume_url') as string;
  const resume_file = formData.get('resume_file') as File | null;
  
  if (resume_file && resume_file.size > 0) {
    const fileExt = resume_file.name.split('.').pop() || 'pdf';
    const fileName = `resume-${user.id}-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage.from('media').upload(fileName, resume_file);
    if (uploadError) return { error: `Resume upload failed: ${uploadError.message}` };
    
    const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);
    resume_url = publicUrl;
  }

  const { error } = await supabase
    .from('candidate_profiles')
    .upsert(
      { ...updates, resume_url, user_id: user.id },
      { onConflict: 'user_id' }
    );

  if (error) {
    const { github_url, ...withoutGithub } = updates;
    const retry = await supabase
      .from('candidate_profiles')
      .upsert(
        { ...withoutGithub, resume_url, user_id: user.id },
        { onConflict: 'user_id' }
      );
    if (retry.error) return { error: retry.error.message };
  }

  revalidatePath('/dashboard/candidate');
  revalidatePath('/dashboard/candidate/settings');
  return { success: true };
}
