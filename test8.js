const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

async function run() {
  const { data: { session }, error } = await supabase.auth.signInWithPassword({
    email: 'dmuvaa70@gmail.com',
    password: 'Password123!'
  });
  if (error) {
    console.log("Login failed:", error);
    // try the other password
    const res = await supabase.auth.signInWithPassword({ email: 'dmuvaa70@gmail.com', password: '12345678' });
    if (res.error) return console.error(res.error);
    const token = res.data.session.access_token;
    console.log("Got token");
    return;
  }
  console.log("Logged in");
}
run();
