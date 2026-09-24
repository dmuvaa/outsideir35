import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

async function check() {
  const { data, error } = await supabase.from('categories').select('*').limit(5);
  console.log("Categories:", data);
  console.log("Error:", error);
}

check();
