-- CatDex Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cats table
CREATE TABLE IF NOT EXISTS public.cats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  coat_type TEXT NOT NULL,
  breed TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'unknown')),
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

-- Sightings table
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

-- Cat analysis data (denormalized for performance)
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

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cats_owner_id ON public.cats(owner_id);
CREATE INDEX IF NOT EXISTS idx_cats_location ON public.cats USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_cats_created_at ON public.cats(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sightings_cat_id ON public.sightings(cat_id);
CREATE INDEX IF NOT EXISTS idx_sightings_user_id ON public.sightings(user_id);
CREATE INDEX IF NOT EXISTS idx_sightings_location ON public.sightings USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_sightings_created_at ON public.sightings(created_at DESC);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cats_updated_at
  BEFORE UPDATE ON public.cats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to sync location from lat/lon
CREATE OR REPLACE FUNCTION sync_cat_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

CREATE TRIGGER sync_sighting_location_trigger
  BEFORE INSERT OR UPDATE OF latitude, longitude ON public.sightings
  FOR EACH ROW
  EXECUTE FUNCTION sync_sighting_location();

-- Function to increment sighting count
CREATE OR REPLACE FUNCTION increment_cat_sighting_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.cats
  SET sighting_count = sighting_count + 1
  WHERE id = NEW.cat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_sighting_count_trigger
  AFTER INSERT ON public.sightings
  FOR EACH ROW
  EXECUTE FUNCTION increment_cat_sighting_count();

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sightings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cat_analysis ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Cats policies
CREATE POLICY "Cats are viewable by everyone"
  ON public.cats FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own cats"
  ON public.cats FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own cats"
  ON public.cats FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own cats"
  ON public.cats FOR DELETE
  USING (auth.uid() = owner_id);

-- Sightings policies
CREATE POLICY "Sightings are viewable by everyone"
  ON public.sightings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert sightings"
  ON public.sightings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sightings"
  ON public.sightings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sightings"
  ON public.sightings FOR DELETE
  USING (auth.uid() = user_id);

-- Cat analysis policies
CREATE POLICY "Cat analysis is viewable by everyone"
  ON public.cat_analysis FOR SELECT
  USING (true);

CREATE POLICY "Cat owners can insert analysis"
  ON public.cat_analysis FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cats
      WHERE cats.id = cat_analysis.cat_id
      AND cats.owner_id = auth.uid()
    )
  );

CREATE POLICY "Cat owners can update analysis"
  ON public.cat_analysis FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.cats
      WHERE cats.id = cat_analysis.cat_id
      AND cats.owner_id = auth.uid()
    )
  );

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to find nearby cats
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

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
