export type FriendStatus = 'pending' | 'accepted' | 'blocked';

export type NotificationType =
  | 'nearby_cat'
  | 'friend_discovery'
  | 'daily_streak'
  | 'friend_request'
  | 'badge_earned';

export type CatRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  xp: number;
  level: number;
  streak_days: number;
  last_active_date: string | null;
  is_anonymous: boolean;
  push_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface Cat {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  first_observer_id: string;
  approximate_lat: number;
  approximate_lng: number;
  location_name: string | null;
  color: string | null;
  breed: string | null;
  rarity: CatRarity;
  created_at: string;
  updated_at: string;
}

export interface CatWithPhoto extends Cat {
  primary_photo_url: string | null;
  photos?: Photo[];
  is_favorite?: boolean;
  observation_count?: number;
}

export interface NearbyCat {
  id: string;
  name: string;
  approximate_lat: number;
  approximate_lng: number;
  color: string | null;
  breed: string | null;
  rarity: CatRarity;
  primary_photo_url: string | null;
  distance_km: number;
}

export interface Photo {
  id: string;
  cat_id: string;
  user_id: string;
  storage_path: string;
  public_url: string | null;
  is_primary: boolean;
  created_at: string;
}

export interface Observation {
  id: string;
  cat_id: string;
  observer_id: string;
  approximate_lat: number;
  approximate_lng: number;
  observed_at: string;
  xp_earned: number;
  notes: string | null;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  criteria: Record<string, number>;
  xp_reward: number;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export interface Friend {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendStatus;
  created_at: string;
  updated_at: string;
  requester?: Profile;
  addressee?: Profile;
}

export interface Favorite {
  id: string;
  user_id: string;
  cat_id: string;
  created_at: string;
  cat?: CatWithPhoto;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  xp: number;
  level: number;
  cats_discovered: number;
  rank: number;
}

export interface CreateCatInput {
  name: string;
  description?: string;
  color?: string;
  breed?: string;
  rarity?: CatRarity;
  location_name?: string;
  lat: number;
  lng: number;
  photoUri: string;
}

export interface UserStats {
  totalCats: number;
  totalObservations: number;
  totalPhotos: number;
  totalFriends: number;
  badgesEarned: number;
  currentStreak: number;
  rank: number | null;
}

export interface UploadQueueItem {
  id: string;
  type: 'cat_creation' | 'photo_upload';
  payload: CreateCatInput | { catId: string; photoUri: string };
  retryCount: number;
  createdAt: string;
}

export interface ChatDexFilters {
  search: string;
  rarity: CatRarity | 'all';
  breed: string | 'all';
  favoritesOnly: boolean;
  sortBy: 'name' | 'date' | 'rarity';
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      cats: { Row: Cat; Insert: Partial<Cat>; Update: Partial<Cat> };
      photos: { Row: Photo; Insert: Partial<Photo>; Update: Partial<Photo> };
      observations: { Row: Observation; Insert: Partial<Observation>; Update: Partial<Observation> };
      badges: { Row: Badge; Insert: Partial<Badge>; Update: Partial<Badge> };
      user_badges: { Row: UserBadge; Insert: Partial<UserBadge>; Update: Partial<UserBadge> };
      friends: { Row: Friend; Insert: Partial<Friend>; Update: Partial<Friend> };
      favorites: { Row: Favorite; Insert: Partial<Favorite>; Update: Partial<Favorite> };
      notifications: { Row: Notification; Insert: Partial<Notification>; Update: Partial<Notification> };
    };
    Functions: {
      get_nearby_cats: {
        Args: { user_lat: number; user_lng: number; radius_km?: number };
        Returns: NearbyCat[];
      };
      get_leaderboard: {
        Args: { limit_count?: number };
        Returns: LeaderboardEntry[];
      };
    };
  };
}
