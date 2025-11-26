-- Create table
CREATE TABLE IF NOT EXISTS public.customer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;

-- Policies: users can only access their own notes
CREATE POLICY customer_notes_select_policy ON public.customer_notes
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY customer_notes_insert_policy ON public.customer_notes
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY customer_notes_update_policy ON public.customer_notes
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY customer_notes_delete_policy ON public.customer_notes
FOR DELETE TO authenticated
USING (auth.uid() = user_id);