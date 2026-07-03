import { supabase } from '@/lib/supabase';
import { notificationService } from './notification.service';
import type { Friend, Profile, LeaderboardEntry } from '@/types';

export const friendsService = {
  async getFriends(userId: string): Promise<Friend[]> {
    const { data, error } = await supabase
      .from('friends')
      .select(`
        *,
        requester:profiles!friends_requester_id_fkey (*),
        addressee:profiles!friends_addressee_id_fkey (*)
      `)
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .eq('status', 'accepted');
    if (error) throw error;
    return data ?? [];
  },

  async getPendingRequests(userId: string): Promise<Friend[]> {
    const { data, error } = await supabase
      .from('friends')
      .select(`
        *,
        requester:profiles!friends_requester_id_fkey (*)
      `)
      .eq('addressee_id', userId)
      .eq('status', 'pending');
    if (error) throw error;
    return data ?? [];
  },

  async sendFriendRequest(requesterId: string, addresseeId: string): Promise<Friend> {
    const { data, error } = await supabase
      .from('friends')
      .insert({ requester_id: requesterId, addressee_id: addresseeId })
      .select()
      .single();
    if (error) throw error;

    await notificationService.createNotification(addresseeId, {
      type: 'friend_request',
      title: 'New Friend Request',
      body: 'Someone wants to be your friend!',
      data: { friendId: data.id, requesterId },
    });

    return data;
  },

  async acceptFriendRequest(friendId: string): Promise<Friend> {
    const { data, error } = await supabase
      .from('friends')
      .update({ status: 'accepted' })
      .eq('id', friendId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async declineFriendRequest(friendId: string): Promise<void> {
    const { error } = await supabase.from('friends').delete().eq('id', friendId);
    if (error) throw error;
  },

  async searchUsers(query: string, currentUserId: string): Promise<Profile[]> {
    if (query.length < 2) return [];

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .neq('id', currentUserId)
      .eq('is_anonymous', false)
      .limit(20);
    if (error) throw error;
    return data ?? [];
  },

  async getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase.rpc('get_leaderboard', { limit_count: limit });
    if (error) throw error;
    return data ?? [];
  },

  async getFriendCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('friends')
      .select('*', { count: 'exact', head: true })
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .eq('status', 'accepted');
    if (error) throw error;
    return count ?? 0;
  },
};
