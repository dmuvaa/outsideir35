-- Create public.users from auth.users so registration works
-- when email confirmation means there is no session yet.
-- Safe to re-run.

ALTER TABLE public.users DROP COLUMN IF EXISTS password_hash;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    'candidate'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

-- Backfill Auth users that failed the public.users insert.
INSERT INTO public.users (id, email, role)
SELECT
  id,
  email,
  'candidate'
FROM auth.users
ON CONFLICT (id) DO NOTHING;
