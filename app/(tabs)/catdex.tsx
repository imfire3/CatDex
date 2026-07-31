import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { CatDexCard } from '@/components/CatDexCard';
import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { SearchInput } from '@/components/Input';
import { Skeleton } from '@/components/Loader';
import { ProgressBar } from '@/components/Progress';
import { Text } from '@/components/Text';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { CATDEX_TARGET, formatDexNumber } from '@/lib/constants';
import { useCatsStore } from '@/store/cats';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

const MAX_VISIBLE_GHOSTS = 6;
/** Brief celebration on CatDex before returning to map exploration. */
const CELEBRATION_MS = 2200;

type SortId = 'all' | 'recent';

type GridItem =
  | { kind: 'cat'; key: string; cat: Cat }
  | { kind: 'ghost'; key: string; index: number };

export default function CatDexScreen() {
  const { colors, fonts, spacing, radius, motion } = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const params = useLocalSearchParams<{ justAdded?: string }>();
  const justAddedId = typeof params.justAdded === 'string' ? params.justAdded : undefined;
  const cats = useCatsStore((state) => state.cats);
  const hydrated = useCatsStore((state) => state.hydrated);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortId>('all');
  const justAddedCat = useMemo(
    () => (justAddedId ? cats.find((cat) => cat.id === justAddedId) : undefined),
    [cats, justAddedId],
  );
  const celebrating = Boolean(justAddedCat);
  const activeSort: SortId = celebrating ? 'all' : sort;
  const activeSearch = celebrating ? '' : search;

  useEffect(() => {
    if (!justAddedCat) return;

    const timer = setTimeout(() => {
      router.replace('/(tabs)/map');
    }, reduceMotion ? 900 : CELEBRATION_MS);

    return () => clearTimeout(timer);
  }, [justAddedCat, reduceMotion]);

  const dismissCelebration = () => {
    router.replace('/(tabs)/map');
  };

  const filtered = useMemo(() => {
    const q = activeSearch.trim().toLowerCase();
    let list = cats.filter((cat) => {
      if (!q) return true;
      const haystack = [
        cat.name,
        cat.analysis.breed,
        cat.analysis.color,
        cat.analysis.coat,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });

    if (activeSort === 'recent') {
      list = [...list].sort(
        (a, b) => new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime(),
      );
    }

    return list;
  }, [activeSearch, activeSort, cats]);

  const gridItems = useMemo((): GridItem[] => {
    const items: GridItem[] = filtered.map((cat) => ({
      kind: 'cat',
      key: cat.id,
      cat,
    }));

    const showGhosts = !activeSearch.trim() && activeSort === 'all' && cats.length > 0;
    if (showGhosts) {
      const remainingCount = Math.max(0, CATDEX_TARGET - cats.length);
      const ghostCount = Math.min(remainingCount, MAX_VISIBLE_GHOSTS);
      for (let i = 0; i < ghostCount; i += 1) {
        items.push({ kind: 'ghost', key: `ghost-${i}`, index: cats.length + i + 1 });
      }
    }

    return items;
  }, [activeSearch, activeSort, cats.length, filtered]);

  const progress = Math.min(1, cats.length / CATDEX_TARGET);
  const remaining = Math.max(0, CATDEX_TARGET - cats.length);
  const isEmpty = cats.length === 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View
        style={{
          paddingHorizontal: spacing[24],
          paddingTop: spacing[16],
          paddingBottom: spacing[8],
          gap: spacing[8],
        }}
      >
        <View style={styles.headerRow}>
          <View style={{ flex: 1, gap: spacing[4] }}>
            <Text variant="h2">CatDex</Text>
            <Text variant="caption" color="textSecondary">
              {cats.length} / {CATDEX_TARGET} chats collectés
              {remaining > 0 && cats.length > 0
                ? ` · Plus que ${remaining}`
                : ''}
            </Text>
          </View>
          <View
            style={{
              paddingHorizontal: spacing[16],
              paddingVertical: spacing[8],
              borderRadius: radius.full,
              backgroundColor: colors.accentSoft,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text variant="caption" color="accent" style={{ fontFamily: fonts.bodySemi }}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
        </View>

        <ProgressBar progress={progress} height={8} />

        {celebrating && justAddedCat ? (
          <View
            style={{
              padding: spacing[16],
              borderRadius: radius.xl,
              backgroundColor: colors.accentSoft,
              borderWidth: 1,
              borderColor: colors.border,
              gap: spacing[8],
            }}
          >
            <Text variant="label" color="accent">
              Nouvelle carte
            </Text>
            <Text variant="h3">
              {formatDexNumber(justAddedCat.number)} · {justAddedCat.name}
            </Text>
            <Text variant="bodySmall" color="textSecondary">
              {remaining > 0
                ? `Plus que ${remaining} chat${remaining > 1 ? 's' : ''} pour compléter ton CatDex.`
                : 'CatDex complet — légende du quartier.'}
            </Text>
            <Button
              title="Continuer l’exploration"
              variant="secondary"
              onPress={dismissCelebration}
            />
          </View>
        ) : null}

        {!isEmpty && !celebrating ? (
          <>
            <SearchInput
              placeholder="Rechercher un chat…"
              value={search}
              onChangeText={setSearch}
            />
            <View style={{ flexDirection: 'row', gap: spacing[8] }}>
              <Chip label="Tous" selected={sort === 'all'} onPress={() => setSort('all')} />
              <Chip
                label="Récents"
                selected={sort === 'recent'}
                onPress={() => setSort('recent')}
              />
            </View>
          </>
        ) : null}
      </View>

      {!hydrated ? (
        <View
          style={{
            flex: 1,
            paddingHorizontal: spacing[24],
            paddingTop: spacing[8],
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing[16],
          }}
        >
          {[0, 1, 2, 3].map((slot) => (
            <View key={slot} style={{ width: '47%', gap: spacing[8] }}>
              <Skeleton height={spacing[96] * 2} style={{ borderRadius: radius.xl }} />
              <Skeleton height={spacing[16]} width="70%" />
              <Skeleton height={spacing[8]} width="50%" />
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={isEmpty ? [] : gridItems}
          keyExtractor={(item) => item.key}
          numColumns={2}
          columnWrapperStyle={{ gap: spacing[16] }}
          contentContainerStyle={{
            paddingHorizontal: spacing[24],
            paddingTop: spacing[8],
            paddingBottom: spacing[96] + spacing[24],
            gap: spacing[16],
            flexGrow: 1,
          }}
          ListEmptyComponent={
            <EmptyState
              title="Ton CatDex est vide"
              description="Pars découvrir ton premier chat."
              actionLabel="Scanner un chat"
              onAction={() => router.push('/scanner')}
            />
          }
          renderItem={({ item, index }) => {
            const entering = reduceMotion
              ? undefined
              : FadeInDown.delay(Math.min(index, 8) * 40).duration(motion.duration.normal);

            if (item.kind === 'ghost') {
              return (
                <Animated.View entering={entering} style={{ flex: 1 }}>
                  <GhostSlot index={item.index} />
                </Animated.View>
              );
            }

            const isNew = item.cat.id === justAddedId;

            return (
              <Animated.View entering={entering} style={{ flex: 1 }}>
                {isNew && celebrating ? (
                  <FillInCard
                    cat={item.cat}
                    reduceMotion={reduceMotion}
                    onPress={() => router.push(`/cat/${item.cat.id}`)}
                  />
                ) : (
                  <CatDexCard
                    cat={item.cat}
                    onPress={() => router.push(`/cat/${item.cat.id}`)}
                  />
                )}
              </Animated.View>
            );
          }}
        />
      )}
    </View>
  );
}

function FillInCard({
  cat,
  reduceMotion,
  onPress,
}: {
  cat: Cat;
  reduceMotion: boolean;
  onPress: () => void;
}) {
  const { motion } = useTheme();
  const scale = useSharedValue(reduceMotion ? 1 : 0.72);
  const opacity = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = withTiming(1, { duration: motion.duration.normal });
    scale.value = withSequence(
      withSpring(1.06, motion.easing.spring),
      withSpring(1, motion.easing.spring),
    );
  }, [motion.duration.normal, motion.easing.spring, opacity, reduceMotion, scale]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={style}>
      <CatDexCard cat={cat} onPress={onPress} />
    </Animated.View>
  );
}

function GhostSlot({ index }: { index: number }) {
  const { colors, spacing, radius } = useTheme();

  return (
    <Pressable
      disabled
      accessibilityRole="text"
      accessibilityLabel={`Emplacement CatDex verrouillé ${index}`}
      style={{
        flex: 1,
        minHeight: spacing[96] * 2,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.border,
        backgroundColor: colors.surfaceSecondary,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[8],
        padding: spacing[16],
        opacity: 0.7,
      }}
    >
      <Text variant="label" color="textSecondary">
        ???
      </Text>
      <Text variant="caption" color="placeholder" align="center">
        À découvrir
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
});
