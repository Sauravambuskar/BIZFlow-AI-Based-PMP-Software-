-- Create table
CREATE TABLE IF NOT EXISTS public.segments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rules JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.segments ENABLE ROW LEVEL SECURITY;

-- Policies: users can only access their own segments
CREATE POLICY "segments_select_policy" ON public.segments
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "segments_insert_policy" ON public.segments
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "segments_update_policy" ON public.segments
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "segments_delete_policy" ON public.segments
FOR DELETE TO authenticated USING (auth.uid() = user_id);