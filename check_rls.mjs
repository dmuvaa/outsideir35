import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

async function check() {
  const { data, error } = await supabase.rpc('get_table_info', { table_name: 'categories' });
  console.log("Categories RPC:", data, error);
}

check();
