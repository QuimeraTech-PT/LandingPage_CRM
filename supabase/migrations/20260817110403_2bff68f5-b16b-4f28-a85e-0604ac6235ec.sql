ALTER TABLE public.crm_finances ADD COLUMN IF NOT EXISTS due_date date;
ALTER TABLE public.crm_finances ADD COLUMN IF NOT EXISTS invoice_url text;
ALTER TABLE public.crm_finances ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
