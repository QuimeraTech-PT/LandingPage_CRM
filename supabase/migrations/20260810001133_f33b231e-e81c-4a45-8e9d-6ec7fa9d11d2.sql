CREATE TABLE public.contact_submissions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    nome text NOT NULL,
    email text NOT NULL,
    assunto text NOT NULL,
    mensagem text NOT NULL
);

GRANT INSERT ON public.contact_submissions TO anon, authenticated;
GRANT SELECT ON public.contact_submissions TO service_role;

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact form" ON public.contact_submissions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Authenticated users can submit contact form" ON public.contact_submissions FOR INSERT TO authenticated WITH CHECK (true);
