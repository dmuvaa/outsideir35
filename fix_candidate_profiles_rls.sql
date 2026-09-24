-- Fix RLS policies for candidate_profiles

-- Enable RLS
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;

-- Allow public to read candidate profiles (needed for job applications and recruiter searches)
DROP POLICY IF EXISTS "Public can view candidate_profiles" ON candidate_profiles;
CREATE POLICY "Public can view candidate_profiles" 
ON candidate_profiles FOR SELECT USING (true);

-- Allow authenticated users to insert their own profile
DROP POLICY IF EXISTS "Users can insert own candidate_profile" ON candidate_profiles;
CREATE POLICY "Users can insert own candidate_profile" 
ON candidate_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own profile
DROP POLICY IF EXISTS "Users can update own candidate_profile" ON candidate_profiles;
CREATE POLICY "Users can update own candidate_profile" 
ON candidate_profiles FOR UPDATE USING (auth.uid() = user_id);
