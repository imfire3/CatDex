import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useChatDex, useToggleFavorite } from '@/hooks';
import { useChatDexStore } from '@/stores';
import { colors, spacing, typography, borderRadius } from '@/theme';
import { BadgeChip, EmptyState, LoadingSpinner } from '@/components';
import { RARITY_COLORS } from '@/lib/constants';
import type { CatWithPhoto } from '@/types';

export default function ChatDexScreen() {
  const router = useRouter();
  const { filters, setFilters } = useChatDexStore();
  const { data: cats = [], isLoading, refetch } = useChatDex();
  const toggleFavorite = useToggleFavorite();

  const renderCat = ({ item }: { item: CatWithPhoto }) => (
    <TouchableOpacity
      style={styles.catCard}
      onPress={() => router.push(`/cat/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.catImageContainer}>
        {item.primary_photo_url ? (
          <Image source={{ uri: item.primary_photo_url }} style={styles.catImage} contentFit="cover" />
        ) : (
          <View style={styles.catImagePlaceholder}>
            <Text style={styles.placeholderEmoji}>🐱</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.favBtn}
          onPress={() => toggleFavorite.mutate(item.id)}
        >
          <Ionicons
            name={item.is_favorite ? 'heart' : 'heart-outline'}
            size={20}
            color={item.is_favorite ? colors.primary : colors.text}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.catDetails}>
        <Text style={styles.catName} numberOfLines={1}>{item.name}</Text>
        <BadgeChip label={item.rarity} color={RARITY_COLORS[item.rarity]} />
        {item.breed && <Text style={styles.catBreed}>{item.breed}</Text>}
        {item.location_name && (
          <Text style={styles.catLocation} numberOfLines={1}>
            <Ionicons name="location-outline" size={12} color={colors.textMuted} /> {item.location_name}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ChatDex</Text>
        <Text style={styles.subtitle}>{cats.length} cats discovered</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search cats..."
          placeholderTextColor={colors.textMuted}
          value={filters.search}
          onChangeText={(search) => setFilters({ search })}
        />
        {filters.search ? (
          <TouchableOpacity onPress={() => setFilters({ search: '' })}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.filterRow}>
        {(['all', 'common', 'uncommon', 'rare', 'legendary'] as const).map((rarity) => (
          <TouchableOpacity
            key={rarity}
            style={[styles.filterChip, filters.rarity === rarity && styles.filterChipActive]}
            onPress={() => setFilters({ rarity })}
          >
            <Text style={[styles.filterText, filters.rarity === rarity && styles.filterTextActive]}>
              {rarity}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sortRow}>
        <TouchableOpacity
          style={[styles.sortBtn, filters.favoritesOnly && styles.sortBtnActive]}
          onPress={() => setFilters({ favoritesOnly: !filters.favoritesOnly })}
        >
          <Ionicons name="heart" size={16} color={filters.favoritesOnly ? colors.primary : colors.textMuted} />
          <Text style={[styles.sortText, filters.favoritesOnly && { color: colors.primary }]}>Favorites</Text>
        </TouchableOpacity>
        {(['date', 'name', 'rarity'] as const).map((sort) => (
          <TouchableOpacity
            key={sort}
            style={[styles.sortBtn, filters.sortBy === sort && styles.sortBtnActive]}
            onPress={() => setFilters({ sortBy: sort })}
          >
            <Text style={[styles.sortText, filters.sortBy === sort && { color: colors.primary }]}>
              {sort}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <LoadingSpinner message="Loading ChatDex..." />
      ) : cats.length === 0 ? (
        <EmptyState icon="📖" title="No cats found" subtitle="Try adjusting your filters or discover new cats!" />
      ) : (
        <FlatList
          data={cats}
          renderItem={renderCat}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing.md,
  },
  title: { ...typography.h2, color: colors.text },
  subtitle: { color: colors.textSecondary, fontSize: 14, marginTop: 2 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: { marginRight: spacing.sm },
  searchInput: { flex: 1, color: colors.text, fontSize: 16, paddingVertical: spacing.md },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primary + '20', borderColor: colors.primary },
  filterText: { color: colors.textSecondary, fontSize: 12, textTransform: 'capitalize' },
  filterTextActive: { color: colors.primary, fontWeight: '600' },
  sortRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
  },
  sortBtnActive: { backgroundColor: colors.primary + '15' },
  sortText: { color: colors.textMuted, fontSize: 12, textTransform: 'capitalize' },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  row: { gap: spacing.md },
  catCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catImageContainer: { position: 'relative' },
  catImage: { width: '100%', height: 140 },
  catImagePlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: { fontSize: 48 },
  favBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background + 'aa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catDetails: { padding: spacing.md, gap: spacing.xs },
  catName: { color: colors.text, fontWeight: '700', fontSize: 16 },
  catBreed: { color: colors.textSecondary, fontSize: 12 },
  catLocation: { color: colors.textMuted, fontSize: 11 },
});
