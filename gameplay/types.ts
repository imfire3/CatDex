import type { CatRarity } from "@/data/mock";

export type FurLength = "court" | "mi-long" | "long";
export type EstimatedAge = "chaton" | "jeune" | "adulte" | "senior";

export type CatModelId =
  | "black_short"
  | "white_short"
  | "orange_short"
  | "tabby_short"
  | "calico_long"
  | "gray_long"
  | "siamese_short"
  | "tuxedo_short";

export type SimulatedAnalysis = {
  color: string;
  breed: string;
  pattern: string;
  estimatedAge: EstimatedAge;
  furLength: FurLength;
  confidence: number;
  suggestedName: string;
  mood: string;
  traits: string[];
  modelId: CatModelId;
  rarity: CatRarity;
};

export type XpEventType =
  | "discover_cat"
  | "first_discoverer"
  | "daily_streak"
  | "new_district"
  | "mission_complete"
  | "season_challenge";

export type XpGrant = {
  type: XpEventType;
  amount: number;
  label: string;
};

export type DiscoveryResult = {
  totalXp: number;
  grants: XpGrant[];
  modelId: CatModelId;
  rarity: CatRarity;
  isFirstDiscoverer: boolean;
  isNewDistrict: boolean;
  newLevel?: number;
  leveledUp: boolean;
  unlockedBadges: string[];
  unlockedFrames: string[];
  unlockedBackgrounds: string[];
};

export type MissionPeriod = "daily" | "weekly" | "season";

export type MissionDefinition = {
  id: string;
  period: MissionPeriod;
  title: string;
  description: string;
  emoji: string;
  target: number;
  xpReward: number;
  metric: MissionMetric;
};

export type MissionMetric =
  | "discoveries"
  | "observations"
  | "photos"
  | "distance_km"
  | "new_zones"
  | "first_discoveries";

export type MissionProgress = {
  missionId: string;
  current: number;
  completed: boolean;
  claimed: boolean;
};

export type SeasonChallenge = {
  id: string;
  month: string;
  title: string;
  description: string;
  badgeId: string;
  backgroundId: string;
  target: number;
  metric: MissionMetric;
};

export type CatGameplayMeta = {
  modelId: CatModelId;
  estimatedAge: EstimatedAge;
  furLength: FurLength;
  isPopular: boolean;
  recentlyObserved: boolean;
  likeCount: number;
  commentCount: number;
  isFirstDiscoverer?: boolean;
};
