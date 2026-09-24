const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

async function run() {
  const { data: companies } = await supabase.from('companies').select('*').order('created_at', { ascending: false }).limit(3);
  console.log("Recent companies:", companies);
  
  const { data: profiles } = await supabase.from('recruiter_profiles').select('*').order('updated_at', { ascending: false }).limit(3);
  console.log("Recent profiles:", profiles);
}
run();
