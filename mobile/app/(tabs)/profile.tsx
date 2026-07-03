import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { XPBar } from '../../components/XPBar';
import { api, UserProfileResponse } from '../../services/api';
import { Colors, FontSize, Spacing, PROFILE_FRAME_COLORS, BACKGROUND_GRADIENTS } from '../../constants/theme';
import type { Badge, FriendDiscovery } from '@catdex/shared';

interface BadgeWithEarned extends Badge {
  earned: boolean;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [badges, setBadges] = useState<BadgeWithEarned[]>([]);
  const [friends, setFriends] = useState<FriendDiscovery[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [me, allBadges, discoveries] = await Promise.all([
        api.getProfile(),
        api.getBadges(),
        api.getFriendsDiscoveries(),
      ]);
      setProfile(me);
      const earned = new Set(me.badges ?? []);
      setBadges(allBadges.map((b) => ({ ...b, earned: earned.has(b.id) })));
      setFriends(discoveries);
    } catch (e) {
      console.warn(e);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (!profile) {
    return <View style={styles.container}><Text style={styles.loading}>Loading...</Text></View>;
  }

  const bg = BACKGROUND_GRADIENTS[profile.background ?? 'default'] ?? BACKGROUND_GRADIENTS.default;
  const frameColor = PROFILE_FRAME_COLORS[profile.profileFrame ?? ''] ?? Colors.border;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      <LinearGradient colors={bg} style={styles.header}>
        <View style={[styles.avatar, { borderColor: frameColor }]}>
          <Text style={styles.avatarEmoji}>🐱</Text>
        </View>
        <Text style={styles.username}>{profile.username}</Text>
        <XPBar
          current={profile.xpProgress.current}
          required={profile.xpProgress.required}
          progress={profile.xpProgress.progress}
          level={profile.level}
        />
        <View style={styles.statsRow}>
          <Stat label="Discoveries" value={profile.totalDiscoveries} />
          <Stat label="Observations" value={profile.totalObservations} />
          <Stat label="Streak" value={`${profile.dailyStreak}🔥`} />
        </View>
      </LinearGradient>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Badges</Text>
        </View>
        <View style={styles.badgeGrid}>
          {badges.map((badge) => (
            <View key={badge.id} style={[styles.badge, !badge.earned && styles.badgeLocked]}>
              <Text style={styles.badgeIcon}>{badge.earned ? badge.icon : '🔒'}</Text>
              <Text style={styles.badgeName}>{badge.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Districts Explored</Text>
        <View style={styles.districts}>
          {(profile.districtsExplored ?? []).map((d: string) => (
            <View key={d} style={styles.districtChip}>
              <Text style={styles.districtText}>{d}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Friends' Discoveries</Text>
          <TouchableOpacity onPress={() => router.push('/leaderboard')}>
            <Text style={styles.link}>Leaderboard →</Text>
          </TouchableOpacity>
        </View>
        {friends.slice(0, 5).map((f) => (
          <TouchableOpacity key={f.id} style={styles.friendRow} onPress={() => router.push(`/cat/${f.catId}`)}>
            <Text style={styles.friendUser}>{f.username}</Text>
            <Text style={styles.friendCat}>found {f.catName}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loading: { color: Colors.textSecondary, textAlign: 'center', marginTop: 100 },
  header: { padding: Spacing.lg, paddingTop: 60, alignItems: 'center' },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  avatarEmoji: { fontSize: 40 },
  username: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '800', marginBottom: Spacing.md },
  statsRow: { flexDirection: 'row', gap: Spacing.xl, marginTop: Spacing.lg },
  stat: { alignItems: 'center' },
  statValue: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '800' },
  statLabel: { color: Colors.textSecondary, fontSize: FontSize.sm },
  section: { padding: Spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '800', marginBottom: Spacing.sm },
  link: { color: Colors.primary, fontWeight: '600' },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  badge: {
    width: '30%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  badgeLocked: { opacity: 0.4 },
  badgeIcon: { fontSize: 28 },
  badgeName: { color: Colors.textSecondary, fontSize: 10, textAlign: 'center', marginTop: 4 },
  districts: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  districtChip: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  districtText: { color: Colors.text, fontSize: FontSize.sm },
  friendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
  },
  friendUser: { color: Colors.primary, fontWeight: '600' },
  friendCat: { color: Colors.textSecondary },
});
