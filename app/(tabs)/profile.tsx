import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/auth.store';
import { useProfileStats, useBadges, useNotifications } from '@/hooks';
import { useOfflineStore } from '@/stores';
import { authService } from '@/services/auth.service';
import { colors, spacing, typography, borderRadius } from '@/theme';
import { Card, XpBar, LoadingSpinner, BadgeChip } from '@/components';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, user } = useAuthStore();
  const { data: stats, isLoading: statsLoading } = useProfileStats();
  const { data: badges = [] } = useBadges();
  const { data: notifications = [] } = useNotifications();
  const { isOnline, pendingUploads } = useOfflineStore();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSignOut = async () => {
    await authService.signOut();
  };

  if (!profile) return <LoadingSpinner message="Loading profile..." />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarLargeText}>{profile.display_name?.[0] ?? '?'}</Text>
        </View>
        <Text style={styles.displayName}>{profile.display_name}</Text>
        <Text style={styles.username}>@{profile.username}</Text>
        {profile.is_anonymous && (
          <BadgeChip label="Guest" color={colors.textMuted} />
        )}
      </View>

      <Card style={styles.xpCard}>
        <XpBar xp={profile.xp} level={profile.level} />
      </Card>

      {!isOnline && (
        <Card style={styles.offlineBanner}>
          <Ionicons name="cloud-offline" size={20} color={colors.warning} />
          <Text style={styles.offlineText}>Offline Mode</Text>
          {pendingUploads > 0 && (
            <Text style={styles.offlineSub}>{pendingUploads} pending uploads</Text>
          )}
        </Card>
      )}

      <View style={styles.statsGrid}>
        {statsLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>{stats?.totalObservations ?? 0}</Text>
              <Text style={styles.statLabel}>Discovered</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>{stats?.totalCats ?? 0}</Text>
              <Text style={styles.statLabel}>Created</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>{stats?.totalFriends ?? 0}</Text>
              <Text style={styles.statLabel}>Friends</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>{stats?.currentStreak ?? 0}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </Card>
          </>
        )}
      </View>

      {stats?.rank && (
        <Card style={styles.rankCard}>
          <Ionicons name="trophy" size={24} color={colors.accent} />
          <Text style={styles.rankText}>Global Rank #{stats.rank}</Text>
        </Card>
      )}

      <Text style={styles.sectionTitle}>Badges ({badges.length})</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgesScroll}>
        {badges.length === 0 ? (
          <Card style={styles.noBadge}>
            <Text style={styles.noBadgeText}>No badges yet. Keep exploring!</Text>
          </Card>
        ) : (
          badges.map((ub) => (
            <Card key={ub.id} style={styles.badgeCard}>
              <Text style={styles.badgeIcon}>🏆</Text>
              <Text style={styles.badgeName}>{ub.badge?.name}</Text>
            </Card>
          ))
        )}
      </ScrollView>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/notifications')}>
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
          <Text style={styles.menuText}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>{unreadCount}</Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
          <Text style={[styles.menuText, { color: colors.error }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 100 },
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing.lg,
    gap: spacing.xs,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarLargeText: { color: colors.text, fontSize: 32, fontWeight: '700' },
  displayName: { ...typography.h2, color: colors.text },
  username: { color: colors.textSecondary, fontSize: 14 },
  xpCard: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  offlineBanner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.warning + '15',
    borderColor: colors.warning + '40',
  },
  offlineText: { color: colors.warning, fontWeight: '600', flex: 1 },
  offlineSub: { color: colors.textSecondary, fontSize: 12 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: { width: '47%', alignItems: 'center', padding: spacing.md },
  statValue: { color: colors.text, fontSize: 28, fontWeight: '700' },
  statLabel: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  rankCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rankText: { color: colors.accent, fontWeight: '700', fontSize: 16 },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  badgesScroll: { paddingLeft: spacing.lg, marginBottom: spacing.lg },
  badgeCard: { width: 100, alignItems: 'center', marginRight: spacing.sm, padding: spacing.md },
  badgeIcon: { fontSize: 32, marginBottom: spacing.xs },
  badgeName: { color: colors.text, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  noBadge: { padding: spacing.lg, marginRight: spacing.lg },
  noBadgeText: { color: colors.textSecondary, fontSize: 14 },
  menuSection: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuText: { color: colors.text, fontSize: 16, flex: 1 },
  notifBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  notifBadgeText: { color: colors.text, fontSize: 11, fontWeight: '700' },
});
