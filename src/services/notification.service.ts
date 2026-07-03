import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import type { Notification, NotificationType } from '@/types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationService = {
  async requestPermission(): Promise<boolean> {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  },

  async registerPushToken(userId: string): Promise<void> {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) return;

    const token = await Notifications.getExpoPushTokenAsync();
    await supabase.from('profiles').update({ push_token: token.data }).eq('id', userId);
  },

  async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data ?? [];
  },

  async createNotification(
    userId: string,
    notification: {
      type: NotificationType;
      title: string;
      body: string;
      data?: Record<string, unknown>;
    }
  ): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        data: notification.data ?? {},
      })
      .select()
      .single();
    if (error) throw error;

    if (Platform.OS !== 'web') {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
        },
        trigger: null,
      });
    }

    return data;
  },

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    if (error) throw error;
  },

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
    if (error) throw error;
  },

  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);
    if (error) throw error;
    return count ?? 0;
  },

  async notifyNearbyCat(userId: string, catName: string, distanceKm: number): Promise<void> {
    await this.createNotification(userId, {
      type: 'nearby_cat',
      title: 'Cat Nearby!',
      body: `${catName} was spotted ${distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm.toFixed(1)}km`} away`,
      data: { catName, distanceKm },
    });
  },

  async notifyFriendDiscovery(
    userId: string,
    friendName: string,
    catName: string
  ): Promise<void> {
    await this.createNotification(userId, {
      type: 'friend_discovery',
      title: 'Friend Discovery!',
      body: `${friendName} discovered ${catName}`,
      data: { friendName, catName },
    });
  },
};
