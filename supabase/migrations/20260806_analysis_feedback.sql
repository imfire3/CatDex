-- Labeled user corrections of Vision predictions (training signal for CatDex vision).
CREATE TABLE IF NOT EXISTS public.analysis_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  cat_id UUID REFERENCES public.cats(id) ON DELETE SET NULL,
  predicted JSONB NOT NULL DEFAULT '{}'::jsonb,
  corrections JSONB NOT NULL DEFAULT '[]'::jsonb,
  confirmed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analysis_feedback_user_id
  ON public.analysis_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_feedback_created_at
  ON public.analysis_feedback(created_at DESC);

ALTER TABLE public.analysis_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own analysis feedback" ON public.analysis_feedback;
CREATE POLICY "Users can insert own analysis feedback"
  ON public.analysis_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can read own analysis feedback" ON public.analysis_feedback;
CREATE POLICY "Users can read own analysis feedback"
  ON public.analysis_feedback FOR SELECT
  USING (auth.uid() = user_id);
