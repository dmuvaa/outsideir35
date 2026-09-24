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

export async function archiveJobAsAdmin(jobId: string) {
  try {
    const { supabase } = await verifyAdmin();
    const { error } = await supabase.from('jobs').update({
      status: 'archived',
      updated_at: new Date().toISOString(),
    }).eq('id', jobId);
    if (error) throw new Error(error.message);
    revalidatePath('/dashboard/admin');
    revalidatePath('/jobs');
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
