import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

async function check() {
  const { data, error } = await supabase.storage.listBuckets();
  console.log("Buckets:", data?.map(b => b.name));
  if (error) console.log("Error:", error);
}

check();
