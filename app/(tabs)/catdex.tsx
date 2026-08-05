import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CatDexCard } from '@/components/CatDexCard';
import { EmptyState } from '@/components/EmptyState';
import { Text } from '@/components/Text';
import { TabStackHeader } from '@/layout/TabStackHeader';
import { CATDEX_TARGET } from '@/lib/constants';
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
  const { colors, fonts, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const cats = useCatsStore((state) => state.cats);
  const [rarityFilter, setRarityFilter] = useState<CatDexRarityFilter>('all');
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());

  const filtered = useMemo(() => {
    return cats.filter((cat) =>
      matchesCatDexRarityFilter(cat.analysis, cat.number, rarityFilter),
    );
  }, [cats, rarityFilter]);

  const cardGap = spacing[16];
  const horizontalPad = spacing[24];
  const cardWidth = (windowWidth - horizontalPad * 2 - cardGap) / 2;
  const listBottom = Math.max(insets.bottom, spacing[16]) + spacing[24];

  const toggleFavorite = (catId: string) => {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <TabStackHeader
        title="CatDex"
        right={
          <Text variant="bodySmall" color="brand" style={{ fontFamily: fonts.bodySemi }}>
            {cats.length} / {CATDEX_TARGET}
          </Text>
        }
        below={
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
        }
      />

      <FlatList
        data={filtered}
        keyExtractor={(item: Cat) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: cardGap }}
        contentContainerStyle={{
          paddingHorizontal: horizontalPad,
          paddingTop: spacing[16],
          paddingBottom: listBottom,
          gap: cardGap,
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
          <View style={{ width: cardWidth }}>
            <CatDexCard
              cat={item}
              isFavorite={favorites.has(item.id)}
              onToggleFavorite={() => toggleFavorite(item.id)}
              onPress={() =>
                router.push({
                  pathname: '/cat/[id]',
                  params: { id: item.id },
                })
              }
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
