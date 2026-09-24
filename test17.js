const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

async function run() {
  const { data, error } = await supabase.auth.signInWithPassword({ email: 'dmuvaa70@gmail.com', password: '12345678' });
  const userClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { Authorization: `Bearer ${data.session.access_token}` } }
  });
  
  const { data: res, error: err } = await userClient.from('recruiter_profiles').insert({
    user_id: data.user.id,
    company_id: '7805ff5f-eca3-4dea-a3fb-38a825843aa5',
    first_name: 'Dennis',
    last_name: 'Muvaa'
  }).select();
  
  console.log("Insert result:", res, err);
}
run();
