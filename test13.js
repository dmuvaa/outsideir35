const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

async function run() {
  const { data, error } = await supabase.from('recruiter_profiles').select('*');
  console.log("Profiles we can select:", data?.length); // Should be 1 because of Public can view
  
  // Let's run a raw query using REST API to get policies?
  // We can't easily, but we can just use psql if we have the connection string.
}
run();
