const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

async function run() {
  const { data, error } = await supabase.from('recruiter_profiles').upsert({
    user_id: '6e0c7a6f-89ee-4481-a9ef-98262328bedb',
    company_id: '7805ff5f-eca3-4dea-a3fb-38a825843aa5',
  });
  console.log("Error:", error);
}
run();
