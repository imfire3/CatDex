import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { CatDexCard } from '@/components/CatDexCard';
import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { SearchInput } from '@/components/Input';
import { ProgressBar, SectionHeader } from '@/components/Progress';
import { Text } from '@/components/Text';
import { CATDEX_TARGET } from '@/lib/constants';
import { useCatsStore } from '@/store/cats';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

export default function CatDexScreen() {
  const { colors, fonts, spacing, radius, shadow, gradients } = useTheme();
  const insets = useSafeAreaInsets();
  const cats = useCatsStore((state) => state.cats);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return cats.filter((cat) => {
      if (!search.trim()) return true;
      return cat.name.toLowerCase().includes(search.toLowerCase());
    });
  }, [cats, search]);

  const progress = Math.min(1, cats.length / CATDEX_TARGET);

  const keyExtractor = useCallback((item: Cat) => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: Cat }) => (
      <CatDexCard cat={item} onPress={() => router.push(`/cat/${item.id}`)} />
    ),
    [],
  );

  const listEmpty = useMemo(
    () => (
      <EmptyState
        title="Collection vide"
        description="Scanne ton premier chat pour commencer ton CatDex."
        actionLabel="Scanner"
        onAction={() => router.push('/scanner')}
      />
    ),
    [],
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={{ paddingHorizontal: spacing[24], paddingTop: spacing[24], gap: spacing[16] }}>
        <View style={[styles.headerRow, { gap: spacing[16] }]}>
          <View style={{ gap: spacing[4] }}>
            <Text variant="h1" color="textBrand">
              CatDex
            </Text>
            <Text variant="bodySmall" color="textSecondary">
              Ta collection de chats
            </Text>
          </View>
          <View
            style={[
              {
                paddingHorizontal: spacing[16],
                paddingVertical: spacing[8],
                borderRadius: radius.full,
                backgroundColor: colors.accentSoft,
                borderWidth: 1,
                borderColor: colors.border,
              },
            ]}
          >
            <Text variant="caption" color="accent" style={{ fontFamily: fonts.bodySemi }}>
              {cats.length} / {CATDEX_TARGET}
            </Text>
          </View>
        </View>

        <View
          style={[
            {
              borderRadius: radius.xl,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing[16],
              gap: spacing[8],
            },
            shadow.small,
          ]}
        >
          <LinearGradient
            colors={[gradients.primarySoft[0], 'transparent']}
            style={StyleSheet.absoluteFill}
          />
          <Text variant="label" color="textSecondary">
            Progression
          </Text>
          <Text variant="h3">{Math.round(progress * 100)}% complété</Text>
          <ProgressBar progress={progress} height={10} />
        </View>

        <SearchInput placeholder="Rechercher un chat…" value={search} onChangeText={setSearch} />

        <View style={{ flexDirection: 'row', gap: spacing[8] }}>
          <Chip label="Tous" selected />
          <Chip label="Récents" />
          <Chip label="Rares" />
        </View>

        <SectionHeader title="Collection" />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={{ gap: spacing[16] }}
        contentContainerStyle={{
          paddingHorizontal: spacing[24],
          paddingBottom: spacing[96] + spacing[24],
          gap: spacing[16],
        }}
        ListEmptyComponent={listEmpty}
        renderItem={renderItem}
        removeClippedSubviews
        initialNumToRender={8}
        windowSize={7}
        maxToRenderPerBatch={8}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
});
