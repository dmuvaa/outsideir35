const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

async function run() {
  const { data, error } = await supabase.auth.signInWithPassword({ email: 'dmuvaa70@gmail.com', password: '12345678' });
  const userClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { Authorization: `Bearer ${data.session.access_token}` } }
  });
  
  // Insert into public users
  const { data: uRes, error: uErr } = await userClient.from('users').insert({
    id: data.user.id,
    email: data.user.email,
    role: 'recruiter'
  }).select();
  console.log("Users insert:", uRes, uErr);
  
  // Insert into recruiter profiles
  const { data: res, error: err } = await userClient.from('recruiter_profiles').insert({
    user_id: data.user.id,
    company_id: '7805ff5f-eca3-4dea-a3fb-38a825843aa5',
    first_name: 'Dennis',
    last_name: 'Muvaa'
  }).select();
  
  console.log("Profile insert:", res, err);
}
run();
