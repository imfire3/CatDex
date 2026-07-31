import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { CatDexCard } from '@/components/CatDexCard';
import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { SearchInput } from '@/components/Input';
import { ProgressBar } from '@/components/Progress';
import { Text } from '@/components/Text';
import { CATDEX_TARGET } from '@/lib/constants';
import { rarityFromCat } from '@/lib/catTheme';
import { useCatsStore } from '@/store/cats';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

export default function CatDexScreen() {
  const { colors, fonts, spacing, radius, shadow, iconStroke } = useTheme();
  const insets = useSafeAreaInsets();
  const cats = useCatsStore((state) => state.cats);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'recent' | 'rare'>('all');

  const filtered = useMemo(() => {
    let list = cats;
    if (search.trim()) {
      list = list.filter((cat) => cat.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (filter === 'recent') {
      list = [...list].sort(
        (a, b) => new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime(),
      );
    }
    if (filter === 'rare') {
      list = list.filter((cat) => {
        const id = rarityFromCat(cat.analysis.color, cat.analysis.coat, cat.number);
        return id === 'rare' || id === 'legendary';
      });
    }
    return list;
  }, [cats, search, filter]);

  const progress = Math.min(1, cats.length / CATDEX_TARGET);

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={{ paddingHorizontal: spacing[24], paddingTop: spacing[24], gap: spacing[24] }}>
        <View style={[styles.headerRow, { gap: spacing[16] }]}>
          <View
            style={{
              width: spacing[48],
              height: spacing[48],
              borderRadius: radius.full,
              backgroundColor: colors.accentSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
              <Circle cx="8" cy="7" r="2" fill={colors.brand} />
              <Circle cx="16" cy="7" r="2" fill={colors.brand} />
              <Circle cx="6" cy="13" r="2" fill={colors.brand} />
              <Circle cx="18" cy="13" r="2" fill={colors.brand} />
              <Path
                d="M12 20c3.5 0 6-2.2 6-5.2S14.5 11 12 11s-6 1.6-6 3.8S8.5 20 12 20Z"
                fill={colors.brand}
              />
            </Svg>
          </View>
          <View style={{ flex: 1, gap: spacing[4] }}>
            <Text variant="h1" color="textBrand">
              CatDex
            </Text>
            <Text variant="body" color="textSecondary">
              Ta collection de chats
            </Text>
          </View>
        </View>

        <View
          style={[
            {
              backgroundColor: colors.surface,
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing[24],
              gap: spacing[16],
            },
            shadow.low,
          ]}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Text variant="title" color="textBrand">
              Progression
            </Text>
            <Text variant="caption" color="accent" style={{ fontFamily: fonts.bodySemi }}>
              {cats.length} / {CATDEX_TARGET}
            </Text>
          </View>
          <Text variant="h2" color="text">
            {Math.round(progress * 100)}%
          </Text>
          <ProgressBar progress={progress} height={8} />
          <Text variant="caption" color="textSecondary">
            {cats.length === 0
              ? 'Scanne ton premier chat pour ouvrir le CatDex.'
              : `${Math.max(0, CATDEX_TARGET - cats.length)} restants pour compléter la collection.`}
          </Text>
        </View>

        <SearchInput placeholder="Rechercher un chat…" value={search} onChangeText={setSearch} />

        <View style={{ flexDirection: 'row', gap: spacing[8], flexWrap: 'wrap' }}>
          <Chip label="Tous" selected={filter === 'all'} onPress={() => setFilter('all')} />
          <Chip
            label="Récents"
            selected={filter === 'recent'}
            onPress={() => setFilter('recent')}
          />
          <Chip label="Rares" selected={filter === 'rare'} onPress={() => setFilter('rare')} />
        </View>

        <Text variant="title" color="textBrand">
          Collection
        </Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item: Cat) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: spacing[16] }}
        contentContainerStyle={{
          paddingHorizontal: spacing[24],
          paddingTop: spacing[16],
          paddingBottom: spacing[96] + spacing[24],
          gap: spacing[16],
          flexGrow: 1,
        }}
        ListEmptyComponent={
          <EmptyState
            illustration={
              <View
                style={{
                  width: spacing[80],
                  height: spacing[80],
                  borderRadius: radius.full,
                  backgroundColor: colors.accentSoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 20c3.5 0 6-2.2 6-5.2S14.5 11 12 11s-6 1.6-6 3.8S8.5 20 12 20Z"
                    stroke={colors.brand}
                    strokeWidth={iconStroke.regular}
                    fill={colors.brandSoft}
                  />
                  <Circle cx="8" cy="7" r="1.5" fill={colors.accent} />
                  <Circle cx="16" cy="7" r="1.5" fill={colors.accent} />
                  <Circle cx="6" cy="13" r="1.5" fill={colors.accent} />
                  <Circle cx="18" cy="13" r="1.5" fill={colors.accent} />
                </Svg>
              </View>
            }
            title="Aucun chat encore"
            description="Pars explorer le quartier et capture ton premier compagnon."
            actionLabel="Scanner un chat"
            onAction={() => router.push('/scanner')}
          />
        }
        renderItem={({ item }) => (
          <View style={{ flex: 1 }}>
            <CatDexCard cat={item} onPress={() => router.push(`/cat/${item.id}`)} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
