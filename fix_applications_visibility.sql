-- 1. Remove duplicate applications before adding unique constraint
DELETE FROM "public"."applications"
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY job_id, user_id ORDER BY created_at DESC) as rn
    FROM "public"."applications"
  ) t WHERE rn > 1
);

-- 2. Add Unique constraint
ALTER TABLE "public"."applications" ADD CONSTRAINT "unique_job_user_application" UNIQUE ("job_id", "user_id");

-- 3. Fix SELECT policy for recruiters to see applications
-- Recruiters should see applications for jobs posted by their company
CREATE POLICY "Recruiters can view applications for their jobs"
ON "public"."applications"
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM jobs
    JOIN recruiter_profiles ON recruiter_profiles.company_id = jobs.company_id
    WHERE jobs.id = applications.job_id
    AND recruiter_profiles.user_id = auth.uid()
  )
);
