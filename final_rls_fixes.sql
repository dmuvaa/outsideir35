-- Fix missing RLS policies for Candidates

-- 1. Applications (Candidates need to view their own applications)
DROP POLICY IF EXISTS "Candidates can view own applications" ON "public"."applications";
CREATE POLICY "Candidates can view own applications" 
ON "public"."applications" 
FOR SELECT 
USING (auth.uid() = user_id);

-- Candidates need to insert their applications
DROP POLICY IF EXISTS "Candidates can insert applications" ON "public"."applications";
CREATE POLICY "Candidates can insert applications" 
ON "public"."applications" 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Candidates need to update their own applications
DROP POLICY IF EXISTS "Candidates can update their own applications" ON "public"."applications";
CREATE POLICY "Candidates can update their own applications"
ON "public"."applications"
FOR UPDATE
USING (auth.uid() = user_id);


-- 2. Saved Jobs (Candidates need to manage their saved jobs)
DROP POLICY IF EXISTS "Candidates can view own saved_jobs" ON "public"."saved_jobs";
CREATE POLICY "Candidates can view own saved_jobs" 
ON "public"."saved_jobs" 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Candidates can insert own saved_jobs" ON "public"."saved_jobs";
CREATE POLICY "Candidates can insert own saved_jobs" 
ON "public"."saved_jobs" 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Candidates can delete own saved_jobs" ON "public"."saved_jobs";
CREATE POLICY "Candidates can delete own saved_jobs" 
ON "public"."saved_jobs" 
FOR DELETE 
USING (auth.uid() = user_id);


-- 3. Candidate Profiles (Public read, private write/update)
DROP POLICY IF EXISTS "Public can view candidate_profiles" ON candidate_profiles;
CREATE POLICY "Public can view candidate_profiles" 
ON candidate_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own candidate_profile" ON candidate_profiles;
CREATE POLICY "Users can insert own candidate_profile" 
ON candidate_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own candidate_profile" ON candidate_profiles;
CREATE POLICY "Users can update own candidate_profile" 
ON candidate_profiles FOR UPDATE USING (auth.uid() = user_id);
