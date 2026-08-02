import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

import { Badge } from '@/components/Badge';
import { CatSprite } from '@/components/CatSprite';
import { ProblemState } from '@/components/ProblemState';
import { Text } from '@/components/Text';
import { formatCaptureTime, formatDexNumber } from '@/lib/constants';
import { themeFromColorLabel, themeSoft } from '@/lib/catTheme';
import { enrichAnalysis, genderSymbol } from '@/lib/catTraits';
import { useCatsStore } from '@/store/cats';
import { useTheme } from '@/theme/ThemeProvider';

function StarRow({ filled }: { filled: number }) {
  const { colors, spacing } = useTheme();
  const count = Math.max(0, Math.min(5, filled));

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={`${count} étoiles sur 5`}
      style={{ flexDirection: 'row', gap: spacing[8], alignItems: 'center' }}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const isFilled = index < count;
        const tone = isFilled ? colors.brand : colors.brandSoft;
        return (
          <Svg key={index} width={18} height={18} viewBox="0 0 19 18" fill="none">
            <Path
              d="M8.61 1.41c.23-.52.35-.78.51-.86.14-.07.3-.07.44 0 .16.08.28.34.51.86l1.84 4.14c.07.15.1.23.16.29.05.05.1.09.17.12.07.03.15.04.32.06l4.5.47c.57.06.85.09.98.22.11.11.16.27.14.42-.03.18-.24.37-.66.75l-3.36 3.03c-.13.11-.19.17-.23.24-.03.06-.06.13-.06.2-.01.08.01.16.04.32l.94 4.43c.12.56.18.84.09 1-.07.14-.2.23-.36.26-.18.03-.42-.11-.92-.4L9.74 14.7c-.15-.08-.22-.13-.3-.14a.7.7 0 0 0-.2 0c-.08.01-.15.06-.3.14l-3.92 2.26c-.49.29-.74.43-.92.4-.15-.03-.28-.12-.36-.26-.08-.16-.02-.44.1-1l.94-4.43c.03-.16.05-.24.04-.32 0-.07-.02-.14-.06-.2-.04-.07-.1-.13-.23-.24L1.17 7.88c-.42-.38-.63-.57-.66-.75a.55.55 0 0 1 .14-.42c.13-.13.41-.16.98-.22l4.5-.47c.17-.02.25-.03.32-.06.07-.03.12-.07.17-.12.06-.06.09-.14.16-.29L8.61 1.41Z"
              fill={tone}
              stroke={tone}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      })}
    </View>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  const { colors, spacing, radius, shadow } = useTheme();
  return (
    <View
      style={[
        {
          width: '100%',
          padding: spacing[16],
          borderRadius: radius.cta,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.borderDefault,
          gap: spacing[4],
        },
        shadow.low,
      ]}
    >
      <Text variant="body" color="text">
        {title}
      </Text>
      <Text variant="bodySmall" color="textSecondary">
        {body}
      </Text>
    </View>
  );
}

function TraitStatCard({ label, value }: { label: string; value: string }) {
  const { colors, fonts, spacing, radius, shadow } = useTheme();
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`${label}: ${value}`}
      style={[
        {
          flex: 1,
          minWidth: '40%',
          padding: spacing[16],
          borderRadius: radius.cta,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.borderDefault,
          gap: spacing[4],
        },
        shadow.low,
      ]}
    >
      <Text variant="bodySmall" color="text">
        {label}
      </Text>
      <Text variant="body" color="textSecondary" style={{ fontFamily: fonts.bodySemi }} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function PillRow({
  items,
  tone = 'brand',
}: {
  items: string[];
  tone?: 'brand' | 'mixed';
}) {
  const { colors, spacing } = useTheme();
  if (items.length === 0) return null;

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[8] }}>
      {items.map((label, index) => {
        const useAccent = tone === 'mixed' && index % 2 === 1;
        return (
          <Badge
            key={`${label}-${index}`}
            label={label}
            color={useAccent ? colors.onAccent : colors.onBrand}
            backgroundColor={useAccent ? colors.accent : colors.brand}
          />
        );
      })}
    </View>
  );
}

function starScore(views: number, number: number) {
  if (views >= 20) return 5;
  if (views >= 10) return 4;
  if (views >= 3) return 3;
  if (views >= 1) return 2;
  return Math.max(1, (number % 3) + 1);
}

export default function CatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, fonts, spacing, radius, shadow, iconStroke, scheme, motion } = useTheme();
  const insets = useSafeAreaInsets();
  const cat = useCatsStore((state) => state.cats.find((item) => item.id === id));
  const incrementViews = useCatsStore((state) => state.incrementViews);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    if (!id) return;
    incrementViews(id);
  }, [id, incrementViews]);

  const analysis = useMemo(
    () => (cat ? enrichAnalysis(cat.analysis, cat.number) : null),
    [cat],
  );

  if (!cat || !analysis) {
    return (
      <ProblemState
        title="Oups"
        description="Il y a un problème — ce chat est introuvable."
        actionLabel="Retour"
        onAction={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/(tabs)/catdex');
        }}
      />
    );
  }

  const theme = themeFromColorLabel(analysis.color, cat.number);
  const soft = themeSoft(theme, scheme);
  const locationLabel = 'Rue de Belleville, Paris 20e';
  const dateLabel = formatCaptureTime(cat.discoveredAt);
  const symbol = genderSymbol(analysis.gender);
  const likesPct = 70 + ((cat.number * 17) % 29);
  const stars = starScore(cat.views, cat.number);
  const showPhoto = Boolean(cat.photoUri) && !cat.photoUri.startsWith('demo');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={[soft, colors.surfaceSecondary, colors.background]}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing[8],
          paddingHorizontal: spacing[24],
          paddingBottom: insets.bottom + spacing[32],
          gap: spacing[24],
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retour"
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.iconBtn,
              {
                width: spacing[40],
                height: spacing[40],
                borderRadius: radius[8],
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? motion.pressScale : 1 }],
              },
              shadow.low,
            ]}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M15 18 9 12l6-6"
                stroke={colors.brand}
                strokeWidth={iconStroke.regular}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>

          <StarRow filled={stars} />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            onPress={() => setFavorited((v) => !v)}
            style={({ pressed }) => [
              styles.iconBtn,
              {
                width: spacing[40],
                height: spacing[40],
                borderRadius: radius[8],
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? motion.pressScale : 1 }],
              },
              shadow.low,
            ]}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"
                stroke={favorited ? colors.danger : colors.brand}
                fill={favorited ? colors.danger : 'none'}
                strokeWidth={iconStroke.regular}
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>
        </View>

        <View style={{ alignItems: 'center', justifyContent: 'center', height: 200 }}>
          {showPhoto ? (
            <Image
              source={{ uri: cat.photoUri }}
              resizeMode="contain"
              style={{ width: '100%', height: 200 }}
              accessibilityLabel={`Photo de ${cat.name}`}
            />
          ) : (
            <CatSprite colorLabel={analysis.color} seed={cat.number} size={200} />
          )}
        </View>

        <View style={{ gap: spacing[8] }}>
          <Badge
            label={formatDexNumber(cat.number)}
            color={colors.onAccent}
            backgroundColor={colors.accent}
          />

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing[8] }}>
            <Text
              variant="h2"
              color="textBrand"
              style={{ fontFamily: fonts.display, textTransform: 'uppercase' }}
            >
              {cat.name}
            </Text>
            {symbol ? (
              <Text variant="bodySmall" color="textBrand" style={{ fontFamily: fonts.bodySemi }}>
                {symbol}
              </Text>
            ) : null}
            {analysis.gender && analysis.gender !== 'unknown' ? (
              <Text variant="bodySmall" color="accent" style={{ fontFamily: fonts.bodySemi }}>
                {analysis.gender === 'male' ? 'Mâle' : 'Femelle'}
              </Text>
            ) : null}
          </View>

          <PillRow items={[analysis.color, analysis.breed].filter(Boolean)} tone="mixed" />
        </View>

        <View style={{ gap: spacing[8] }}>
          <InfoCard title="Description" body={analysis.description} />
          <InfoCard title="Emplacement" body={`${locationLabel} · ${dateLabel}`} />
        </View>

        <View style={{ gap: spacing[16] }}>
          <Text variant="h3" color="textSecondary">
            Caractéristiques
          </Text>
          <View style={{ gap: spacing[8] }}>
            <View style={{ flexDirection: 'row', gap: spacing[8] }}>
              <TraitStatCard label="Couleur" value={analysis.color} />
              <TraitStatCard label="Yeux" value={analysis.eyes ?? '—'} />
            </View>
            <View style={{ flexDirection: 'row', gap: spacing[8] }}>
              <TraitStatCard label="Pelage" value={analysis.coat} />
              <TraitStatCard label="Taille" value={analysis.size ?? '—'} />
            </View>
          </View>
        </View>

        {(analysis.tags?.length ?? 0) > 0 ? (
          <View style={{ gap: spacing[16] }}>
            <Text variant="h3" color="textSecondary">
              Traits
            </Text>
            <PillRow items={analysis.tags ?? []} tone="brand" />
          </View>
        ) : null}

        <View style={{ gap: spacing[16] }}>
          <Text variant="h3" color="textSecondary">
            Stats
          </Text>
          <PillRow
            items={[`${likesPct}% de j’aime`, `Vu ${cat.views} fois`, 'Capturé']}
            tone="brand"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  iconBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
