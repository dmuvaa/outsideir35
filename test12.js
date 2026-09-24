const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

async function run() {
  const { data, error } = await supabase.auth.signInWithPassword({ email: 'dmuvaa70@gmail.com', password: '12345678' });
  const userClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { Authorization: `Bearer ${data.session.access_token}` } }
  });
  
  const { data: res, error: err } = await userClient.from('recruiter_profiles').update({ company_id: 'a1863c62-8c1f-4238-bb8e-be1421262a09' }).eq('user_id', data.user.id).select();
  console.log("Update profile:", res, err);
}
run();
