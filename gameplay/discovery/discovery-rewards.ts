import type { DiscoveryResult, XpGrant } from "@/gameplay/types";
import { GAME_BADGES, LEVEL_UNLOCKS, type BadgeMetric } from "@/gameplay/badges/badge-definitions";
import { XP_RULES, levelFromXp } from "@/gameplay/xp/xp-rules";

export type PlayerStats = {
  xp: number;
  level: number;
  totalCaptures: number;
  zonesExplored: number;
  streak: number;
  photosTaken: number;
  nightDiscoveries: number;
};

export type DiscoveryContext = {
  isFirstDiscoverer: boolean;
  isNewDistrict: boolean;
  includeStreakBonus: boolean;
  stats: PlayerStats;
};

export function computeDiscoveryRewards(
  ctx: DiscoveryContext,
  existingBadgeIds: string[] = []
): DiscoveryResult {
  const grants: XpGrant[] = [
    { type: "discover_cat", ...XP_RULES.discover_cat },
  ];

  if (ctx.isFirstDiscoverer) {
    grants.push({ type: "first_discoverer", ...XP_RULES.first_discoverer });
  }
  if (ctx.isNewDistrict) {
    grants.push({ type: "new_district", ...XP_RULES.new_district });
  }
  if (ctx.includeStreakBonus) {
    grants.push({ type: "daily_streak", ...XP_RULES.daily_streak });
  }

  const totalXp = grants.reduce((sum, g) => sum + g.amount, 0);
  const newXp = ctx.stats.xp + totalXp;
  const newLevel = levelFromXp(newXp);
  const leveledUp = newLevel > ctx.stats.level;

  const unlockedBadges = evaluateBadges(
    {
      ...ctx.stats,
      totalCaptures: ctx.stats.totalCaptures + 1,
      zonesExplored: ctx.isNewDistrict ? ctx.stats.zonesExplored + 1 : ctx.stats.zonesExplored,
    },
    existingBadgeIds
  );

  const unlockedFrames: string[] = [];
  const unlockedBackgrounds: string[] = [];
  if (leveledUp) {
    const unlock = LEVEL_UNLOCKS[newLevel];
    if (unlock) {
      unlockedFrames.push(...unlock.frames);
      unlockedBackgrounds.push(...unlock.backgrounds);
    }
  }

  return {
    totalXp,
    grants,
    modelId: "tabby_short",
    rarity: "commun",
    isFirstDiscoverer: ctx.isFirstDiscoverer,
    isNewDistrict: ctx.isNewDistrict,
    newLevel: leveledUp ? newLevel : undefined,
    leveledUp,
    unlockedBadges,
    unlockedFrames,
    unlockedBackgrounds,
  };
}

export function evaluateBadges(stats: PlayerStats, existingBadgeIds: string[] = []): string[] {
  const metrics: Record<BadgeMetric, number> = {
    total_discoveries: stats.totalCaptures,
    total_photos: stats.photosTaken,
    total_zones: stats.zonesExplored,
    night_discoveries: stats.nightDiscoveries,
    streak_days: stats.streak,
    cats_100: stats.totalCaptures,
    cats_500: stats.totalCaptures,
    cats_1000: stats.totalCaptures,
  };

  const earned = GAME_BADGES.filter((b) => metrics[b.metric] >= b.target).map((b) => b.id);
  return earned.filter((id) => !existingBadgeIds.includes(id));
}

export function isPopularCat(sightings: number) {
  return sightings >= 20;
}

export function isRecentlyObserved(lastObservedAt?: string) {
  if (!lastObservedAt) return false;
  const diff = Date.now() - new Date(lastObservedAt).getTime();
  return diff < 48 * 60 * 60 * 1000;
}
