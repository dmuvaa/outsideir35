-- Undo Seed Data & Auth Cleanup Script
-- Run this script in the Supabase Dashboard SQL Editor

-- ==========================================
-- 1. CLEAN UP AUTH SCHEMA
-- ==========================================

-- Drop the redundant password_hash column that was filled with dummy data
ALTER TABLE users DROP COLUMN IF EXISTS password_hash;


-- ==========================================
-- 2. RE-ENABLE ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Re-enabling RLS on all tables that had it disabled in the seed script
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_socials ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for the public users table
-- Allow anyone to read public users (needed for profiles)
DROP POLICY IF EXISTS "Public users are viewable by everyone" ON users;
CREATE POLICY "Public users are viewable by everyone" 
ON users FOR SELECT USING (true);

-- Allow users to update their own record
DROP POLICY IF EXISTS "Users can update their own record" ON users;
CREATE POLICY "Users can update their own record" 
ON users FOR UPDATE USING (auth.uid() = id);


-- ==========================================
-- 3. DELETE DUMMY SEED DATA
-- ==========================================
-- Note: Deleting from auth.users should cascade to public.users and profiles if foreign keys are set up correctly.
-- If not, we explicitly delete them here.

-- 3A. Delete explicit mapping tables first to avoid FK constraint violations
DELETE FROM saved_jobs WHERE user_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333');
DELETE FROM consent_records WHERE user_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333');
DELETE FROM candidate_profiles WHERE user_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333');
DELETE FROM recruiter_profiles WHERE user_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333');
DELETE FROM applications WHERE user_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333');

-- 3B. Delete from Job Skills (Before Jobs are deleted)
DELETE FROM job_skills WHERE job_id::text LIKE '11111111-1111-1111-1111-1111111111%';

-- 3C. Delete Jobs
DELETE FROM jobs WHERE id::text LIKE '11111111-1111-1111-1111-1111111111%';

-- 3D. Delete Companies
DELETE FROM companies WHERE id::text IN (
  'c1000000-0000-0000-0000-000000000001',
  'c2000000-0000-0000-0000-000000000002',
  'c3000000-0000-0000-0000-000000000003',
  'c4000000-0000-0000-0000-000000000004',
  'c5000000-0000-0000-0000-000000000005',
  'c6000000-0000-0000-0000-000000000006'
);

-- 3E. Delete Guides and Blog Posts
DELETE FROM guides WHERE id::text LIKE '99999999-9999-9999-9999-9999999999%';
DELETE FROM blog_posts WHERE id::text LIKE '88888888-8888-8888-8888-8888888888%';

-- 3F. Delete Skills
DELETE FROM skills WHERE id::text LIKE '91000000-0000-0000-0000-0000000000%';

-- 3G. Delete Dummy Users from auth.users and public.users
DELETE FROM users WHERE id::text IN (
  '11111111-1111-1111-1111-111111111111', 
  '22222222-2222-2222-2222-222222222222', 
  '33333333-3333-3333-3333-333333333333'
);

DELETE FROM auth.users WHERE id::text IN (
  '11111111-1111-1111-1111-111111111111', 
  '22222222-2222-2222-2222-222222222222', 
  '33333333-3333-3333-3333-333333333333'
);
