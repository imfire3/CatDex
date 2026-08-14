-- Domestique = private pet (CatDex only). Sauvage = visible on explorer map.
ALTER TABLE public.cats
  ADD COLUMN IF NOT EXISTS lifestyle TEXT NOT NULL DEFAULT 'sauvage';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'cats_lifestyle_check'
  ) THEN
    ALTER TABLE public.cats
      ADD CONSTRAINT cats_lifestyle_check
      CHECK (lifestyle IN ('sauvage', 'domestique'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_cats_lifestyle ON public.cats (lifestyle);
