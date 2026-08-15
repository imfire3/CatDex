-- Durable GPT Vision call log for admin ops / prompt iteration.
-- No images stored — only parsed JSON + denormalized fields.
-- Access: service_role only (RLS enabled, no public policies).

CREATE TABLE IF NOT EXISTS public.vision_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ok BOOLEAN NOT NULL DEFAULT false,
  latency_ms INTEGER,
  model TEXT,
  error TEXT,
  prompt_version TEXT,
  response_json JSONB,
  normalized_json JSONB,
  suggested_name TEXT,
  breed TEXT,
  coat_color TEXT
);

CREATE INDEX IF NOT EXISTS idx_vision_runs_created_at
  ON public.vision_runs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_vision_runs_ok
  ON public.vision_runs(ok);

CREATE INDEX IF NOT EXISTS idx_vision_runs_user_id
  ON public.vision_runs(user_id);

ALTER TABLE public.vision_runs ENABLE ROW LEVEL SECURITY;

-- Intentionally no policies: anon/authenticated cannot read or write.
-- Netlify analyze-cat + admin use the secret / service_role key (bypasses RLS).

GRANT ALL ON TABLE public.vision_runs TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;
