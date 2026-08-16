
-- Create activity log table
CREATE TABLE public.crm_activity_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now() NOT NULL,
    user_id uuid REFERENCES auth.users(id),
    action text NOT NULL,
    entity_type text NOT NULL, -- 'lead', 'project', 'finance', 'drive'
    entity_id uuid,
    details jsonb DEFAULT '{}'::jsonb,
    status text DEFAULT 'success' -- 'success', 'failure', 'warning'
);

-- Grant permissions
GRANT SELECT, INSERT ON public.crm_activity_logs TO authenticated;
GRANT ALL ON public.crm_activity_logs TO service_role;

-- Enable RLS
ALTER TABLE public.crm_activity_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view all logs"
ON public.crm_activity_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System and admins can insert logs"
ON public.crm_activity_logs
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));
