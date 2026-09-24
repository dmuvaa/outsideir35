const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

async function run() {
  const { data, error } = await supabase.from('recruiter_profiles').select('*, companies(name, logo_url, description, website_url)').eq('user_id', '6e0c7a6f-89ee-4481-a9ef-98262328bedb').single();
  console.log(data, error);
}
run();
