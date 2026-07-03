import { Badge, LevelReward, XPEvent } from './types';

export const XP_REWARDS: Record<XPEvent['type'], number> = {
  discover_cat: 100,
  first_discoverer: 500,
  daily_streak: 200,
  new_district: 300,
  mission_complete: 150,
};

export const LEVEL_THRESHOLDS: number[] = [
  0, 200, 500, 1000, 1800, 3000, 4500, 6500, 9000, 12000,
  15500, 19500, 24000, 29000, 35000, 42000, 50000, 60000, 72000, 86000,
];

export const LEVEL_REWARDS: LevelReward[] = [
  { level: 1, profileFrame: 'bronze' },
  { level: 3, badgeId: 'explorer' },
  { level: 5, profileFrame: 'silver', background: 'sunset' },
  { level: 7, badgeId: 'photographer' },
  { level: 10, profileFrame: 'gold', background: 'night_city' },
  { level: 12, badgeId: 'collector' },
  { level: 15, profileFrame: 'platinum', background: 'forest' },
  { level: 18, badgeId: 'night_explorer' },
  { level: 20, profileFrame: 'diamond', background: 'aurora' },
];

export const BADGES: Badge[] = [
  { id: 'explorer', name: 'Explorer', description: 'Reach level 3', icon: '🧭', category: 'explorer' },
  { id: 'photographer', name: 'Photographer', description: 'Take 50 cat photos', icon: '📸', category: 'explorer' },
  { id: 'collector', name: 'Collector', description: 'Reach level 12', icon: '🏆', category: 'collector' },
  { id: 'night_explorer', name: 'Night Explorer', description: 'Discover a cat after midnight', icon: '🌙', category: 'explorer' },
  { id: 'cats_100', name: '100 Cats', description: 'Discover 100 unique cats', icon: '🐱', category: 'collector' },
  { id: 'cats_500', name: '500 Cats', description: 'Discover 500 unique cats', icon: '🐈', category: 'collector' },
  { id: 'cats_1000', name: '1000 Cats', description: 'Discover 1000 unique cats', icon: '👑', category: 'collector' },
  { id: 'first_discoverer', name: 'First Discoverer', description: 'Be first to discover 10 cats', icon: '⭐', category: 'explorer' },
  { id: 'seasonal_champion', name: 'Seasonal Champion', description: 'Complete a monthly challenge', icon: '🎖️', category: 'seasonal' },
];

export const PROFILE_FRAMES = ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as const;
export const BACKGROUNDS = ['default', 'sunset', 'night_city', 'forest', 'aurora', 'seasonal_spring', 'seasonal_summer'] as const;

export const DAILY_MISSIONS_TEMPLATE = [
  { goal: 'discover_cats' as const, target: 3, title: 'Discover 3 Cats', description: 'Find 3 new cats today', xpReward: 150 },
  { goal: 'walk_distance' as const, target: 2, title: 'Walk 2 km', description: 'Explore your neighborhood on foot', xpReward: 100 },
  { goal: 'take_photos' as const, target: 5, title: 'Take 5 Photos', description: 'Photograph cats in the wild', xpReward: 120 },
  { goal: 'new_neighborhood' as const, target: 1, title: 'New Neighborhood', description: 'Find a cat in a new area', xpReward: 200 },
];

export const WEEKLY_MISSIONS_TEMPLATE = [
  { goal: 'discover_cats' as const, target: 10, title: '10 Discoveries', description: 'Discover 10 cats this week', xpReward: 400 },
  { goal: 'observations' as const, target: 25, title: '25 Observations', description: 'Observe cats 25 times', xpReward: 350 },
  { goal: 'first_discoveries' as const, target: 5, title: '5 First Discoveries', description: 'Be the first to find 5 cats', xpReward: 600 },
];
