-- LinkedIn scrape inbox + sourced-job columns.
-- Safe to re-run: IF NOT EXISTS / DROP POLICY IF EXISTS.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = (SELECT auth.uid())
      AND role = 'admin'
  )
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS source VARCHAR(50) NOT NULL DEFAULT 'recruiter';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS source_url VARCHAR(500);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS source_post_id VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS jobs_source_post_id_uidx
  ON jobs (source_post_id)
  WHERE source_post_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS scraped_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_post_id VARCHAR(255) NOT NULL UNIQUE,
  source_url VARCHAR(500),
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  title VARCHAR(255) NOT NULL,
  description_html TEXT NOT NULL,
  company_name VARCHAR(255),
  recruiter_name VARCHAR(255),
  location VARCHAR(255),
  remote_type VARCHAR(50) NOT NULL DEFAULT 'hybrid',
  day_rate_min NUMERIC(10, 2),
  day_rate_max NUMERIC(10, 2),
  rate_note VARCHAR(255),
  ir35_status VARCHAR(50) NOT NULL DEFAULT 'outside',
  clearance_level VARCHAR(50) NOT NULL DEFAULT 'none',
  contract_length VARCHAR(100),
  apply_url VARCHAR(500),
  posted_at TIMESTAMP WITH TIME ZONE,
  classification VARCHAR(50) NOT NULL DEFAULT 'needs_review',
  classification_reason TEXT,
  confidence INT NOT NULL DEFAULT 50,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  published_job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS scraped_jobs_status_created_idx
  ON scraped_jobs (status, created_at DESC);

CREATE INDEX IF NOT EXISTS scraped_jobs_classification_idx
  ON scraped_jobs (classification);

ALTER TABLE scraped_jobs ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE scraped_jobs FROM anon, PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE scraped_jobs TO authenticated;
GRANT ALL ON TABLE scraped_jobs TO service_role;

DROP POLICY IF EXISTS "scraped_jobs_admin_all" ON scraped_jobs;
CREATE POLICY "scraped_jobs_admin_all" ON scraped_jobs
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
