import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { pathAfterSignIn } from '@/app/actions/auth';
import type { EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cookieStore = await cookies();
  const requestedNext = cookieStore.get('oi_auth_next')?.value || '';
  const supabase = createClient(cookieStore);
  const code = url.searchParams.get('code');
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type');

  let userId: string | null = null;
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) userId = data.user?.id ?? null;
  } else if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    });
    if (!error) userId = data.user?.id ?? null;
  }

  if (!userId) {
    return NextResponse.redirect(new URL('/login?error=link', url.origin));
  }

  cookieStore.delete('oi_auth_next');
  const destination = await pathAfterSignIn(supabase, userId, requestedNext);
  return NextResponse.redirect(new URL(destination, url.origin));
}
