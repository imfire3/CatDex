import { supabase } from "@/lib/supabase";
import type { Friendship, Profile } from "@/types/database";

export const friendsService = {
  async fetchFriends(userId: string) {
    const { data, error } = await supabase
      .from("friendships")
      .select("*")
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .eq("status", "accepted");
    if (error) throw error;
    return data as Friendship[];
  },

  async fetchPendingRequests(userId: string) {
    const { data, error } = await supabase
      .from("friendships")
      .select("*")
      .eq("addressee_id", userId)
      .eq("status", "pending");
    if (error) throw error;
    return data as Friendship[];
  },

  async searchUsers(query: string, currentUserId: string): Promise<Profile[]> {
    const q = query.trim();
    if (q.length < 2) return [];

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
      .neq("id", currentUserId)
      .limit(20);
    if (error) throw error;
    return data as Profile[];
  },

  async sendRequest(requesterId: string, addresseeId: string) {
    const { data, error } = await supabase
      .from("friendships")
      .insert({ requester_id: requesterId, addressee_id: addresseeId, status: "pending" })
      .select("*")
      .single();
    if (error) throw error;
    return data as Friendship;
  },

  async acceptRequest(friendshipId: string) {
    const { data, error } = await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", friendshipId)
      .select("*")
      .single();
    if (error) throw error;
    return data as Friendship;
  },

  async declineRequest(friendshipId: string) {
    const { error } = await supabase
      .from("friendships")
      .update({ status: "declined" })
      .eq("id", friendshipId);
    if (error) throw error;
  },

  async fetchLeaderboard(limit = 20) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("xp", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data as Profile[];
  },
};
