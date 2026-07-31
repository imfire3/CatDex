import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { StatCard } from '@/components/Card/StatCard';
import { GlassIconButton } from '@/components/GlassIconButton';
import { Text } from '@/components/Text';
import { formatCaptureTime, formatDexNumber } from '@/lib/constants';
import { rarityFromCat, rarityTokens } from '@/lib/catTheme';
import { useCatsStore } from '@/store/cats';
import { useTheme } from '@/theme/ThemeProvider';

export default function CatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, fonts, spacing, radius, shadow, iconStroke, iconSize } = useTheme();
  const insets = useSafeAreaInsets();
  const cat = useCatsStore((state) => state.cats.find((item) => item.id === id));
  const incrementViews = useCatsStore((state) => state.incrementViews);
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    if (id) incrementViews(id);
  }, [id, incrementViews]);

  if (!cat) {
    return (
      <View style={[styles.missing, { backgroundColor: colors.background }]}>
        <Text variant="body" color="textSecondary">
          Chat introuvable
        </Text>
      </View>
    );
  }

  const rarity = rarityTokens[rarityFromCat(cat.analysis.color, cat.analysis.coat, cat.number)];
  const dexLabel = formatDexNumber(cat.number);
  const heroHeight = spacing[96] * 3 + spacing[64];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + spacing[96] + spacing[24],
        }}
      >
        <View style={{ height: heroHeight, backgroundColor: colors.surfaceSecondary }}>
          <Image source={{ uri: cat.photoUri }} style={StyleSheet.absoluteFill} />
          <LinearGradient
            colors={['transparent', colors.background]}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: spacing[96] + spacing[16],
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: insets.top + spacing[8],
              left: spacing[16],
              right: spacing[16],
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <GlassIconButton accessibilityLabel="Retour" onPress={() => router.back()}>
              <Svg width={iconSize.md} height={iconSize.md} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M15 18 9 12l6-6"
                  stroke={colors.brand}
                  strokeWidth={iconStroke.regular}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </GlassIconButton>
            <GlassIconButton
              accessibilityLabel={favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              onPress={() => setFavorite((v) => !v)}
            >
              <Svg width={iconSize.md} height={iconSize.md} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"
                  stroke={favorite ? colors.danger : colors.brand}
                  strokeWidth={iconStroke.regular}
                  strokeLinejoin="round"
                  fill={favorite ? colors.danger : 'none'}
                />
              </Svg>
            </GlassIconButton>
          </View>
        </View>

        <View
          style={{
            marginTop: -spacing[32],
            paddingHorizontal: spacing[24],
            gap: spacing[24],
          }}
        >
          <View style={{ gap: spacing[16] }}>
            <View
              style={{
                alignSelf: 'flex-start',
                paddingHorizontal: spacing[16],
                paddingVertical: spacing[8],
                borderRadius: radius.pill,
                backgroundColor: colors.brandSoft,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text variant="caption" color="textBrand" style={{ fontFamily: fonts.bodySemi }}>
                {dexLabel}
              </Text>
            </View>

            <Text variant="h1" color="textBrand">
              {cat.name}
            </Text>

            <Badge
              label={rarity.label}
              color={rarity.foreground}
              backgroundColor={rarity.background}
            />

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[8] }}>
              <Chip label={cat.analysis.coat || 'Pelage'} static />
              <Chip label={cat.analysis.color || 'Couleur'} static />
            </View>

            <Text variant="body" color="textBody">
              {cat.analysis.description}
            </Text>
          </View>

          <View
            style={[
              {
                backgroundColor: colors.surface,
                borderRadius: radius.card,
                borderWidth: 1,
                borderColor: colors.border,
                padding: spacing[24],
                gap: spacing[8],
              },
              shadow.low,
            ]}
          >
            <Text variant="label" color="textSecondary">
              Découverte
            </Text>
            <Text variant="title" color="textBrand">
              Paris 20e
            </Text>
            <Text variant="bodySmall" color="textSecondary">
              {formatCaptureTime(cat.discoveredAt)}
            </Text>
          </View>

          <View style={{ gap: spacing[16] }}>
            <Text variant="title" color="textBrand">
              Caractéristiques
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[16] }}>
              <StatCard label="Couleur" value={cat.analysis.color} />
              <StatCard label="Race" value={cat.analysis.breed} />
              <StatCard label="Pelage" value={cat.analysis.coat} />
              <StatCard label="Vues" value={String(cat.views)} />
            </View>
          </View>

          {cat.notes ? (
            <View
              style={[
                {
                  backgroundColor: colors.surface,
                  borderRadius: radius.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: spacing[24],
                  gap: spacing[8],
                },
                shadow.low,
              ]}
            >
              <Text variant="label" color="textSecondary">
                Notes
              </Text>
              <Text variant="bodySmall" color="textBody">
                {cat.notes}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: spacing[24],
          paddingTop: spacing[16],
          paddingBottom: Math.max(insets.bottom, spacing[16]),
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <Button
          title="Voir sur la carte"
          onPress={() => router.push('/(tabs)/map')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
