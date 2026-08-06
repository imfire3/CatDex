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
import { SearchInput } from '@/components/Input';
import { Text } from '@/components/Text';
import { TabStackHeader } from '@/layout/TabStackHeader';
import { CATDEX_TARGET } from '@/lib/constants';
import { type CatDexRarityFilter, matchesCatDexRarityFilter } from '@/lib/catTheme';
import { useCatsStore } from '@/store/cats';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

type ListFilter = CatDexRarityFilter | 'favorites';

const RARITY_FILTERS: { id: ListFilter; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'favorites', label: 'Favoris' },
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
  const [listFilter, setListFilter] = useState<ListFilter>('all');
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    return cats.filter((cat) => {
      if (listFilter === 'favorites') {
        if (!favorites.has(cat.id)) return false;
      } else if (
        !matchesCatDexRarityFilter(cat.analysis, cat.number, listFilter)
      ) {
        return false;
      }

      if (!normalizedQuery) return true;
      const haystack = [
        cat.name,
        cat.analysis?.breed,
        cat.analysis?.color,
        cat.analysis?.coat,
        cat.notes,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [cats, favorites, listFilter, normalizedQuery]);

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

  const empty = (() => {
    if (cats.length === 0) {
      return (
        <EmptyState
          layout="page"
          icon="cat"
          title="Ton CatDex est vide"
          description="Pars explorer ton quartier et capture ton premier chat !"
          actionLabel="Explorer la carte"
          onAction={() => router.push('/(tabs)/map')}
        />
      );
    }
    if (listFilter === 'favorites' && favorites.size === 0) {
      return (
        <EmptyState
          layout="page"
          icon="heart"
          title="Aucun favori pour le moment"
          description="Ajoute des chats à tes favoris en appuyant sur le ❤️ sur leur fiche."
          actionLabel="Explorer des chats"
          onAction={() => setListFilter('all')}
        />
      );
    }
    if (normalizedQuery.length > 0) {
      return (
        <EmptyState
          layout="page"
          icon="search"
          title="Aucun résultat"
          description="Aucun chat ne correspond à ta recherche."
          actionLabel="Effacer les filtres"
          actionVariant="secondary"
          onAction={() => {
            setQuery('');
            setListFilter('all');
          }}
        />
      );
    }
    return (
      <EmptyState
        layout="page"
        icon="search"
        title="Aucun chat ici"
        description="Essaie un autre filtre de rareté."
        actionLabel="Voir tous"
        actionVariant="secondary"
        onAction={() => setListFilter('all')}
      />
    );
  })();

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
          <View style={{ gap: spacing[16] }}>
            <SearchInput
              value={query}
              onChangeText={setQuery}
              placeholder="Rechercher un chat…"
              clearButtonMode="while-editing"
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing[8], paddingRight: spacing[8] }}
            >
              {RARITY_FILTERS.map((filter) => {
                const selected = listFilter === filter.id;
                return (
                  <Pressable
                    key={filter.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setListFilter(filter.id)}
                    style={({ pressed }) => ({
                      height: spacing[40],
                      paddingHorizontal: spacing[16],
                      borderRadius: radius.full,
                      backgroundColor: selected ? colors.brand : colors.surfaceElevated,
                      borderWidth: selected ? 0 : 1,
                      borderColor: colors.border,
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
        }
      />

      <FlatList
        data={filtered}
        keyExtractor={(item: Cat) => item.id}
        numColumns={2}
        columnWrapperStyle={filtered.length > 0 ? { gap: cardGap } : undefined}
        contentContainerStyle={{
          paddingHorizontal: horizontalPad,
          paddingTop: spacing[16],
          paddingBottom: listBottom,
          gap: cardGap,
          flexGrow: 1,
        }}
        ListEmptyComponent={empty}
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
