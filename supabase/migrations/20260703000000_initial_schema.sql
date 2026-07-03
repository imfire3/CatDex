-- CatDex Database Schema
-- Run via Supabase CLI: supabase db push

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Custom types
CREATE TYPE friend_status AS ENUM ('pending', 'accepted', 'blocked');
CREATE TYPE notification_type AS ENUM ('nearby_cat', 'friend_discovery', 'daily_streak', 'friend_request', 'badge_earned');

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  push_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cats
CREATE TABLE cats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  first_observer_id UUID NOT NULL REFERENCES profiles(id),
  approximate_lat DOUBLE PRECISION NOT NULL,
  approximate_lng DOUBLE PRECISION NOT NULL,
  location_name TEXT,
  color TEXT,
  breed TEXT,
  rarity TEXT DEFAULT 'common',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cats_location ON cats (approximate_lat, approximate_lng);
CREATE INDEX idx_cats_owner ON cats (owner_id);

-- Photos
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cat_id UUID NOT NULL REFERENCES cats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_photos_cat ON photos (cat_id);

-- Observations
CREATE TABLE observations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cat_id UUID NOT NULL REFERENCES cats(id) ON DELETE CASCADE,
  observer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  approximate_lat DOUBLE PRECISION NOT NULL,
  approximate_lng DOUBLE PRECISION NOT NULL,
  observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  xp_earned INTEGER NOT NULL DEFAULT 10,
  notes TEXT,
  UNIQUE (cat_id, observer_id)
);

CREATE INDEX idx_observations_observer ON observations (observer_id);
CREATE INDEX idx_observations_cat ON observations (cat_id);

-- Badges
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL DEFAULT 'trophy',
  criteria JSONB NOT NULL DEFAULT '{}',
  xp_reward INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User badges
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON user_badges (user_id);

-- Friends
CREATE TABLE friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status friend_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (requester_id, addressee_id),
  CHECK (requester_id != addressee_id)
);

CREATE INDEX idx_friends_requester ON friends (requester_id);
CREATE INDEX idx_friends_addressee ON friends (addressee_id);

-- Favorites
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cat_id UUID NOT NULL REFERENCES cats(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, cat_id)
);

CREATE INDEX idx_favorites_user ON favorites (user_id);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications (user_id, read);

-- Upload queue for offline mode
CREATE TABLE upload_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  retry_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Functions

-- Round coordinates to approximate positions (~111m precision)
CREATE OR REPLACE FUNCTION approximate_location(lat DOUBLE PRECISION, lng DOUBLE PRECISION)
RETURNS TABLE(approx_lat DOUBLE PRECISION, approx_lng DOUBLE PRECISION) AS $$
BEGIN
  RETURN QUERY SELECT
    ROUND(lat::NUMERIC, 3)::DOUBLE PRECISION,
    ROUND(lng::NUMERIC, 3)::DOUBLE PRECISION;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Calculate level from XP
CREATE OR REPLACE FUNCTION calculate_level(xp_amount INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN GREATEST(1, FLOOR(SQRT(xp_amount / 100.0)) + 1)::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, username, is_anonymous)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', 'Cat Explorer'),
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || LEFT(NEW.id::TEXT, 8)),
    COALESCE((NEW.raw_app_meta_data->>'provider') = 'anonymous', FALSE)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update profile level when XP changes
CREATE OR REPLACE FUNCTION update_level_on_xp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.level := calculate_level(NEW.xp);
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_xp_update
  BEFORE UPDATE OF xp ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_level_on_xp();

-- Award XP on observation
CREATE OR REPLACE FUNCTION award_observation_xp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles SET xp = xp + NEW.xp_earned WHERE id = NEW.observer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_observation_created
  AFTER INSERT ON observations
  FOR EACH ROW EXECUTE FUNCTION award_observation_xp();

-- Nearby cats function (approximate positions only)
CREATE OR REPLACE FUNCTION get_nearby_cats(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 5.0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  approximate_lat DOUBLE PRECISION,
  approximate_lng DOUBLE PRECISION,
  color TEXT,
  breed TEXT,
  rarity TEXT,
  primary_photo_url TEXT,
  distance_km DOUBLE PRECISION
) AS $$
DECLARE
  approx RECORD;
BEGIN
  SELECT * INTO approx FROM approximate_location(user_lat, user_lng);
  
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.approximate_lat,
    c.approximate_lng,
    c.color,
    c.breed,
    c.rarity,
    p.public_url AS primary_photo_url,
    (
      6371 * acos(
        cos(radians(approx.approx_lat)) * cos(radians(c.approximate_lat)) *
        cos(radians(c.approximate_lng) - radians(approx.approx_lng)) +
        sin(radians(approx.approx_lat)) * sin(radians(c.approximate_lat))
      )
    ) AS distance_km
  FROM cats c
  LEFT JOIN photos p ON p.cat_id = c.id AND p.is_primary = TRUE
  WHERE (
    6371 * acos(
      cos(radians(approx.approx_lat)) * cos(radians(c.approximate_lat)) *
      cos(radians(c.approximate_lng) - radians(approx.approx_lng)) +
      sin(radians(approx.approx_lat)) * sin(radians(c.approximate_lat))
    )
  ) <= radius_km
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Leaderboard function
CREATE OR REPLACE FUNCTION get_leaderboard(limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
  id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  xp INTEGER,
  level INTEGER,
  cats_discovered BIGINT,
  rank BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.username,
    p.display_name,
    p.avatar_url,
    p.xp,
    p.level,
    COUNT(DISTINCT o.cat_id) AS cats_discovered,
    RANK() OVER (ORDER BY p.xp DESC) AS rank
  FROM profiles p
  LEFT JOIN observations o ON o.observer_id = p.id
  WHERE p.is_anonymous = FALSE
  GROUP BY p.id
  ORDER BY p.xp DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cats ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_queue ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Cats policies
CREATE POLICY "Cats are viewable by all" ON cats FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create cats" ON cats FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update cats" ON cats FOR UPDATE USING (auth.uid() = owner_id);

-- Photos policies
CREATE POLICY "Photos are viewable by all" ON photos FOR SELECT USING (true);
CREATE POLICY "Users can upload photos" ON photos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own photos" ON photos FOR DELETE USING (auth.uid() = user_id);

-- Observations policies
CREATE POLICY "Observations are viewable by all" ON observations FOR SELECT USING (true);
CREATE POLICY "Users can create observations" ON observations FOR INSERT WITH CHECK (auth.uid() = observer_id);

-- Badges policies
CREATE POLICY "Badges are viewable by all" ON badges FOR SELECT USING (true);

-- User badges policies
CREATE POLICY "User badges are viewable by all" ON user_badges FOR SELECT USING (true);
CREATE POLICY "System can award badges" ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Friends policies
CREATE POLICY "Users can view own friendships" ON friends FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "Users can send friend requests" ON friends FOR INSERT
  WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can update friendships they're part of" ON friends FOR UPDATE
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Favorites policies
CREATE POLICY "Users can view own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Upload queue policies
CREATE POLICY "Users can manage own upload queue" ON upload_queue FOR ALL USING (auth.uid() = user_id);

-- Storage bucket for cat photos
INSERT INTO storage.buckets (id, name, public) VALUES ('cat-photos', 'cat-photos', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Anyone can view cat photos" ON storage.objects FOR SELECT
  USING (bucket_id = 'cat-photos');
CREATE POLICY "Authenticated users can upload cat photos" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'cat-photos' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete own photos" ON storage.objects FOR DELETE
  USING (bucket_id = 'cat-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Seed badges
INSERT INTO badges (name, description, icon_name, criteria, xp_reward) VALUES
  ('First Catch', 'Discover your first cat', 'paw', '{"observations": 1}', 50),
  ('Cat Whisperer', 'Discover 10 cats', 'star', '{"observations": 10}', 100),
  ('Feline Master', 'Discover 50 cats', 'crown', '{"observations": 50}', 500),
  ('Social Cat', 'Add your first friend', 'people', '{"friends": 1}', 25),
  ('Streak Starter', 'Maintain a 3-day streak', 'flame', '{"streak": 3}', 75),
  ('Week Warrior', 'Maintain a 7-day streak', 'flame', '{"streak": 7}', 200),
  ('Photographer', 'Upload 5 cat photos', 'camera', '{"photos": 5}', 100),
  ('Explorer', 'Discover cats in 3 different areas', 'map', '{"areas": 3}', 150)
ON CONFLICT (name) DO NOTHING;
