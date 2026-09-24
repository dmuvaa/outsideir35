-- IR35 evidence fields, live-job columns, and tighter RLS.
-- Safe to re-run: uses IF NOT EXISTS / DROP POLICY IF EXISTS.

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS engagement_model VARCHAR(50) DEFAULT 'psc';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS fee_payer VARCHAR(255);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS end_client VARCHAR(255);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS determination_date DATE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS sds_available BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS contract_length VARCHAR(100);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS ir35_attested_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS github_url VARCHAR(255);
ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS skills TEXT;

UPDATE applications SET status = 'applied' WHERE status = 'pending';
UPDATE jobs SET status = 'active' WHERE status IN ('open', 'published');

ALTER TABLE users DROP COLUMN IF EXISTS password_hash;

-- Recruiter helper: company membership
CREATE OR REPLACE FUNCTION public.recruiter_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT company_id FROM recruiter_profiles WHERE user_id = (SELECT auth.uid()) LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = (SELECT auth.uid())
      AND role = 'admin'
  )
$$;

-- Enable RLS on core tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_self" ON users;
CREATE POLICY "users_select_self" ON users FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()) OR public.is_admin());

DROP POLICY IF EXISTS "users_update_self" ON users;
CREATE POLICY "users_update_self" ON users FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "users_insert_self" ON users;
CREATE POLICY "users_insert_self" ON users FOR INSERT TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "candidate_profiles_public_read" ON candidate_profiles;
DROP POLICY IF EXISTS "Public can view candidate_profiles" ON candidate_profiles;
CREATE POLICY "candidate_profiles_select" ON candidate_profiles FOR SELECT TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR public.is_admin()
    OR (
      is_profile_public = true
      AND EXISTS (SELECT 1 FROM users WHERE id = (SELECT auth.uid()) AND role IN ('recruiter', 'admin'))
    )
  );

DROP POLICY IF EXISTS "candidate_profiles_write_self" ON candidate_profiles;
CREATE POLICY "candidate_profiles_write_self" ON candidate_profiles FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "companies_public_read" ON companies;
CREATE POLICY "companies_public_read" ON companies FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "companies_write_owner" ON companies;
DROP POLICY IF EXISTS "companies_insert" ON companies;
CREATE POLICY "companies_insert" ON companies FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "companies_update_owner" ON companies;
CREATE POLICY "companies_update_owner" ON companies FOR UPDATE TO authenticated
  USING (id = public.recruiter_company_id() OR public.is_admin())
  WITH CHECK (id = public.recruiter_company_id() OR public.is_admin());

DROP POLICY IF EXISTS "companies_delete_owner" ON companies;
CREATE POLICY "companies_delete_owner" ON companies FOR DELETE TO authenticated
  USING (id = public.recruiter_company_id() OR public.is_admin());

DROP POLICY IF EXISTS "recruiter_profiles_self" ON recruiter_profiles;
CREATE POLICY "recruiter_profiles_self" ON recruiter_profiles FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.is_admin())
  WITH CHECK (user_id = (SELECT auth.uid()) OR public.is_admin());

DROP POLICY IF EXISTS "jobs_public_read" ON jobs;
CREATE POLICY "jobs_public_read" ON jobs FOR SELECT TO anon, authenticated
  USING (status = 'active' OR recruiter_id = (SELECT auth.uid()) OR company_id = public.recruiter_company_id() OR public.is_admin());

DROP POLICY IF EXISTS "jobs_write_owner" ON jobs;
CREATE POLICY "jobs_write_owner" ON jobs FOR ALL TO authenticated
  USING (company_id = public.recruiter_company_id() OR public.is_admin())
  WITH CHECK (company_id = public.recruiter_company_id() OR public.is_admin());

DROP POLICY IF EXISTS "job_skills_read" ON job_skills;
CREATE POLICY "job_skills_read" ON job_skills FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "job_skills_write" ON job_skills;
CREATE POLICY "job_skills_write" ON job_skills FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_id AND (jobs.company_id = public.recruiter_company_id() OR public.is_admin())))
  WITH CHECK (EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_id AND (jobs.company_id = public.recruiter_company_id() OR public.is_admin())));

DROP POLICY IF EXISTS "job_categories_read" ON job_categories;
CREATE POLICY "job_categories_read" ON job_categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "job_categories_write" ON job_categories;
CREATE POLICY "job_categories_write" ON job_categories FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_id AND (jobs.company_id = public.recruiter_company_id() OR public.is_admin())))
  WITH CHECK (EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_id AND (jobs.company_id = public.recruiter_company_id() OR public.is_admin())));

DROP POLICY IF EXISTS "applications_select" ON applications;
CREATE POLICY "applications_select" ON applications FOR SELECT TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_id AND jobs.company_id = public.recruiter_company_id())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "applications_insert" ON applications;
CREATE POLICY "applications_insert" ON applications FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "applications_update" ON applications;
CREATE POLICY "applications_update" ON applications FOR UPDATE TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_id AND jobs.company_id = public.recruiter_company_id())
    OR public.is_admin()
  )
  WITH CHECK (
    user_id = (SELECT auth.uid())
    OR EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_id AND jobs.company_id = public.recruiter_company_id())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "saved_jobs_own" ON saved_jobs;
CREATE POLICY "saved_jobs_own" ON saved_jobs FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "saved_searches_own" ON saved_searches;
CREATE POLICY "saved_searches_own" ON saved_searches FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "alerts_own" ON alerts;
CREATE POLICY "alerts_own" ON alerts FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "consent_own" ON consent_records;
CREATE POLICY "consent_own" ON consent_records FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "taxonomy_read" ON categories;
CREATE POLICY "taxonomy_read" ON categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "skills_read" ON skills;
CREATE POLICY "skills_read" ON skills FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "blog_public" ON blog_posts;
CREATE POLICY "blog_public" ON blog_posts FOR SELECT TO anon, authenticated
  USING (status = 'published' OR public.is_admin());

DROP POLICY IF EXISTS "guides_public" ON guides;
CREATE POLICY "guides_public" ON guides FOR SELECT TO anon, authenticated USING (true);
