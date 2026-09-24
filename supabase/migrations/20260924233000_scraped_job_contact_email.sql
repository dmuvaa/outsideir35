-- Outreach email the admin keeps when publishing or rejecting a scraped role.
-- apply_email is the address found in the post, when one exists.

ALTER TABLE scraped_jobs ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);
ALTER TABLE scraped_jobs ADD COLUMN IF NOT EXISTS apply_email VARCHAR(255);
