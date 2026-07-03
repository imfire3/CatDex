import {
  computeDiscoveryRewards,
  simulatePhotoAnalysis,
  missionStore,
  seasonStore,
  socialStore,
  retentionStore,
  dailyBonusXp,
  type DiscoveryResult,
  type SimulatedAnalysis,
} from "@/gameplay";
import { badgesService } from "@/services/badges.service";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/database";

async function userHasZoneCapture(userId: string, zoneId: string) {
  const { data } = await supabase
    .from("captures")
    .select("cat_id, cat:cats(zone_id)")
    .eq("user_id", userId);

  return (data ?? []).some((row) => {
    const cat = row.cat as { zone_id?: string } | null;
    return cat?.zone_id === zoneId;
  });
}

export const gameplayService = {
  analyzePhoto: simulatePhotoAnalysis,

  async processDiscovery(input: {
    profile: Profile;
    zoneId: string;
    isFirstDiscoverer: boolean;
    analysis: SimulatedAnalysis;
  }): Promise<DiscoveryResult> {
    const isNewDistrict = !(await userHasZoneCapture(input.profile.id, input.zoneId));
    const hour = new Date().getHours();
    const isNight = hour >= 0 && hour < 5;
    const includeStreakBonus = input.profile.streak > 0;

    const existingBadges = await badgesService
      .fetchUserBadges(input.profile.id)
      .then((rows) => rows.filter((b) => b.unlocked_at).map((b) => b.badge_id))
      .catch(() => [] as string[]);

    const result = computeDiscoveryRewards(
      {
        isFirstDiscoverer: input.isFirstDiscoverer,
        isNewDistrict,
        includeStreakBonus,
        stats: {
          xp: input.profile.xp,
          level: input.profile.level,
          totalCaptures: input.profile.total_captures,
          zonesExplored: input.profile.zones_explored,
          streak: input.profile.streak,
          photosTaken: input.profile.total_captures,
          nightDiscoveries: isNight ? 1 : 0,
        },
      },
      existingBadges
    );

    result.modelId = input.analysis.modelId;
    result.rarity = input.analysis.rarity;
    result.isNewDistrict = isNewDistrict;

    if (retentionStore.isFirstDiscoveryToday()) {
      const bonus = { type: "mission_complete" as const, amount: 100, label: "Première découverte du jour" };
      result.grants.push(bonus);
      result.totalXp += bonus.amount;
      retentionStore.markFirstDiscoveryToday();
    }

    await supabase.rpc("award_xp", {
      p_user_id: input.profile.id,
      p_amount: result.totalXp,
    });

    if (isNewDistrict) {
      await supabase
        .from("profiles")
        .update({ zones_explored: input.profile.zones_explored + 1 })
        .eq("id", input.profile.id);
    }

    for (const badgeId of result.unlockedBadges) {
      await badgesService.unlockBadge(input.profile.id, badgeId).catch(() => undefined);
    }

    missionStore.increment("discoveries");
    missionStore.increment("photos");
    if (input.isFirstDiscoverer) missionStore.increment("first_discoveries");
    if (isNewDistrict) missionStore.increment("new_zones");
    seasonStore.increment();

    return result;
  },

  toggleLike: socialStore.toggleLike,
  addComment: socialStore.addComment,
  getComments: socialStore.getComments,
  isLiked: socialStore.isLiked,
  getMissions: () => missionStore.getStore(),
  getSeasonProgress: () => seasonStore.getProgress(),
  getUnclaimedMissions: () => missionStore.unclaimedCount(),

  async claimDailyBonus(userId: string, streak: number) {
    if (!retentionStore.canClaimDailyBonus()) return null;
    const amount = dailyBonusXp(streak);
    retentionStore.claimDailyBonus();
    await supabase.rpc("award_xp", { p_user_id: userId, p_amount: amount });
    return amount;
  },

  async claimMission(userId: string, missionId: string) {
    const { xp, claimed } = missionStore.claimMission(missionId);
    if (!claimed || xp <= 0) return null;
    await supabase.rpc("award_xp", { p_user_id: userId, p_amount: xp });
    return xp;
  },

  canClaimDailyBonus: () => retentionStore.canClaimDailyBonus(),
  isFirstDiscoveryToday: () => retentionStore.isFirstDiscoveryToday(),
};
