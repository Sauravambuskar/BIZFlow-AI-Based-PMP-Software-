-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  stage TEXT NOT NULL CHECK (stage IN ('new','qualified','proposal','won','lost')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Per-user policies
DROP POLICY IF EXISTS leads_select_policy ON public.leads;
CREATE POLICY leads_select_policy ON public.leads
FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS leads_insert_policy ON public.leads;
CREATE POLICY leads_insert_policy ON public.leads
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS leads_update_policy ON public.leads;
CREATE POLICY leads_update_policy ON public.leads
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS leads_delete_policy ON public.leads;
CREATE POLICY leads_delete_policy ON public.leads
FOR DELETE TO authenticated USING (auth.uid() = user_id);