import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CatDexCard } from '@/components/CatDexCard';
import { EmptyState } from '@/components/EmptyState';
import { PageLoading } from '@/components/Loader';
import { SearchInput } from '@/components/Input';
import { Text } from '@/components/Text';
import { TabStackHeader } from '@/layout/TabStackHeader';
import { CATDEX_TARGET } from '@/lib/constants';
import { type CatDexRarityFilter, matchesCatDexRarityFilter } from '@/lib/catTheme';
import { useCatsStore } from '@/store/cats';
import { useTheme } from '@/theme/ThemeProvider';

type ListFilter = CatDexRarityFilter | 'favorites';

const RARITY_FILTERS: { id: ListFilter; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'favorites', label: 'Favoris' },
  { id: 'common', label: 'Commun' },
  { id: 'uncommon', label: 'Rare' },
  { id: 'rare', label: 'Épique' },
  { id: 'exceptional', label: 'Légendaire' },
];

const COLUMNS = 2;

export default function CatDexScreen() {
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const cats = useCatsStore((state) => state.cats);
  const hydrated = useCatsStore((state) => state.hydrated);
  const [listFilter, setListFilter] = useState<ListFilter>('all');
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    return cats.filter((cat) => {
      if (!cat?.id) return false;

      if (listFilter === 'favorites') {
        if (!favorites.has(cat.id)) return false;
      } else if (
        !matchesCatDexRarityFilter(cat.analysis ?? {}, cat.number ?? 0, listFilter)
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
  const availableWidth = Math.max(0, windowWidth - horizontalPad * 2);
  const cardWidth = Math.max(
    140,
    Math.floor((availableWidth - cardGap * (COLUMNS - 1)) / COLUMNS),
  );
  const listBottom = Math.max(insets.bottom, spacing[16]) + spacing[24];

  const toggleFavorite = (catId: string) => {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  if (!hydrated) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <PageLoading label="Chargement du CatDex…" />
      </View>
    );
  }

  const empty = (() => {
    if (cats.length === 0) {
      return (
        <EmptyState
          layout="page"
          icon="cat"
          title="Ton CatDex est vide"
          description="Pars explorer ton quartier et capture ton premier chat !"
          actionLabel="Découvrir la carte"
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
          description="Ajoute des chats à tes favoris en appuyant sur le cœur sur leur carte."
          actionLabel="Découvrir des chats"
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
          <Text variant="bodySmall" weight="semibold" color="brand">
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
                      variant="bodySmall" weight="semibold"
                      color={selected ? 'onAccent' : 'textBrand'}
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

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: horizontalPad,
          paddingTop: spacing[16],
          paddingBottom: listBottom,
          flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          empty
        ) : (
          <View style={styles.grid}>
            {filtered.map((item) => (
              <View key={item.id} style={{ width: cardWidth, marginBottom: cardGap }}>
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
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
