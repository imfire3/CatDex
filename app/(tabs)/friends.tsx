import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useFriends,
  useFriendRequests,
  useLeaderboard,
  useUserSearch,
  useSendFriendRequest,
  useAcceptFriendRequest,
} from '@/hooks';
import { useAuthStore } from '@/stores/auth.store';
import { colors, spacing, typography, borderRadius } from '@/theme';
import { Card, EmptyState, LoadingSpinner, XpBar } from '@/components';
import type { Profile, Friend, LeaderboardEntry } from '@/types';

type Tab = 'friends' | 'requests' | 'search' | 'leaderboard';

export default function FriendsScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuthStore();

  const { data: friends = [], isLoading: friendsLoading } = useFriends();
  const { data: requests = [], isLoading: requestsLoading } = useFriendRequests();
  const { data: leaderboard = [], isLoading: leaderboardLoading } = useLeaderboard();
  const { data: searchResults = [] } = useUserSearch(searchQuery);
  const sendRequest = useSendFriendRequest();
  const acceptRequest = useAcceptFriendRequest();

  const getFriendProfile = (friend: Friend): Profile | undefined => {
    if (friend.requester_id === user?.id) return friend.addressee;
    return friend.requester;
  };

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: 'friends', label: 'Friends' },
    { key: 'requests', label: 'Requests', badge: requests.length },
    { key: 'search', label: 'Search' },
    { key: 'leaderboard', label: 'Rank' },
  ];

  const renderFriend = ({ item }: { item: Friend }) => {
    const profile = getFriendProfile(item);
    if (!profile) return null;
    return (
      <Card style={styles.listItem}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile.display_name?.[0] ?? '?'}</Text>
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{profile.display_name}</Text>
          <Text style={styles.itemSub}>@{profile.username} · Lv.{profile.level}</Text>
        </View>
        <Text style={styles.itemXp}>{profile.xp} XP</Text>
      </Card>
    );
  };

  const renderRequest = ({ item }: { item: Friend }) => {
    const profile = item.requester;
    if (!profile) return null;
    return (
      <Card style={styles.listItem}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile.display_name?.[0] ?? '?'}</Text>
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{profile.display_name}</Text>
          <Text style={styles.itemSub}>@{profile.username}</Text>
        </View>
        <View style={styles.requestActions}>
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => acceptRequest.mutate(item.id)}
          >
            <Ionicons name="checkmark" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  const renderSearchResult = ({ item }: { item: Profile }) => (
    <Card style={styles.listItem}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.display_name?.[0] ?? '?'}</Text>
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.display_name}</Text>
        <Text style={styles.itemSub}>@{item.username} · Lv.{item.level}</Text>
      </View>
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => sendRequest.mutate(item.id)}
      >
        <Ionicons name="person-add" size={18} color={colors.text} />
      </TouchableOpacity>
    </Card>
  );

  const renderLeaderboardEntry = ({ item }: { item: LeaderboardEntry }) => {
    const isMe = item.id === user?.id;
    return (
      <Card style={isMe ? [styles.listItem, styles.meItem] : styles.listItem}>
        <Text style={[styles.rank, item.rank <= 3 && styles.topRank]}>#{item.rank}</Text>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.display_name?.[0] ?? '?'}</Text>
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.display_name}{isMe ? ' (You)' : ''}</Text>
          <Text style={styles.itemSub}>{item.cats_discovered} cats · Lv.{item.level}</Text>
        </View>
        <Text style={styles.itemXp}>{item.xp} XP</Text>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Friends</Text>
      </View>

      <View style={styles.tabRow}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
            {tab.badge ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{tab.badge}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'search' && (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      )}

      {activeTab === 'friends' && (
        friendsLoading ? <LoadingSpinner /> :
        friends.length === 0 ? <EmptyState icon="👥" title="No friends yet" subtitle="Search for users to add!" /> :
        <FlatList data={friends} renderItem={renderFriend} keyExtractor={(i) => i.id} contentContainerStyle={styles.list} />
      )}

      {activeTab === 'requests' && (
        requestsLoading ? <LoadingSpinner /> :
        requests.length === 0 ? <EmptyState icon="📬" title="No pending requests" /> :
        <FlatList data={requests} renderItem={renderRequest} keyExtractor={(i) => i.id} contentContainerStyle={styles.list} />
      )}

      {activeTab === 'search' && (
        searchQuery.length < 2 ? <EmptyState icon="🔍" title="Search for friends" subtitle="Enter at least 2 characters" /> :
        <FlatList data={searchResults} renderItem={renderSearchResult} keyExtractor={(i) => i.id} contentContainerStyle={styles.list} />
      )}

      {activeTab === 'leaderboard' && (
        leaderboardLoading ? <LoadingSpinner /> :
        <FlatList data={leaderboard} renderItem={renderLeaderboardEntry} keyExtractor={(i) => i.id} contentContainerStyle={styles.list} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing.md,
  },
  title: { ...typography.h2, color: colors.text },
  tabRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.md },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  tabActive: { backgroundColor: colors.primary + '25', borderWidth: 1, borderColor: colors.primary },
  tabText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: colors.primary },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: colors.text, fontSize: 10, fontWeight: '700' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 16, paddingVertical: spacing.md },
  list: { padding: spacing.lg, gap: spacing.sm },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  meItem: { borderColor: colors.primary, borderWidth: 1 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.text, fontSize: 18, fontWeight: '700' },
  itemInfo: { flex: 1 },
  itemName: { color: colors.text, fontWeight: '600', fontSize: 16 },
  itemSub: { color: colors.textSecondary, fontSize: 13 },
  itemXp: { color: colors.accent, fontWeight: '700', fontSize: 14 },
  rank: { color: colors.textMuted, fontWeight: '700', fontSize: 16, width: 36 },
  topRank: { color: colors.accent },
  requestActions: { flexDirection: 'row', gap: spacing.sm },
  acceptBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
