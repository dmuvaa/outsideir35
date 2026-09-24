-- Add published_at column to jobs table
ALTER TABLE jobs ADD COLUMN published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Backfill existing active jobs to have a published_at date of their creation date
UPDATE jobs SET published_at = created_at WHERE published_at IS NULL;

-- Ensure published_at is not null going forward
ALTER TABLE jobs ALTER COLUMN published_at SET NOT NULL;
