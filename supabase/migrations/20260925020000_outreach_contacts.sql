-- People the admin has invited to open an account and post their own roles.

CREATE TABLE IF NOT EXISTS outreach_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  company_name VARCHAR(255),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE outreach_contacts ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE outreach_contacts FROM anon, PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE outreach_contacts TO authenticated;
GRANT ALL ON TABLE outreach_contacts TO service_role;

DROP POLICY IF EXISTS "outreach_contacts_admin_all" ON outreach_contacts;
CREATE POLICY "outreach_contacts_admin_all" ON outreach_contacts
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
