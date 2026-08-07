-- Lot 0 — Security hardening (RLS + storage)
-- Safe to re-run.

-- 1) Profiles: own full row; public card fields via view (no email).
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE OR REPLACE VIEW public.profile_cards
WITH (security_invoker = false) AS
SELECT
  id,
  display_name,
  avatar_url,
  bio,
  created_at
FROM public.profiles;

GRANT SELECT ON public.profile_cards TO anon, authenticated;

-- 2) Storage: uploads must land under {auth.uid()}/...
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'cats'
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 3) Analysis feedback: no anonymous inserts
DROP POLICY IF EXISTS "Users can insert own analysis feedback" ON public.analysis_feedback;
CREATE POLICY "Users can insert own analysis feedback"
  ON public.analysis_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4) Cats update: prevent owner_id reassignment
DROP POLICY IF EXISTS "Users can update their own cats" ON public.cats;
CREATE POLICY "Users can update their own cats"
  ON public.cats FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);
