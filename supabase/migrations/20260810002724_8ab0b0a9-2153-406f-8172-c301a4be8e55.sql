-- 1. Create Role Enum
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL,
    UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create has_role security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    from public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 4. Create contact audit logs table
CREATE TABLE IF NOT EXISTS public.contact_audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id uuid REFERENCES public.contact_submissions(id) ON DELETE SET NULL,
    email_to text NOT NULL,
    status text NOT NULL, -- 'sent', 'error', 'simulated'
    error_message text,
    created_at timestamptz DEFAULT now()
);

GRANT INSERT, SELECT ON public.contact_audit_logs TO authenticated;
GRANT ALL ON public.contact_audit_logs TO service_role;

ALTER TABLE public.contact_audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. Create policy using has_role
DO $$ BEGIN
    CREATE POLICY "Admins can view audit logs" 
    ON public.contact_audit_logs 
    FOR SELECT 
    TO authenticated 
    USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
