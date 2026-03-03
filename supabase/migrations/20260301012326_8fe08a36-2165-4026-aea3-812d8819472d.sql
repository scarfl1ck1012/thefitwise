
-- Add sodium and potassium columns to meal_logs
ALTER TABLE public.meal_logs ADD COLUMN sodium numeric DEFAULT 0;
ALTER TABLE public.meal_logs ADD COLUMN potassium numeric DEFAULT 0;

-- Create caffeine_logs table
CREATE TABLE public.caffeine_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  amount_mg integer NOT NULL DEFAULT 100,
  drink_type text NOT NULL DEFAULT 'coffee',
  logged_at date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.caffeine_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own caffeine logs" ON public.caffeine_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own caffeine logs" ON public.caffeine_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own caffeine logs" ON public.caffeine_logs
  FOR DELETE USING (auth.uid() = user_id);
