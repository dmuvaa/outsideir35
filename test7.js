const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

async function run() {
  const { data: users } = await supabase.from('users').select('*').order('created_at', { ascending: false }).limit(5);
  console.log("Recent users:", users);
  
  const { data: profiles } = await supabase.from('recruiter_profiles').select('*').order('updated_at', { ascending: false }).limit(5);
  console.log("Recent profiles:", profiles);
}
run();
