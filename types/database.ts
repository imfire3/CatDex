export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  avatar_emoji: string | null;
  onboarding_completed: boolean;
  xp: number;
  level: number;
  streak: number;
  last_active_date: string | null;
  total_captures: number;
  zones_explored: number;
  created_at: string;
};

export type Zone = {
  id: string;
  name: string;
  city: string;
  center_lat: number;
  center_lng: number;
  radius_meters: number;
};

export type Cat = {
  id: string;
  name: string;
  zone_id: string;
  color: string | null;
  breed: string | null;
  pattern: string | null;
  photo_url: string;
  created_by: string;
  dedup_key: string;
  lat_approx: number;
  lng_approx: number;
  model_id: string;
  estimated_age: string | null;
  fur_length: string | null;
  rarity: string;
  sighting_count: number;
  last_observed_at: string;
  created_at: string;
  zone?: Zone;
  creator?: Pick<Profile, "username" | "display_name">;
};

export type Capture = {
  id: string;
  user_id: string;
  cat_id: string;
  photo_url: string | null;
  captured_at: string;
  cat?: Cat;
};

export type Badge = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  criteria: Record<string, unknown>;
};

export type UserBadge = {
  user_id: string;
  badge_id: string;
  progress: number;
  unlocked_at: string | null;
  badge?: Badge;
};

export type CatPhoto = {
  id: string;
  cat_id: string;
  user_id: string;
  photo_url: string;
  created_at: string;
};

export type Observation = {
  id: string;
  cat_id: string;
  user_id: string;
  note: string;
  weather: string | null;
  observed_at: string;
};

export type CatFavorite = {
  user_id: string;
  cat_id: string;
  created_at: string;
};

export type FriendStatus = "pending" | "accepted" | "declined";

export type Friendship = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendStatus;
  created_at: string;
  requester?: Profile;
  addressee?: Profile;
};

export type NotificationType =
  | "nearby_cat"
  | "friend_discovery"
  | "daily_streak"
  | "friend_request";

export type AppNotification = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  payload: Record<string, unknown>;
  read: boolean;
  created_at: string;
};

export type CatAnalysis = {
  color: string;
  breed: string;
  pattern: string;
  confidence: number;
  suggestedName: string;
  mood?: string;
  traits?: string[];
  modelId?: string;
  estimatedAge?: string;
  furLength?: string;
  rarity?: string;
};

export type CreateCatInput = {
  name: string;
  zoneId: string;
  color: string;
  breed: string;
  pattern: string;
  photoUri: string;
  lat: number;
  lng: number;
  note?: string;
  weather?: string;
  modelId?: string;
  estimatedAge?: string;
  furLength?: string;
  rarity?: string;
};

export type UploadQueueItem = {
  id: string;
  type: "create_cat" | "add_capture" | "add_photo";
  payload: Record<string, unknown>;
  createdAt: string;
  retries: number;
};

type TableDef<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<Profile>;
      zones: TableDef<Zone>;
      cats: TableDef<Cat>;
      captures: TableDef<Capture>;
      badges: TableDef<Badge>;
      user_badges: TableDef<UserBadge>;
      cat_photos: TableDef<CatPhoto>;
      observations: TableDef<Observation>;
      cat_favorites: TableDef<CatFavorite>;
      friendships: TableDef<Friendship>;
      notifications: TableDef<AppNotification>;
    };
    Views: Record<string, never>;
    Functions: {
      create_cat_with_capture: {
        Args: {
          p_name: string;
          p_zone_id: string;
          p_color: string;
          p_breed: string;
          p_pattern: string;
          p_photo_url: string;
          p_dedup_key: string;
          p_lat_approx: number;
          p_lng_approx: number;
          p_model_id?: string;
          p_estimated_age?: string;
          p_fur_length?: string;
          p_rarity?: string;
        };
        Returns: Cat;
      };
      award_xp: {
        Args: { p_user_id: string; p_amount: number };
        Returns: Profile;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
