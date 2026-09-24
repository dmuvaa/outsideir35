-- Fix all RLS policies for the core MVP tables

-- 1. COMPANIES
CREATE POLICY "Public can view companies" ON companies FOR SELECT USING (true);
CREATE POLICY "Auth can insert companies" ON companies FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth can update companies" ON companies FOR UPDATE USING (auth.role() = 'authenticated');

-- 2. RECRUITER PROFILES
CREATE POLICY "Public can view recruiter_profiles" ON recruiter_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own recruiter_profile" ON recruiter_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recruiter_profile" ON recruiter_profiles FOR UPDATE USING (auth.uid() = user_id);

-- 3. JOBS
CREATE POLICY "Public can view jobs" ON jobs FOR SELECT USING (true);
CREATE POLICY "Recruiters can insert jobs" ON jobs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Recruiters can update own jobs" ON jobs FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = recruiter_id);
CREATE POLICY "Recruiters can delete own jobs" ON jobs FOR DELETE USING (auth.role() = 'authenticated' AND auth.uid() = recruiter_id);

-- 4. JOB TAGS & CATEGORIES (Join tables)
CREATE POLICY "Public can view job_categories" ON job_categories FOR SELECT USING (true);
CREATE POLICY "Auth can insert job_categories" ON job_categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth can update job_categories" ON job_categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth can delete job_categories" ON job_categories FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view job_skills" ON job_skills FOR SELECT USING (true);
CREATE POLICY "Auth can insert job_skills" ON job_skills FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth can update job_skills" ON job_skills FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth can delete job_skills" ON job_skills FOR DELETE USING (auth.role() = 'authenticated');
