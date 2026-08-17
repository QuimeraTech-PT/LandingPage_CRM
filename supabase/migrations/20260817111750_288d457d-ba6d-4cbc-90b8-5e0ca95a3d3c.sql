ALTER TABLE public.crm_projects ADD COLUMN IF NOT EXISTS budget decimal(12, 2) DEFAULT 0;
ALTER TABLE public.crm_projects ADD COLUMN IF NOT EXISTS budget_alert_threshold decimal(5, 2) DEFAULT 80.0;
