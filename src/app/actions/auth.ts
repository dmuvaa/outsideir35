'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDbRole } from '@/lib/auth-role';
import { slugify, validateRegisterInput } from '@/lib/platform';

function dashboardFor(role: string) {
  if (role === 'recruiter') return '/dashboard/recruiter';
  if (role === 'admin') return '/dashboard/admin';
  return '/dashboard/candidate';
}

function normalizeEmail(value: FormDataEntryValue | null) {
  return String(value || '').trim().toLowerCase();
}

function safeProfilePath(value: FormDataEntryValue | string | null) {
  const raw = String(value || '');
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/register';
  let url: URL;
  try {
    url = new URL(raw, 'http://local');
  } catch {
    return '/register';
  }
  if (url.pathname !== '/register') return '/register';
  return url.searchParams.get('role') === 'recruiter' ? '/register?role=recruiter' : '/register';
}

async function needsProfile(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data: account } = await supabase.from('users').select('role').eq('id', userId).maybeSingle();
  if (account?.role === 'admin') return false;

  const [{ data: candidate }, { data: recruiter }] = await Promise.all([
    supabase.from('candidate_profiles').select('user_id').eq('user_id', userId).maybeSingle(),
    supabase.from('recruiter_profiles').select('user_id').eq('user_id', userId).maybeSingle(),
  ]);

  if (account?.role === 'recruiter') return !recruiter;
  return !candidate && !recruiter;
}

async function completeAccountSetup(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  input: { email: string; role: string; firstName: string; lastName: string; companyName: string }
) {
  const { data: existing } = await supabase.from('users').select('id, role').eq('id', userId).maybeSingle();
  if (!existing) {
    const { error } = await supabase.from('users').insert({
      id: userId,
      email: input.email,
      role: 'candidate',
    });
    if (error && error.code !== '23505') {
      console.error('Error creating public user record:', error);
      return { error: 'Error creating user profile' };
    }
  }

  if (existing?.role !== 'admin' && input.role !== existing?.role) {
    const { error } = await supabase.from('users').update({ role: input.role }).eq('id', userId);
    if (error) return { error: error.message };
  }

  const { data: consent } = await supabase
    .from('consent_records')
    .select('id')
    .eq('user_id', userId)
    .eq('consent_type', 'gdpr_privacy_policy')
    .maybeSingle();
  if (!consent) {
    const hdrs = await headers();
    await supabase.from('consent_records').insert({
      user_id: userId,
      consent_type: 'gdpr_privacy_policy',
      is_granted: true,
      ip_address: hdrs.get('x-forwarded-for')?.split(',')[0] || null,
      user_agent: hdrs.get('user-agent')?.slice(0, 500) || null,
    });
  }

  if (input.role === 'recruiter') {
    const { data: recruiter } = await supabase
      .from('recruiter_profiles')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();
    if (!recruiter && input.companyName) {
      const { data: newCompany, error: compError } = await supabase.from('companies').insert({
        name: input.companyName,
        slug: uniqueCompanySlug(input.companyName),
        industry: 'Other',
        size_band: '1-10',
      }).select().single();
      if (compError) {
        console.error('Company create error:', compError);
        return { error: 'Account created, but company setup failed. Finish it in settings.' };
      }
      await supabase.from('recruiter_profiles').insert({
        user_id: userId,
        company_id: newCompany.id,
        first_name: input.firstName,
        last_name: input.lastName,
      });
    }
    return { error: null };
  }

  const { data: candidate } = await supabase
    .from('candidate_profiles')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();
  if (!candidate && input.firstName) {
    const { error } = await supabase.from('candidate_profiles').insert({
      user_id: userId,
      first_name: input.firstName,
      last_name: input.lastName,
      is_profile_public: false,
    });
    if (error && error.code !== '23505') {
      console.error('Candidate profile create error:', error);
    }
  }
  return { error: null };
}

async function siteOrigin() {
  const headerOrigin = (await headers()).get('origin');
  return headerOrigin || process.env.NEXT_PUBLIC_SITE_URL || 'https://outsideir35.vercel.app';
}

function passwordError(password: string) {
  if (password.length < 8) return 'Password must be at least 8 characters';
  return null;
}

export async function pathAfterSignIn(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  requestedNext: string
) {
  if (requestedNext === '/reset-password') return '/reset-password';
  if (await needsProfile(supabase, userId)) return safeProfilePath(requestedNext);
  const { data: { user } } = await supabase.auth.getUser();
  const role = user ? await getDbRole(supabase, user) : 'candidate';
  return dashboardFor(role);
}

export async function login(formData: FormData) {
  const email = normalizeEmail(formData.get('email'));
  const password = String(formData.get('password') || '');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password) {
    return { error: 'Enter your email and password' };
  }

  const supabase = createClient(await cookies());
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: 'Incorrect email or password' };

  redirect(await pathAfterSignIn(supabase, data.user.id, String(formData.get('next') || '')));
}

export async function register(formData: FormData) {
  const email = normalizeEmail(formData.get('email'));
  const password = String(formData.get('password') || '');
  const consent = formData.get('consent') === 'on' || formData.get('consent') === 'true';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Enter a valid email address' };
  }
  const weak = passwordError(password);
  if (weak) return { error: weak };

  const parsed = validateRegisterInput({
    role: formData.get('role') as string,
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    companyName: formData.get('companyName') as string,
    consent,
  });
  if (parsed.error) return { error: parsed.error };

  const origin = await siteOrigin();
  const supabase = createClient(await cookies());
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) {
    if (error.message.toLowerCase().includes('already')) {
      return { error: 'This email address is already registered.' };
    }
    return { error: error.message };
  }
  if (!data.user) return { error: 'Registration failed' };
  if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return { error: 'This email address is already registered.' };
  }
  if (!data.session) {
    return { needsConfirmation: true as const };
  }

  const role = parsed.role as string;
  const setup = await completeAccountSetup(supabase, data.user.id, {
    email,
    role,
    firstName: String(formData.get('firstName') || ''),
    lastName: String(formData.get('lastName') || ''),
    companyName: String(formData.get('companyName') || ''),
  });
  if (setup.error) return setup;
  redirect(dashboardFor(role));
}

export async function requestPasswordReset(formData: FormData) {
  const email = normalizeEmail(formData.get('email'));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Enter a valid email address' };
  }

  const origin = await siteOrigin();
  const jar = await cookies();
  jar.set('oi_auth_next', '/reset-password', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 15,
  });

  const supabase = createClient(jar);
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback`,
  });
  if (error) return { error: error.message };
  return { sent: true as const };
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get('password') || '');
  const confirm = String(formData.get('confirm') || '');
  const weak = passwordError(password);
  if (weak) return { error: weak };
  if (password !== confirm) return { error: 'Passwords do not match' };

  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Open the reset link from your email, then choose a new password.' };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  redirect(await pathAfterSignIn(supabase, user.id, ''));
}

export async function completeProfile(formData: FormData) {
  const consent = formData.get('consent') === 'on' || formData.get('consent') === 'true';
  const parsed = validateRegisterInput({
    role: formData.get('role') as string,
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    companyName: formData.get('companyName') as string,
    consent,
  });
  if (parsed.error) return { error: parsed.error };

  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sign in before finishing your profile' };

  const role = parsed.role as string;
  const setup = await completeAccountSetup(supabase, user.id, {
    email: user.email || '',
    role,
    firstName: String(formData.get('firstName') || ''),
    lastName: String(formData.get('lastName') || ''),
    companyName: String(formData.get('companyName') || ''),
  });
  if (setup.error) return setup;
  redirect(dashboardFor(role));
}

function uniqueCompanySlug(name: string) {
  const base = slugify(name) || 'company';
  return `${base}-${Math.floor(Math.random() * 10000)}`;
}

export async function logout() {
  const supabase = createClient(await cookies());
  await supabase.auth.signOut();
  redirect('/');
}
