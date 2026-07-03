export type CatColor = 'black' | 'white' | 'orange' | 'tabby' | 'calico' | 'gray' | 'tuxedo';
export type FurLength = 'short' | 'long' | 'medium';
export type CatBreed =
  | 'domestic_shorthair'
  | 'domestic_longhair'
  | 'siamese'
  | 'persian'
  | 'maine_coon'
  | 'bengal'
  | 'ragdoll'
  | 'british_shorthair'
  | 'unknown';

export type CatModelId =
  | 'black_short'
  | 'black_long'
  | 'white_short'
  | 'white_long'
  | 'orange_short'
  | 'orange_long'
  | 'tabby_short'
  | 'tabby_long'
  | 'calico_short'
  | 'calico_long'
  | 'gray_short'
  | 'tuxedo_short';

export interface PhotoAnalysisResult {
  color: CatColor;
  breed: CatBreed;
  estimatedAge: string;
  furLength: FurLength;
  confidence: number;
  modelId: CatModelId;
}

export interface CatModelDefinition {
  id: CatModelId;
  name: string;
  color: CatColor;
  furLength: FurLength;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  pattern: 'solid' | 'tabby' | 'calico' | 'tuxedo';
}

export type BadgeId =
  | 'explorer'
  | 'photographer'
  | 'collector'
  | 'night_explorer'
  | 'cats_100'
  | 'cats_500'
  | 'cats_1000'
  | 'first_discoverer'
  | 'seasonal_champion';

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  icon: string;
  category: 'explorer' | 'collector' | 'social' | 'seasonal';
}

export interface LevelReward {
  level: number;
  badgeId?: BadgeId;
  profileFrame?: string;
  background?: string;
}

export type MissionType = 'daily' | 'weekly' | 'seasonal';

export type MissionGoal =
  | 'discover_cats'
  | 'walk_distance'
  | 'take_photos'
  | 'new_neighborhood'
  | 'observations'
  | 'first_discoveries';

export interface Mission {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  goal: MissionGoal;
  target: number;
  xpReward: number;
  progress: number;
  completed: boolean;
}

export interface Season {
  id: string;
  name: string;
  month: number;
  year: number;
  challenge: string;
  limitedBadgeId: BadgeId;
  specialBackground: string;
  endsAt: string;
}

export interface XPEvent {
  type: 'discover_cat' | 'first_discoverer' | 'daily_streak' | 'new_district' | 'mission_complete';
  amount: number;
  label: string;
}

export interface Cat {
  id: string;
  name: string;
  color: CatColor;
  breed: CatBreed;
  estimatedAge: string;
  furLength: FurLength;
  confidence: number;
  modelId: CatModelId;
  photoUrl: string;
  latitude: number;
  longitude: number;
  district: string;
  discoveredBy: string;
  discoveredAt: string;
  lastObservedAt: string;
  observationCount: number;
  isFirstDiscoverer: boolean;
  isPopular: boolean;
  isRecentlyObserved: boolean;
  isKnown: boolean;
  likes: number;
  isFavorite: boolean;
}

export interface Observation {
  id: string;
  catId: string;
  userId: string;
  username: string;
  photoUrl: string;
  latitude: number;
  longitude: number;
  observedAt: string;
  notes?: string;
}

export interface Comment {
  id: string;
  catId: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  text: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  username: string;
  avatarUrl?: string;
  xp: number;
  level: number;
  totalDiscoveries: number;
  totalObservations: number;
  dailyStreak: number;
  badges: BadgeId[];
  profileFrame?: string;
  background?: string;
  districtsExplored: string[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl?: string;
  xp: number;
  discoveries: number;
  level: number;
}

export interface FriendDiscovery {
  id: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  catId: string;
  catName: string;
  modelId: CatModelId;
  discoveredAt: string;
}

export interface DiscoveryResult {
  cat: Cat;
  isNewDiscovery: boolean;
  isFirstDiscoverer: boolean;
  xpEvents: XPEvent[];
  newBadges: BadgeId[];
  levelUp?: { from: number; to: number; rewards: LevelReward[] };
}

export interface MapCatPin {
  id: string;
  latitude: number;
  longitude: number;
  modelId: CatModelId;
  isKnown: boolean;
  isPopular: boolean;
  isRecentlyObserved: boolean;
  name?: string;
}
