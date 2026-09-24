-- Add the missing foreign key constraint to recruiter_profiles
ALTER TABLE recruiter_profiles
ADD CONSTRAINT recruiter_profiles_company_id_fkey 
FOREIGN KEY (company_id) 
REFERENCES companies(id) 
ON DELETE SET NULL;
