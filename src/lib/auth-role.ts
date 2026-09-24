import type { User } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function getDbRole(supabase: SupabaseClient, user: User): Promise<string> {
  const { data: byId } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle();
  if (byId?.role) return byId.role;

  if (user.email) {
    const { data: byEmail } = await supabase.from('users').select('role').eq('email', user.email).maybeSingle();
    if (byEmail?.role) return byEmail.role;
  }

  return 'candidate';
}
