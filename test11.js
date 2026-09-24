const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

async function run() {
  const { data: { user } } = await supabase.auth.signInWithPassword({ email: 'dmuvaa70@gmail.com', password: '12345678' });
  
  // Directly test the exact same update logic with the service role to bypass RLS and see what happens!
  const adminSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  const { data: profile } = await adminSupabase.from('recruiter_profiles').select('company_id').eq('user_id', user.id).single();
  console.log("Profile company_id:", profile?.company_id);
  
  const { data: comp } = await adminSupabase.from('companies').select('*').eq('id', profile?.company_id).single();
  console.log("Company:", comp?.name);
}
run();
