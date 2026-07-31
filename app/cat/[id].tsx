import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { StatCard } from '@/components/Card/StatCard';
import { CatSprite } from '@/components/CatSprite';
import { Text } from '@/components/Text';
import { formatCaptureTime, formatDexNumber } from '@/lib/constants';
import { themeFromColorLabel, themeSoft } from '@/lib/catTheme';
import { enrichAnalysis, genderSymbol } from '@/lib/catTraits';
import { useCatsStore } from '@/store/cats';
import { useTheme } from '@/theme/ThemeProvider';

export default function CatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, fonts, spacing, radius, shadow, iconStroke, iconSize, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const cat = useCatsStore((state) => state.cats.find((item) => item.id === id));
  const incrementViews = useCatsStore((state) => state.incrementViews);
  const [favorited, setFavorited] = useState(false);

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

  const analysis = enrichAnalysis(cat.analysis, cat.number);
  const theme = themeFromColorLabel(analysis.color, cat.number);
  const locationLabel = 'Rue de Belleville, Paris 20e';
  const dateLabel = formatCaptureTime(cat.discoveredAt);
  const symbol = genderSymbol(analysis.gender);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing[96] }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero — soft tint + centered sprite (mock) */}
        <View
          style={{
            height: 320,
            backgroundColor: themeSoft(theme, scheme),
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LinearGradient
            colors={[themeSoft(theme, scheme), colors.brandSoft, colors.background]}
            style={StyleSheet.absoluteFill}
          />
          <CatSprite colorLabel={analysis.color} seed={cat.number} size={220} />

          <View
            style={{
              position: 'absolute',
              top: insets.top + spacing[8],
              left: spacing[16],
              right: spacing[16],
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Retour"
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.iconBtn,
                {
                  width: spacing[48],
                  height: spacing[48],
                  borderRadius: radius.full,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: pressed ? 0.85 : 1,
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

            <View style={{ flexDirection: 'row', gap: spacing[8] }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                onPress={() => setFavorited((v) => !v)}
                style={({ pressed }) => [
                  styles.iconBtn,
                  {
                    width: spacing[48],
                    height: spacing[48],
                    borderRadius: radius.full,
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    opacity: pressed ? 0.85 : 1,
                  },
                  shadow.low,
                ]}
              >
                <Svg width={iconSize.md} height={iconSize.md} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"
                    stroke={favorited ? colors.danger : colors.brand}
                    fill={favorited ? colors.danger : 'none'}
                    strokeWidth={iconStroke.regular}
                    strokeLinejoin="round"
                  />
                </Svg>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Plus d’options"
                onPress={() => undefined}
                style={({ pressed }) => [
                  styles.iconBtn,
                  {
                    width: spacing[48],
                    height: spacing[48],
                    borderRadius: radius.full,
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    opacity: pressed ? 0.85 : 1,
                  },
                  shadow.low,
                ]}
              >
                <Svg width={iconSize.md} height={iconSize.md} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM19 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                    fill={colors.brand}
                  />
                </Svg>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: spacing[24], gap: spacing[24], marginTop: spacing[8] }}>
          {/* Identity */}
          <View style={{ gap: spacing[8] }}>
            <Badge
              label={formatDexNumber(cat.number)}
              variant="accent"
              color={colors.brand}
              backgroundColor={colors.brandSoft}
            />
            <Text
              variant="h1"
              color="textBrand"
              style={{ fontFamily: fonts.display, textTransform: 'uppercase' }}
            >
              {cat.name}
              {symbol ? ` ${symbol}` : ''}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[8] }}>
              {(analysis.tags ?? []).map((tag, index) => (
                <Badge
                  key={tag}
                  label={tag}
                  color={index === 0 ? colors.textInverse : colors.brand}
                  backgroundColor={index === 0 ? colors.brand : colors.brandSoft}
                />
              ))}
            </View>
          </View>

          {/* Location + description card */}
          <View
            style={[
              {
                backgroundColor: colors.surface,
                borderRadius: radius.lg,
                borderWidth: 1,
                borderColor: colors.border,
                padding: spacing[24],
                gap: spacing[16],
              },
              shadow.low,
            ]}
          >
            <View style={{ flexDirection: 'row', gap: spacing[8], alignItems: 'flex-start' }}>
              <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z"
                  stroke={colors.accent}
                  strokeWidth={iconStroke.regular}
                  strokeLinejoin="round"
                />
              </Svg>
              <View style={{ flex: 1, gap: spacing[4] }}>
                <Text variant="bodySmall" color="textBrand" style={{ fontFamily: fonts.bodySemi }}>
                  {locationLabel}
                </Text>
                <Text variant="caption" color="textMuted">
                  {dateLabel}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: spacing[8], alignItems: 'flex-start' }}>
              <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 18c3.5 0 6-2 6-5.5S15 7 12 7 6 9.5 6 12.5 8.5 18 12 18Z"
                  stroke={colors.brand}
                  strokeWidth={iconStroke.regular}
                />
              </Svg>
              <Text variant="body" color="textBody" style={{ flex: 1 }}>
                {analysis.description}
              </Text>
            </View>
          </View>

          {/* Caractéristiques — Couleur · Pelage · Yeux · Taille */}
          <View style={{ gap: spacing[16] }}>
            <Text variant="h3" color="textBrand">
              Caractéristiques
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[16] }}>
              <StatCard
                label="Couleur"
                value={analysis.color}
                icon={
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M12 18c3.5 0 6-2 6-5.5S15 7 12 7 6 9.5 6 12.5 8.5 18 12 18Z"
                      stroke={colors.brand}
                      strokeWidth={1.6}
                    />
                  </Svg>
                }
              />
              <StatCard
                label="Pelage"
                value={analysis.coat}
                icon={
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M12 3l1.2 3.6L17 8l-3.8 1.4L12 13l-1.2-3.6L7 8l3.8-1.4L12 3Z"
                      fill={colors.accent}
                    />
                  </Svg>
                }
              />
              <StatCard
                label="Yeux"
                value={analysis.eyes ?? '—'}
                icon={
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
                      stroke={colors.brand}
                      strokeWidth={1.6}
                    />
                    <Circle cx="12" cy="12" r="2.5" fill={colors.accent} />
                  </Svg>
                }
              />
              <StatCard
                label="Taille"
                value={analysis.size ?? '—'}
                icon={
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M8 4v16M16 4v16M8 12h8"
                      stroke={colors.brand}
                      strokeWidth={1.6}
                      strokeLinecap="round"
                    />
                  </Svg>
                }
              />
            </View>
          </View>
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
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <Button
          title="Ajouter à ma collection"
          onPress={() => router.push('/(tabs)/catdex')}
          icon={
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Rect
                x="4"
                y="7"
                width="16"
                height="13"
                rx="2"
                stroke={colors.onAccent}
                strokeWidth={1.8}
              />
              <Path
                d="M8 7V6a4 4 0 0 1 8 0v1"
                stroke={colors.onAccent}
                strokeWidth={1.8}
                strokeLinecap="round"
              />
            </Svg>
          }
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
  iconBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
