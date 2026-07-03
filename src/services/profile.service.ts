import { supabase } from '@/lib/supabase';
import type { UserStats, UserBadge, Badge } from '@/types';

export const profileService = {
  async getStats(userId: string): Promise<UserStats> {
    const [catsResult, observationsResult, photosResult, friendsResult, badgesResult, profileResult] =
      await Promise.all([
        supabase.from('cats').select('*', { count: 'exact', head: true }).eq('owner_id', userId),
        supabase.from('observations').select('*', { count: 'exact', head: true }).eq('observer_id', userId),
        supabase.from('photos').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase
          .from('friends')
          .select('*', { count: 'exact', head: true })
          .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
          .eq('status', 'accepted'),
        supabase.from('user_badges').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('profiles').select('streak_days, xp').eq('id', userId).single(),
      ]);

    const { data: leaderboard } = await supabase.rpc('get_leaderboard', { limit_count: 100 });
    const rank = leaderboard?.findIndex((e: { id: string }) => e.id === userId);

    return {
      totalCats: catsResult.count ?? 0,
      totalObservations: observationsResult.count ?? 0,
      totalPhotos: photosResult.count ?? 0,
      totalFriends: friendsResult.count ?? 0,
      badgesEarned: badgesResult.count ?? 0,
      currentStreak: profileResult.data?.streak_days ?? 0,
      rank: rank !== undefined && rank >= 0 ? rank + 1 : null,
    };
  },

  async getBadges(userId: string): Promise<UserBadge[]> {
    const { data, error } = await supabase
      .from('user_badges')
      .select(`*, badge:badges (*)`)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getAllBadges(): Promise<Badge[]> {
    const { data, error } = await supabase.from('badges').select('*').order('xp_reward');
    if (error) throw error;
    return data ?? [];
  },

  async checkAndAwardBadges(userId: string): Promise<UserBadge[]> {
    const stats = await this.getStats(userId);
    const earnedBadges = await this.getBadges(userId);
    const earnedIds = new Set(earnedBadges.map((b) => b.badge_id));
    const allBadges = await this.getAllBadges();
    const newlyAwarded: UserBadge[] = [];

    for (const badge of allBadges) {
      if (earnedIds.has(badge.id)) continue;

      const criteria = badge.criteria as Record<string, number>;
      let earned = false;

      if (criteria.observations && stats.totalObservations >= criteria.observations) earned = true;
      if (criteria.friends && stats.totalFriends >= criteria.friends) earned = true;
      if (criteria.streak && stats.currentStreak >= criteria.streak) earned = true;
      if (criteria.photos && stats.totalPhotos >= criteria.photos) earned = true;

      if (earned) {
        const { data, error } = await supabase
          .from('user_badges')
          .insert({ user_id: userId, badge_id: badge.id })
          .select(`*, badge:badges (*)`)
          .single();
        if (!error && data) {
          newlyAwarded.push(data);
          const { data: profile } = await supabase
            .from('profiles')
            .select('xp')
            .eq('id', userId)
            .single();
          if (profile) {
            await supabase
              .from('profiles')
              .update({ xp: profile.xp + badge.xp_reward })
              .eq('id', userId);
          }
        }
      }
    }

    return newlyAwarded;
  },
};
