const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
const projectId = url.hostname.split('.')[0];
const cookieName = `sb-${projectId}-auth-token`;

async function run() {
  const { data, error } = await supabase.auth.signInWithPassword({ email: 'dmuvaa70@gmail.com', password: '12345678' });
  if (error) return console.error(error);
  
  const token = encodeURIComponent(JSON.stringify([data.session.access_token, data.session.refresh_token, null, null, null]));
  
  const res = await fetch('http://localhost:3000/dashboard/recruiter/settings', {
    headers: {
      'Cookie': `${cookieName}=${token}`
    }
  });
  console.log(res.status);
}
run();
