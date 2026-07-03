import { supabase } from "@/lib/supabase";
import type { Badge, UserBadge } from "@/types/database";

export const badgesService = {
  async fetchAllBadges() {
    const { data, error } = await supabase.from("badges").select("*").order("id");
    if (error) throw error;
    return data as Badge[];
  },

  async fetchUserBadges(userId: string) {
    const { data, error } = await supabase
      .from("user_badges")
      .select("*, badge:badges(*)")
      .eq("user_id", userId);
    if (error) throw error;
    return data as UserBadge[];
  },

  async unlockBadge(userId: string, badgeId: string, progress = 100) {
    const { data, error } = await supabase
      .from("user_badges")
      .upsert({
        user_id: userId,
        badge_id: badgeId,
        progress,
        unlocked_at: new Date().toISOString(),
      })
      .select("*")
      .single();
    if (error) throw error;
    return data as UserBadge;
  },

  async updateProgress(userId: string, badgeId: string, progress: number) {
    const { data, error } = await supabase
      .from("user_badges")
      .upsert({
        user_id: userId,
        badge_id: badgeId,
        progress,
        unlocked_at: progress >= 100 ? new Date().toISOString() : null,
      })
      .select("*")
      .single();
    if (error) throw error;
    return data as UserBadge;
  },
};
