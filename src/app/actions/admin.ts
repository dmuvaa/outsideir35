'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getDbRole } from '@/lib/auth-role';

async function verifyAdmin() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  const role = await getDbRole(supabase, user);
  if (role !== 'admin') throw new Error('Admin access required');
  return { supabase, user };
}

export async function deleteJobsAsAdmin(jobIds: string[]) {
  try {
    const { supabase } = await verifyAdmin();
    const ids = [...new Set(jobIds.filter((id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)))];
    if (!ids.length) return { error: 'Choose at least one role to remove.' };
    await supabase.from('scraped_jobs').update({ status: 'rejected', published_job_id: null }).in('published_job_id', ids);
    const { error, count } = await supabase.from('jobs').delete({ count: 'exact' }).in('id', ids);
    if (error) return { error: error.message };
    revalidatePath('/dashboard/admin');
    revalidatePath('/dashboard/admin/roles');
    revalidatePath('/dashboard/admin/scrape');
    revalidatePath('/jobs');
    revalidatePath('/');
    return { success: true, removed: count ?? ids.length };
  } catch (error: any) {
    return { error: error.message || 'Could not remove roles' };
  }
}

export async function archiveJobAsAdmin(jobId: string) {
  try {
    const { supabase } = await verifyAdmin();
    const { error } = await supabase.from('jobs').update({
      status: 'archived',
      updated_at: new Date().toISOString(),
    }).eq('id', jobId);
    if (error) throw new Error(error.message);
    revalidatePath('/dashboard/admin');
    revalidatePath('/dashboard/admin/roles');
    revalidatePath('/jobs');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function setCompanyVerified(companyId: string, verified: boolean) {
  try {
    const { supabase } = await verifyAdmin();
    const { error } = await supabase.from('companies').update({
      is_verified: verified,
      updated_at: new Date().toISOString(),
    }).eq('id', companyId);
    if (error) throw new Error(error.message);
    revalidatePath('/dashboard/admin');
    revalidatePath('/companies');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
