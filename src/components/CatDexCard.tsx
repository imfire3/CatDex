/**
 * Collection tile — Figma CatDex card (node 218:757).
 * Photo, rarity pill, name + XP, breed, coat swatches, collected.
 */
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { CatImage } from '@/components/CatImage';
import { CatSprite } from '@/components/CatSprite';
import { Text } from '@/components/Text';
import {
  catDexRarityLabel,
  rarityTokens,
  resolveRevealRarity,
  themeFromColorLabel,
} from '@/lib/catTheme';
import { enrichAnalysis } from '@/lib/catTraits';
import { isCatPhotoRef } from '@/lib/photoStorage';
import { xpForCat } from '@/lib/progression';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat, CatAnalysis } from '@/types/cat';

type Props = {
  cat: Cat;
  onPress: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
};

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

function coatSwatches(analysis: CatAnalysis, fallbackHex: string): string[] {
  const fromPalette = (analysis.colorPalette ?? [])
    .map((value) => value.trim())
    .filter((value) => HEX.test(value));
  if (fromPalette.length > 0) return fromPalette.slice(0, 2);

  const dots = [fallbackHex];
  const secondary = analysis.secondaryColors?.[0]?.trim();
  if (secondary) {
    const next = HEX.test(secondary)
      ? secondary
      : themeFromColorLabel(secondary).hex;
    if (next.toLowerCase() !== fallbackHex.toLowerCase()) dots.push(next);
  }
  return dots;
}

export function CatDexCard({ cat, onPress, isFavorite = false, onToggleFavorite }: Props) {
  const { colors, spacing, radius, shadow, iconStroke, motion } = useTheme();
  const analysis = enrichAnalysis(cat.analysis, cat.number);
  const theme = themeFromColorLabel(analysis.color, cat.number);
  const [photoFailed, setPhotoFailed] = useState(false);
  /** Locked square frame in px — avoids RN-web % / intrinsic-size fights. */
  const [framePx, setFramePx] = useState(0);

  useEffect(() => {
    setPhotoFailed(false);
  }, [cat.id, cat.photoUri]);

  // blob: URIs die after web reload — skip and show sprite until the cat is re-scanned.
  const canShowPhoto =
    Boolean(cat.photoUri) &&
    !photoFailed &&
    !cat.photoUri.startsWith('blob:') &&
    (isCatPhotoRef(cat.photoUri) ||
      cat.photoUri.startsWith('data:') ||
      cat.photoUri.startsWith('http') ||
      cat.photoUri.startsWith('file:'));
  const rarityId = resolveRevealRarity(analysis, cat.number);
  const rarity = rarityTokens[rarityId];
  const swatches = coatSwatches(analysis, theme.hex);
  const personality = analysis.tags?.[0]?.trim() ?? '';
  const breed = analysis.breed || '';
  const xp = xpForCat(cat);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Voir la fiche de ${cat.name}`}
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: '100%',
          borderRadius: radius.cta,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
          cursor: 'pointer',
          transform: [{ scale: pressed ? motion.cardPressScale : 1 }],
        },
        shadow.low,
      ]}
    >
      <View
        onLayout={(event) => {
          const next = Math.round(event.nativeEvent.layout.width);
          if (next > 0 && next !== framePx) setFramePx(next);
        }}
        style={{
          width: '100%',
          aspectRatio: 1,
          height: framePx > 0 ? framePx : undefined,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {canShowPhoto && framePx > 0 ? (
          <CatImage
            uri={cat.photoUri}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: framePx,
              height: framePx,
            }}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
            onError={() => setPhotoFailed(true)}
          />
        ) : canShowPhoto ? null : (
          <CatSprite colorLabel={analysis.color} seed={cat.number} size={80} />
        )}

        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: spacing[8],
            left: spacing[8],
            zIndex: 2,
            height: spacing[24],
            paddingHorizontal: spacing[8],
            borderRadius: radius.full,
            backgroundColor: colors.surfaceMuted,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing[4],
          }}
        >
          <View
            style={{
              width: spacing[8],
              height: spacing[8],
              borderRadius: radius.full,
              backgroundColor: rarity.foreground,
            }}
          />
          <Text variant="caption" weight="semibold" style={{ color: rarity.foreground }}>
            {catDexRarityLabel(rarityId)}
          </Text>
        </View>

        {onToggleFavorite ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            hitSlop={8}
            onPress={(event) => {
              event?.stopPropagation?.();
              onToggleFavorite();
            }}
            style={({ pressed }) => ({
              position: 'absolute',
              top: spacing[8],
              right: spacing[8],
              zIndex: 2,
              width: spacing[32],
              height: spacing[32],
              borderRadius: radius.full,
              backgroundColor: colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.88 : 1,
            })}
          >
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 20.5 4.5 12.8a5.5 5.5 0 0 1 7.8-7.8L12 4.5l-.3-.3a5.5 5.5 0 1 1 7.8 7.8L12 20.5Z"
                stroke={isFavorite ? colors.brand : colors.textMuted}
                fill={isFavorite ? colors.brand : 'none'}
                strokeWidth={iconStroke.regular}
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>
        ) : null}
      </View>

      <View
        style={{
          padding: spacing[16],
          gap: spacing[8],
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[8] }}>
          <Text
            variant="body"
            weight="semibold"
            color="text"
            numberOfLines={1}
            style={{ flex: 1 }}
          >
            {cat.name}
          </Text>
          <Text variant="caption" color="textSecondary">
            +{xp} XP
          </Text>
        </View>

        {breed ? (
          <Text variant="bodySmall" color="textSecondary" numberOfLines={1}>
            {breed}
          </Text>
        ) : null}

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[8] }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing[8],
              minWidth: 0,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[4] }}>
              {swatches.map((hex) => (
                <View
                  key={hex}
                  style={{
                    width: spacing[16],
                    height: spacing[16],
                    borderRadius: radius.full,
                    backgroundColor: hex,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                />
              ))}
            </View>
            {personality ? (
              <Text variant="caption" color="textSecondary" numberOfLines={1} style={{ flex: 1 }}>
                {personality}
              </Text>
            ) : null}
          </View>
          <Text variant="caption" weight="semibold" color="success">
            Collecté
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
