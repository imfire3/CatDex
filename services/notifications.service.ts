import { supabase } from "@/lib/supabase";
import type { AppNotification, NotificationType } from "@/types/database";

export const notificationsService = {
  async fetchNotifications(userId: string) {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return data as AppNotification[];
  },

  async markRead(notificationId: string) {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);
    if (error) throw error;
  },

  async createLocalNotification(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    payload: Record<string, unknown> = {}
  ) {
    const { data, error } = await supabase
      .from("notifications")
      .insert({ user_id: userId, type, title, body, payload })
      .select("*")
      .single();
    if (error) throw error;
    return data as AppNotification;
  },

  buildNearbyCatNotification(catName: string, zone: string) {
    return {
      type: "nearby_cat" as const,
      title: "Chat à proximité !",
      body: `${catName} a été repéré près de ${zone}.`,
    };
  },

  buildFriendDiscoveryNotification(friendName: string, catName: string) {
    return {
      type: "friend_discovery" as const,
      title: `${friendName} a découvert un chat`,
      body: `${friendName} vient d'ajouter ${catName} à son ChatDex.`,
    };
  },

  buildStreakNotification(streak: number) {
    return {
      type: "daily_streak" as const,
      title: "Série quotidienne !",
      body: `Tu es à ${streak} jour${streak > 1 ? "s" : ""} d'affilée. Continue !`,
    };
  },
};
