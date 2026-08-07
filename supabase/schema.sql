-- CatDex Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor (Dashboard → SQL → New query → Run)
-- Safe to re-run: uses IF NOT EXISTS / DROP POLICY IF EXISTS

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cats
CREATE TABLE IF NOT EXISTS public.cats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  coat_type TEXT NOT NULL,
  breed TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'unknown')),
  dex_number INTEGER,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  address TEXT,
  photo_url TEXT,
  sighting_count INTEGER NOT NULL DEFAULT 1,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Backfill columns if an older schema already exists
ALTER TABLE public.cats ADD COLUMN IF NOT EXISTS breed TEXT;
ALTER TABLE public.cats ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.cats ADD COLUMN IF NOT EXISTS dex_number INTEGER;
ALTER TABLE public.cats ADD COLUMN IF NOT EXISTS views INTEGER NOT NULL DEFAULT 0;

-- Sightings
CREATE TABLE IF NOT EXISTS public.sightings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cat_id UUID REFERENCES public.cats(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Analysis payload
CREATE TABLE IF NOT EXISTS public.cat_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cat_id UUID REFERENCES public.cats(id) ON DELETE CASCADE NOT NULL UNIQUE,
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

CREATE INDEX IF NOT EXISTS idx_cats_owner_id ON public.cats(owner_id);
CREATE INDEX IF NOT EXISTS idx_cats_location ON public.cats USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_cats_created_at ON public.cats(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cats_dex_number ON public.cats(owner_id, dex_number);
CREATE INDEX IF NOT EXISTS idx_sightings_cat_id ON public.sightings(cat_id);
CREATE INDEX IF NOT EXISTS idx_sightings_user_id ON public.sightings(user_id);
CREATE INDEX IF NOT EXISTS idx_sightings_location ON public.sightings USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_sightings_created_at ON public.sightings(created_at DESC);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cats_updated_at ON public.cats;
CREATE TRIGGER update_cats_updated_at
  BEFORE UPDATE ON public.cats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION sync_cat_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_cat_location_trigger ON public.cats;
CREATE TRIGGER sync_cat_location_trigger
  BEFORE INSERT OR UPDATE OF latitude, longitude ON public.cats
  FOR EACH ROW
  EXECUTE FUNCTION sync_cat_location();

CREATE OR REPLACE FUNCTION sync_sighting_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_sighting_location_trigger ON public.sightings;
CREATE TRIGGER sync_sighting_location_trigger
  BEFORE INSERT OR UPDATE OF latitude, longitude ON public.sightings
  FOR EACH ROW
  EXECUTE FUNCTION sync_sighting_location();

CREATE OR REPLACE FUNCTION increment_cat_sighting_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.cats
  SET sighting_count = sighting_count + 1
  WHERE id = NEW.cat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS increment_sighting_count_trigger ON public.sightings;
CREATE TRIGGER increment_sighting_count_trigger
  AFTER INSERT ON public.sightings
  FOR EACH ROW
  EXECUTE FUNCTION increment_cat_sighting_count();

-- Increment views helper used by the app
CREATE OR REPLACE FUNCTION public.increment_cat_views(row_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.cats
  SET views = COALESCE(views, 0) + 1
  WHERE id = row_id;
END;
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sightings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cat_analysis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Public-safe profile fields (no email). Bypass own-only RLS for cards only.
CREATE OR REPLACE VIEW public.profile_cards
WITH (security_invoker = false) AS
SELECT id, display_name, avatar_url, bio, created_at
FROM public.profiles;

GRANT SELECT ON public.profile_cards TO anon, authenticated;

DROP POLICY IF EXISTS "Cats are viewable by everyone" ON public.cats;
CREATE POLICY "Cats are viewable by everyone"
  ON public.cats FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own cats" ON public.cats;
CREATE POLICY "Users can insert their own cats"
  ON public.cats FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update their own cats" ON public.cats;
CREATE POLICY "Users can update their own cats"
  ON public.cats FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete their own cats" ON public.cats;
CREATE POLICY "Users can delete their own cats"
  ON public.cats FOR DELETE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Sightings are viewable by everyone" ON public.sightings;
CREATE POLICY "Sightings are viewable by everyone"
  ON public.sightings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert sightings" ON public.sightings;
CREATE POLICY "Authenticated users can insert sightings"
  ON public.sightings FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own sightings" ON public.sightings;
CREATE POLICY "Users can update their own sightings"
  ON public.sightings FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own sightings" ON public.sightings;
CREATE POLICY "Users can delete their own sightings"
  ON public.sightings FOR DELETE USING (auth.uid() = user_id);

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

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name),
        avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Instant login: confirm e-mail at insert time (pairs with disabling
-- "Confirm email" in the dashboard to avoid mailer rate limits).
CREATE OR REPLACE FUNCTION public.handle_auto_confirm()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.email_confirmed_at := COALESCE(NEW.email_confirmed_at, NOW());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_confirm ON auth.users;
CREATE TRIGGER on_auth_user_created_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auto_confirm();

CREATE OR REPLACE FUNCTION find_nearby_cats(
  user_lat DOUBLE PRECISION,
  user_lon DOUBLE PRECISION,
  radius_meters DOUBLE PRECISION DEFAULT 5000
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  distance_meters DOUBLE PRECISION,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  photo_url TEXT,
  sighting_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    ST_Distance(
      c.location,
      ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography
    ) AS distance_meters,
    c.latitude,
    c.longitude,
    c.photo_url,
    c.sighting_count
  FROM public.cats c
  WHERE ST_DWithin(
    c.location,
    ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography,
    radius_meters
  )
  ORDER BY distance_meters;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Storage bucket for cat photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('cats', 'cats', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public read access" ON storage.objects;
CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cats');

DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'cats'
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can update own photos" ON storage.objects;
CREATE POLICY "Users can update own photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'cats' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete own photos" ON storage.objects;
CREATE POLICY "Users can delete own photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'cats' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Labeled Vision corrections (training signal)
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
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own analysis feedback" ON public.analysis_feedback;
CREATE POLICY "Users can read own analysis feedback"
  ON public.analysis_feedback FOR SELECT
  USING (auth.uid() = user_id);

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
