-- Email-code sign-in: no app password column, and users cannot grant themselves admin.
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
  VALUES (NEW.id, NEW.email, 'candidate')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;

CREATE OR REPLACE FUNCTION public.guard_user_role()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF current_user IN ('authenticated', 'anon') THEN
    IF TG_OP = 'INSERT' THEN
      NEW.role := 'candidate';
    ELSIF NEW.role IS DISTINCT FROM OLD.role AND NEW.role NOT IN ('candidate', 'recruiter') THEN
      RAISE EXCEPTION 'Role cannot be changed to %', NEW.role;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.guard_user_role() FROM PUBLIC;

DROP TRIGGER IF EXISTS guard_user_role ON public.users;
CREATE TRIGGER guard_user_role
  BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.guard_user_role();
