const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

async function run() {
  const { data, error } = await supabase.auth.signInWithPassword({ email: 'dmuvaa70@gmail.com', password: '12345678' });
  const userClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { Authorization: `Bearer ${data.session.access_token}` } }
  });
  
  console.log("Logged in user.id:", data.user.id);
  
  const { data: allProfiles } = await userClient.from('recruiter_profiles').select('*');
  console.log("All profiles visible to user:", allProfiles);
}
run();
