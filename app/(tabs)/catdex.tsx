import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { CatDexCard } from '@/components/CatDexCard';
import { EmptyState } from '@/components/EmptyState';
import { SearchInput } from '@/components/Input';
import { Text } from '@/components/Text';
import { getTabBarTotalHeight } from '@/layout/MainTabBar';
import { CATDEX_TARGET } from '@/lib/constants';
import { DEMO_CATS } from '@/lib/demoCats';
import { type CatDexRarityFilter, matchesCatDexRarityFilter } from '@/lib/catTheme';
import { useCatsStore } from '@/store/cats';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

const RARITY_FILTERS: { id: CatDexRarityFilter; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'common', label: 'Commun' },
  { id: 'uncommon', label: 'Rare' },
  { id: 'rare', label: 'Épique' },
  { id: 'exceptional', label: 'Légendaire' },
];

export default function CatDexScreen() {
  const { colors, fonts, spacing, radius, shadow, iconStroke, iconSize } = useTheme();
  const insets = useSafeAreaInsets();
  const storedCats = useCatsStore((state) => state.cats);
  const cats = __DEV__ && storedCats.length === 0 ? DEMO_CATS : storedCats;
  const [search, setSearch] = useState('');
  const [rarityFilter, setRarityFilter] = useState<CatDexRarityFilter>('all');
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());

  const filtered = useMemo(() => {
    return cats.filter((cat) => {
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const haystack = `${cat.name} ${cat.analysis.breed} ${cat.analysis.color}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return matchesCatDexRarityFilter(cat.analysis, cat.number, rarityFilter);
    });
  }, [cats, rarityFilter, search]);

  const toggleFavorite = (catId: string) => {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const listBottom = getTabBarTotalHeight(insets.bottom, spacing) + spacing[16];

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={{ paddingHorizontal: spacing[24], paddingTop: spacing[24], gap: spacing[16] }}>
        <View style={{ gap: spacing[4] }}>
          <Text variant="h1" color="textBrand" style={{ fontFamily: fonts.display }}>
            CatDex
          </Text>
          <Text variant="bodySmall" color="brand" style={{ fontFamily: fonts.bodySemi }}>
            {cats.length} / {CATDEX_TARGET} chats
          </Text>
          <Text variant="caption" color="textSecondary">
            Espèces découvertes
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[8] }}>
          <View style={{ flex: 1 }}>
            <SearchInput
              placeholder="Rechercher un chat…"
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Filtres"
            style={({ pressed }) => [
              {
                width: spacing[48],
                height: spacing[48],
                borderRadius: radius.full,
                backgroundColor: colors.surfaceElevated,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.88 : 1,
                transform: [{ scale: pressed ? 0.96 : 1 }],
              },
              shadow.low,
            ]}
          >
            <Svg width={iconSize.md} height={iconSize.md} viewBox="0 0 24 24" fill="none">
              <Path
                d="M4 7h16M6 12h12M9 17h6"
                stroke={colors.brand}
                strokeWidth={iconStroke.regular}
                strokeLinecap="round"
              />
            </Svg>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing[8], paddingRight: spacing[8] }}
        >
          {RARITY_FILTERS.map((filter) => {
            const selected = rarityFilter === filter.id;
            return (
              <Pressable
                key={filter.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setRarityFilter(filter.id)}
                style={({ pressed }) => ({
                  height: spacing[40],
                  paddingHorizontal: spacing[16],
                  borderRadius: radius.full,
                  backgroundColor: selected ? colors.brand : colors.surfaceElevated,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <Text
                  variant="bodySmall"
                  color={selected ? 'onAccent' : 'textBrand'}
                  style={{ fontFamily: fonts.bodySemi }}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item: Cat) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: spacing[16] }}
        contentContainerStyle={{
          paddingHorizontal: spacing[24],
          paddingTop: spacing[16],
          paddingBottom: listBottom,
          gap: spacing[16],
          flexGrow: 1,
        }}
        ListEmptyComponent={
          <EmptyState
            title="Collection vide"
            description="Scanne ton premier chat pour commencer ton CatDex."
            actionLabel="Scanner"
            onAction={() => router.push('/scanner')}
          />
        }
        renderItem={({ item }) => (
          <CatDexCard
            cat={item}
            isFavorite={favorites.has(item.id)}
            onToggleFavorite={() => toggleFavorite(item.id)}
            onPress={() => router.push(`/cat/${item.id}`)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
