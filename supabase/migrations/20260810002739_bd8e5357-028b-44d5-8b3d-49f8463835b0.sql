-- Explicitly revoke from anon (PUBLIC includes anon and authenticated, but sometimes linter is strict)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
