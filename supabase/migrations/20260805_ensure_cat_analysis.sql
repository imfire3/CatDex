-- Fix PGRST200: "Could not find a relationship between 'cats' and 'cat_analysis'"
-- Safe to re-run in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.cat_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cat_id UUID NOT NULL UNIQUE,
  color TEXT NOT NULL,
  breed TEXT NOT NULL,
  coat TEXT NOT NULL,
  description TEXT NOT NULL,
  suggested_name TEXT,
  gender TEXT,
  eyes TEXT,
  size TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure columns exist on older/partial tables
ALTER TABLE public.cat_analysis ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE public.cat_analysis ADD COLUMN IF NOT EXISTS breed TEXT;
ALTER TABLE public.cat_analysis ADD COLUMN IF NOT EXISTS coat TEXT;
ALTER TABLE public.cat_analysis ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.cat_analysis ADD COLUMN IF NOT EXISTS suggested_name TEXT;
ALTER TABLE public.cat_analysis ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.cat_analysis ADD COLUMN IF NOT EXISTS eyes TEXT;
ALTER TABLE public.cat_analysis ADD COLUMN IF NOT EXISTS size TEXT;
ALTER TABLE public.cat_analysis ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE public.cat_analysis ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Backfill NOT NULL defaults if an empty legacy table exists
UPDATE public.cat_analysis SET color = COALESCE(color, 'Inconnue') WHERE color IS NULL;
UPDATE public.cat_analysis SET breed = COALESCE(breed, 'Indéterminée') WHERE breed IS NULL;
UPDATE public.cat_analysis SET coat = COALESCE(coat, 'Indéterminée') WHERE coat IS NULL;
UPDATE public.cat_analysis SET description = COALESCE(description, '') WHERE description IS NULL;

DO $$
BEGIN
  ALTER TABLE public.cat_analysis
    ALTER COLUMN color SET NOT NULL,
    ALTER COLUMN breed SET NOT NULL,
    ALTER COLUMN coat SET NOT NULL,
    ALTER COLUMN description SET NOT NULL;
EXCEPTION
  WHEN undefined_column THEN NULL;
  WHEN others THEN NULL;
END $$;

-- Unique cat_id (one analysis per cat)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.cat_analysis'::regclass
      AND contype = 'u'
      AND pg_get_constraintdef(oid) ILIKE '%(cat_id)%'
  ) THEN
    ALTER TABLE public.cat_analysis ADD CONSTRAINT cat_analysis_cat_id_key UNIQUE (cat_id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN unique_violation THEN NULL;
END $$;

-- Foreign key cats ← cat_analysis (required for PostgREST embeds)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.cat_analysis'::regclass
      AND contype = 'f'
      AND confrelid = 'public.cats'::regclass
  ) THEN
    ALTER TABLE public.cat_analysis
      ADD CONSTRAINT cat_analysis_cat_id_fkey
      FOREIGN KEY (cat_id) REFERENCES public.cats(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_cat_analysis_cat_id ON public.cat_analysis(cat_id);

ALTER TABLE public.cat_analysis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cat analysis is viewable by everyone" ON public.cat_analysis;
CREATE POLICY "Cat analysis is viewable by everyone"
  ON public.cat_analysis FOR SELECT USING (true);

DROP POLICY IF EXISTS "Cat owners can insert analysis" ON public.cat_analysis;
CREATE POLICY "Cat owners can insert analysis"
  ON public.cat_analysis FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cats
      WHERE cats.id = cat_analysis.cat_id
      AND cats.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Cat owners can update analysis" ON public.cat_analysis;
CREATE POLICY "Cat owners can update analysis"
  ON public.cat_analysis FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.cats
      WHERE cats.id = cat_analysis.cat_id
      AND cats.owner_id = auth.uid()
    )
  );

-- Reload PostgREST schema cache so embeds work immediately
NOTIFY pgrst, 'reload schema';
