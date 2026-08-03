import type { ReactNode } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { CatSprite } from '@/components/CatSprite';
import { Text } from '@/components/Text';
import { formatDexNumber } from '@/lib/constants';
import { themeFromColorLabel, themeSoft } from '@/lib/catTheme';
import { enrichAnalysis, genderSymbol } from '@/lib/catTraits';
import { useTheme } from '@/theme/ThemeProvider';
import type { CatAnalysis } from '@/types/cat';

export type CatCardDetailProps = {
  name: string;
  number: number;
  photoUri?: string | null;
  analysis: CatAnalysis;
  discoveredAt: string;
  locationLabel?: string;
  favorited?: boolean;
  onToggleFavorite?: () => void;
  onBack: () => void;
  onPrimaryAction: () => void;
  primaryLabel?: string;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
};

function formatDetailDate(iso: string) {
  const date = new Date(iso);
  const raw = date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function CircleIconButton({
  label,
  onPress,
  children,
}: {
  label: string;
  onPress: () => void;
  children: ReactNode;
}) {
  const { colors, spacing, radius, shadow, motion } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconBtn,
        {
          width: spacing[40],
          height: spacing[40],
          borderRadius: radius.full,
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.88 : 1,
          transform: [{ scale: pressed ? motion.pressScale : 1 }],
        },
        shadow.low,
      ]}
    >
      {children}
    </Pressable>
  );
}

function TraitTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  const { colors, fonts, spacing, radius } = useTheme();
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`${label}: ${value}`}
      style={{
        flex: 1,
        minWidth: '40%',
        padding: spacing[16],
        borderRadius: radius.lg,
        backgroundColor: colors.surfaceSecondary,
        gap: spacing[8],
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[8] }}>
        {icon}
        <Text variant="caption" color="textMuted">
          {label}
        </Text>
      </View>
      <Text variant="body" color="text" style={{ fontFamily: fonts.bodySemi }} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

/**
 * CatDex discovery / detail card — hero, tags, info block, traits, sticky CTA.
 */
export function CatCardDetail({
  name,
  number,
  photoUri,
  analysis: rawAnalysis,
  discoveredAt,
  locationLabel = 'Rue de Belleville, Paris 20e',
  favorited = false,
  onToggleFavorite,
  onBack,
  onPrimaryAction,
  primaryLabel = 'Ajouter à ma collection',
  secondaryLabel,
  onSecondaryAction,
}: CatCardDetailProps) {
  const { colors, fonts, spacing, radius, shadow, iconStroke, iconSize, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const analysis = enrichAnalysis(rawAnalysis, number);
  const theme = themeFromColorLabel(analysis.color, number);
  const soft = themeSoft(theme, scheme);
  const symbol = genderSymbol(analysis.gender);
  const tags = (analysis.tags ?? []).slice(0, 2);
  const dateLabel = formatDetailDate(discoveredAt);
  const showPhoto = Boolean(photoUri) && !photoUri!.startsWith('demo');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom:
            insets.bottom +
            spacing[96] +
            (secondaryLabel ? spacing[56] : 0),
        }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[soft, colors.brandSoft, colors.background]}
          locations={[0, 0.55, 1]}
          style={{
            paddingTop: insets.top + spacing[8],
            paddingHorizontal: spacing[24],
            paddingBottom: spacing[24],
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: spacing[16],
            }}
          >
            <CircleIconButton label="Retour" onPress={onBack}>
              <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M15 18 9 12l6-6"
                  stroke={colors.textSecondary}
                  strokeWidth={iconStroke.regular}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </CircleIconButton>

            <View style={{ flexDirection: 'row', gap: spacing[8] }}>
              <CircleIconButton
                label={favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                onPress={() => onToggleFavorite?.()}
              >
                <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"
                    stroke={favorited ? colors.danger : colors.textSecondary}
                    fill={favorited ? colors.danger : 'none'}
                    strokeWidth={iconStroke.regular}
                    strokeLinejoin="round"
                  />
                </Svg>
              </CircleIconButton>

              <CircleIconButton label="Plus d’actions" onPress={() => undefined}>
                <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
                  <Circle cx="6" cy="12" r="1.6" fill={colors.textSecondary} />
                  <Circle cx="12" cy="12" r="1.6" fill={colors.textSecondary} />
                  <Circle cx="18" cy="12" r="1.6" fill={colors.textSecondary} />
                </Svg>
              </CircleIconButton>
            </View>
          </View>

          <View style={{ alignItems: 'center', gap: spacing[16] }}>
            <View
              style={{
                width: '100%',
                height: spacing[96] * 2 + spacing[32],
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {showPhoto ? (
                <Image
                  source={{ uri: photoUri! }}
                  resizeMode="contain"
                  style={{ width: '100%', height: '100%' }}
                  accessibilityLabel={`Photo de ${name}`}
                />
              ) : (
                <CatSprite colorLabel={analysis.color} seed={number} size={220} />
              )}
            </View>

            <Badge
              label={formatDexNumber(number)}
              color={colors.onBrand}
              backgroundColor={colors.brand}
            />
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: spacing[24], gap: spacing[24] }}>
          <View style={{ gap: spacing[16] }}>
            <Text variant="h1" color="text" style={{ fontFamily: fonts.display }}>
              {name.toUpperCase()}
              {symbol ? ` ${symbol}` : ''}
            </Text>

            {tags.length > 0 ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[8] }}>
                {tags.map((tag, index) => (
                  <Badge
                    key={`${tag}-${index}`}
                    label={tag}
                    color={colors.onBrand}
                    backgroundColor={index === 0 ? colors.text : colors.brand}
                  />
                ))}
              </View>
            ) : null}
          </View>

          <View
            style={[
              {
                backgroundColor: colors.surface,
                borderRadius: radius.lg,
                borderWidth: 1,
                borderColor: colors.border,
                padding: spacing[16],
                gap: spacing[16],
              },
              shadow.low,
            ]}
          >
            <View style={{ flexDirection: 'row', gap: spacing[16], alignItems: 'flex-start' }}>
              <View
                style={{
                  width: spacing[32],
                  height: spacing[32],
                  borderRadius: radius.full,
                  backgroundColor: colors.surfaceSecondary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z"
                    stroke={colors.textSecondary}
                    strokeWidth={iconStroke.regular}
                    strokeLinejoin="round"
                  />
                  <Circle cx="12" cy="10" r="2.4" fill={colors.textSecondary} />
                </Svg>
              </View>
              <View style={{ flex: 1, gap: spacing[4] }}>
                <Text variant="body" color="text" style={{ fontFamily: fonts.bodySemi }}>
                  {locationLabel}
                </Text>
                <Text variant="caption" color="textMuted">
                  {dateLabel}
                </Text>
              </View>
            </View>

            <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />

            <View style={{ flexDirection: 'row', gap: spacing[16], alignItems: 'flex-start' }}>
              <View
                style={{
                  width: spacing[32],
                  height: spacing[32],
                  borderRadius: radius.full,
                  backgroundColor: colors.surfaceSecondary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v6A2.5 2.5 0 0 1 16.5 15H11l-4 4v-4H7.5A2.5 2.5 0 0 1 5 12.5v-6Z"
                    stroke={colors.textSecondary}
                    strokeWidth={iconStroke.regular}
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
              <Text variant="bodySmall" color="textBody" style={{ flex: 1 }}>
                {analysis.description}
              </Text>
            </View>
          </View>

          <View style={{ gap: spacing[16] }}>
            <Text variant="h3" color="text">
              Caractéristiques
            </Text>
            <View style={{ gap: spacing[8] }}>
              <View style={{ flexDirection: 'row', gap: spacing[8] }}>
                <TraitTile
                  label="Couleur"
                  value={analysis.color}
                  icon={
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M12 3 4 7v5c0 5 3.4 8.4 8 9 4.6-.6 8-4 8-9V7l-8-4Z"
                        stroke={colors.brand}
                        strokeWidth={iconStroke.regular}
                        strokeLinejoin="round"
                      />
                    </Svg>
                  }
                />
                <TraitTile
                  label="Yeux"
                  value={analysis.eyes ?? '—'}
                  icon={
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
                        stroke={colors.brand}
                        strokeWidth={iconStroke.regular}
                        strokeLinejoin="round"
                      />
                      <Circle cx="12" cy="12" r="2.5" fill={colors.brand} />
                    </Svg>
                  }
                />
              </View>
              <View style={{ flexDirection: 'row', gap: spacing[8] }}>
                <TraitTile
                  label="Pelage"
                  value={analysis.coat}
                  icon={
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M12 21c-2.5-1.5-6-5-6-9a6 6 0 1 1 12 0c0 4-3.5 7.5-6 9Z"
                        stroke={colors.brand}
                        strokeWidth={iconStroke.regular}
                        strokeLinejoin="round"
                      />
                      <Path
                        d="M9 10c.5-1 1.5-2 3-2s2.5 1 3 2"
                        stroke={colors.brand}
                        strokeWidth={iconStroke.regular}
                        strokeLinecap="round"
                      />
                    </Svg>
                  }
                />
                <TraitTile
                  label="Taille"
                  value={analysis.size ?? '—'}
                  icon={
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M4 20 20 4M8 20H4v-4M16 4h4v4"
                        stroke={colors.brand}
                        strokeWidth={iconStroke.regular}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  }
                />
              </View>
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
          gap: spacing[8],
        }}
      >
        <Button
          title={primaryLabel}
          onPress={onPrimaryAction}
          icon={
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Rect
                x="4"
                y="5"
                width="16"
                height="14"
                rx="2"
                stroke={colors.onAccent}
                strokeWidth={1.6}
              />
              <Path
                d="M12 9v6M9 12h6"
                stroke={colors.onAccent}
                strokeWidth={1.6}
                strokeLinecap="round"
              />
            </Svg>
          }
        />
        {secondaryLabel && onSecondaryAction ? (
          <Button title={secondaryLabel} variant="secondary" onPress={onSecondaryAction} />
        ) : null}
      </View>
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
