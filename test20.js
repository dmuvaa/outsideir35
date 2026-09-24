const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

async function run() {
  const { data } = await supabase.from('users').select('*').eq('email', 'dmuvaa70@gmail.com');
  console.log(data);
}
run();
