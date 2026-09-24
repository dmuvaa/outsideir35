const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

async function run() {
  const { data: users } = await supabase.from('users').select('*').eq('email', 'dmuvaa70@gmail.com');
  console.log("User:", users);
  if (users && users.length > 0) {
    const { data: profile } = await supabase.from('recruiter_profiles').select('*').eq('user_id', users[0].id);
    console.log("Profile:", profile);
    if (profile && profile.length > 0 && profile[0].company_id) {
       const { data: company } = await supabase.from('companies').select('*').eq('id', profile[0].company_id);
       console.log("Company:", company);
    }
  }
}
run();
