import { router } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CatDexCard } from '@/components/CatDexCard';
import { CatDexEmpty } from '@/components/CatDexEmpty';
import { EmptyState } from '@/components/EmptyState';
import { PageLoading } from '@/components/Loader';
import { Text } from '@/components/Text';
import { MOBILE_WEB_WIDTH } from '@/layout/MobileWebFrame';
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
/** Matches MobileWebFrame desktop phone preview breakpoint. */
const DESKTOP_WEB_BREAKPOINT = 480;

export default function CatDexScreen() {
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const cats = useCatsStore((state) => state.cats);
  const hydrated = useCatsStore((state) => state.hydrated);
  const [listFilter, setListFilter] = useState<ListFilter>('all');
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());
  /** Width of the grid row (inside ScrollView padding). */
  const [gridWidth, setGridWidth] = useState(0);

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

      return true;
    });
  }, [cats, favorites, listFilter]);

  const cardGap = spacing[16];
  const horizontalPad = spacing[24];
  // Fallback when grid has not laid out yet (phone frame on wide web).
  const fallbackFrame =
    windowWidth >= DESKTOP_WEB_BREAKPOINT
      ? Math.min(windowWidth, MOBILE_WEB_WIDTH)
      : windowWidth;
  const rowWidth =
    gridWidth > 0
      ? gridWidth
      : Math.max(0, fallbackFrame - horizontalPad * 2);
  const cardWidth = Math.max(
    0,
    Math.floor((rowWidth - cardGap * (COLUMNS - 1)) / COLUMNS),
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
      return <CatDexEmpty onExplore={() => router.push('/(tabs)/map')} />;
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
          <View style={{ width: '100%', minWidth: 0 }}>
            <FilterChipsScroller>
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
                      flexShrink: 0,
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
            </FilterChipsScroller>
          </View>
        }
      />

      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{
          paddingHorizontal: horizontalPad,
          paddingTop: spacing[16],
          paddingBottom: listBottom,
          flexGrow: 1,
          backgroundColor: colors.background,
        }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          empty
        ) : (
          <View
            style={[styles.grid, { gap: cardGap }]}
            onLayout={(event) => {
              const next = event.nativeEvent.layout.width;
              if (next > 0 && next !== gridWidth) setGridWidth(next);
            }}
          >
            {filtered.map((item) => (
              <View
                key={item.id}
                style={{
                  width: cardWidth,
                  maxWidth: cardWidth,
                  // Web flex items default to min-width:auto and grow to the
                  // photo’s intrinsic size — that forces a single column.
                  minWidth: 0,
                  flexGrow: 0,
                  flexShrink: 0,
                  overflow: 'hidden',
                }}
              >
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

/** Horizontal chip row — native ScrollView grows with content on web, so use overflow-x there. */
function FilterChipsScroller({ children }: { children: ReactNode }) {
  const { spacing } = useTheme();

  if (Platform.OS === 'web') {
    return (
      <div
        role="navigation"
        aria-label="Filtres de rareté"
        style={{
          boxSizing: 'border-box',
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorX: 'contain',
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'nowrap',
          alignItems: 'center',
          gap: spacing[8],
          paddingRight: spacing[16],
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <ScrollView
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[8],
        paddingRight: spacing[16],
      }}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
});
