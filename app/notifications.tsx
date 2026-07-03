import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '@/hooks';
import { notificationService } from '@/services/notification.service';
import { useAuthStore } from '@/stores/auth.store';
import { colors, spacing, typography, borderRadius } from '@/theme';
import { Card, EmptyState, LoadingSpinner } from '@/components';
import type { Notification } from '@/types';

const NOTIFICATION_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  nearby_cat: 'location',
  friend_discovery: 'people',
  daily_streak: 'flame',
  friend_request: 'person-add',
  badge_earned: 'trophy',
};

export default function NotificationsScreen() {
  const { user } = useAuthStore();
  const { data: notifications = [], isLoading, refetch } = useNotifications();

  const handleMarkAllRead = async () => {
    if (user) await notificationService.markAllAsRead(user.id);
    refetch();
  };

  const handleMarkRead = async (notification: Notification) => {
    if (!notification.read) {
      await notificationService.markAsRead(notification.id);
      refetch();
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity onPress={() => handleMarkRead(item)}>
      <Card style={!item.read ? [styles.notifCard, styles.unread] : styles.notifCard}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons
            name={NOTIFICATION_ICONS[item.type] ?? 'notifications'}
            size={22}
            color={colors.primary}
          />
        </View>
        <View style={styles.notifContent}>
          <Text style={styles.notifTitle}>{item.title}</Text>
          <Text style={styles.notifBody}>{item.body}</Text>
          <Text style={styles.notifTime}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </Card>
    </TouchableOpacity>
  );

  if (isLoading) return <LoadingSpinner message="Loading notifications..." />;

  return (
    <View style={styles.container}>
      {notifications.length > 0 && (
        <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllRead}>
          <Text style={styles.markAllText}>Mark all as read</Text>
        </TouchableOpacity>
      )}

      {notifications.length === 0 ? (
        <EmptyState icon="🔔" title="No notifications" subtitle="You're all caught up!" />
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onRefresh={refetch}
          refreshing={isLoading}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  markAllBtn: { alignItems: 'flex-end', padding: spacing.md },
  markAllText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  list: { padding: spacing.lg, gap: spacing.sm },
  notifCard: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  unread: { borderColor: colors.primary + '40' },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifContent: { flex: 1 },
  notifTitle: { color: colors.text, fontWeight: '600', fontSize: 15 },
  notifBody: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  notifTime: { color: colors.textMuted, fontSize: 11, marginTop: spacing.xs },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
});
