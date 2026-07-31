import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

import { CatDexCard } from '@/components/CatDexCard';
import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { SearchInput } from '@/components/Input';
import { ProgressBar, SectionHeader } from '@/components/Progress';
import { Text } from '@/components/Text';
import { useCatsStore } from '@/store/cats';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

const TARGET = 50;

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

  const progress = Math.min(1, cats.length / TARGET);

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={{ paddingHorizontal: spacing[24], paddingTop: spacing[24], gap: spacing[16] }}>
        <View style={styles.headerRow}>
          <View style={{ gap: spacing[4], flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[8] }}>
              <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 18c3.5 0 6-2 6-5.5S15 7 12 7 6 9.5 6 12.5 8.5 18 12 18Z"
                  stroke={colors.brand}
                  strokeWidth={1.6}
                />
                <Path
                  d="M8.2 8.2c.4-1.6 1.4-2.6 2.3-2.6.7 0 1.1.6 1.5 1.4M15.8 8.2c-.4-1.6-1.4-2.6-2.3-2.6-.7 0-1.1.6-1.5 1.4"
                  stroke={colors.accent}
                  strokeWidth={1.6}
                  strokeLinecap="round"
                />
              </Svg>
              <Text variant="h1" color="textBrand">
                CatDex
              </Text>
              <Text variant="h3" color="textSecondary" style={{ fontFamily: fonts.body }}>
                — Sprites
              </Text>
            </View>
            <Text variant="bodySmall" color="textSecondary">
              Ta collection de sprites
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
              {cats.length} / {TARGET}
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
        keyExtractor={(item: Cat) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: spacing[16] }}
        contentContainerStyle={{
          paddingHorizontal: spacing[24],
          paddingBottom: spacing[96] + spacing[24],
          gap: spacing[16],
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
          <CatDexCard cat={item} onPress={() => router.push(`/cat/${item.id}`)} />
        )}
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
    gap: 16,
  },
});
