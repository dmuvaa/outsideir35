import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { RegisterForm } from './form';

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  return <RegisterForm mode={user ? 'profile' : 'signup'} email={params.email || ''} />;
}
