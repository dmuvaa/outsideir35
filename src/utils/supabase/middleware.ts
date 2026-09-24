import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname;

  const redirectTo = (pathname: string) => {
    const destination = NextResponse.redirect(new URL(pathname, request.url));
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      destination.cookies.set(cookie);
    });
    return destination;
  };

  const dashboardFor = (role: string) =>
    role === 'recruiter' ? '/dashboard/recruiter' : role === 'admin' ? '/dashboard/admin' : '/dashboard/candidate';
  
  // Protect routes based on user role
  if (user) {
    let role = 'candidate';
    const { data: publicUser } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle();
    if (publicUser?.role) {
      role = publicUser.role;
    } else if (user.email) {
      const { data: byEmail } = await supabase.from('users').select('role').eq('email', user.email).maybeSingle();
      if (byEmail?.role) role = byEmail.role;
    }

    let profileReady = role === 'admin';
    if (!profileReady) {
      const table = role === 'recruiter' ? 'recruiter_profiles' : 'candidate_profiles';
      const { data: profile } = await supabase.from(table).select('user_id').eq('user_id', user.id).maybeSingle();
      profileReady = !!profile;
    }

    if (!profileReady && (path.startsWith('/dashboard') || path.startsWith('/login'))) {
      return redirectTo('/register');
    }
    if (profileReady && (path.startsWith('/login') || path.startsWith('/register') || path.startsWith('/forgot-password') || path.startsWith('/reset-password'))) {
      return redirectTo(dashboardFor(role));
    }
    
    // Role-based protection under /dashboard/
    if (path.startsWith('/dashboard/candidate') && role !== 'candidate') {
      return redirectTo(dashboardFor(role));
    }
    if (path.startsWith('/dashboard/recruiter') && role !== 'recruiter') {
      return redirectTo(dashboardFor(role));
    }
    if (path.startsWith('/dashboard/admin') && role !== 'admin') {
      return redirectTo(dashboardFor(role));
    }
    
    // Also redirect legacy root routes to their dashboard equivalents
    if (path === '/candidate') return redirectTo('/dashboard/candidate');
    if (path === '/recruiter') return redirectTo('/dashboard/recruiter');
    if (path === '/admin') return redirectTo('/dashboard/admin');
    
  } else {
    if (path.startsWith('/forgot-password') || path.startsWith('/reset-password')) {
      return redirectTo('/login');
    }
    if (path.startsWith('/register')) {
      const next = `${path}${request.nextUrl.search}`;
      return redirectTo(`/login?next=${encodeURIComponent(next)}`);
    }
    // Redirect to login if unauthenticated and trying to access a protected route
    if (
      path.startsWith('/dashboard') ||
      path === '/candidate' ||
      path === '/recruiter' ||
      path === '/admin' ||
      path === '/employer' ||
      path.startsWith('/employer/')
    ) {
      return redirectTo('/login');
    }
  }

  return supabaseResponse
}
