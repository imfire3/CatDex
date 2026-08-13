/**
 * Collection tile — photo, favorite, rarity badge.
 * Opens the full cat fiche on press.
 */
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
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
import { enrichAnalysis, genderSymbol } from '@/lib/catTraits';
import { isCatPhotoRef } from '@/lib/photoStorage';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

type Props = {
  cat: Cat;
  onPress: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
};

export function CatDexCard({ cat, onPress, isFavorite = false, onToggleFavorite }: Props) {
  const { colors, spacing, radius, shadow, iconStroke, motion } = useTheme();
  const analysis = enrichAnalysis(cat.analysis, cat.number);
  const theme = themeFromColorLabel(analysis.color, cat.number);
  const [photoFailed, setPhotoFailed] = useState(false);

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
  const gender = genderSymbol(analysis.gender);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Voir la fiche de ${cat.name}`}
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: '100%',
          borderRadius: radius.cta,
          backgroundColor: colors.surfaceElevated,
          overflow: 'hidden',
          cursor: 'pointer',
          transform: [{ scale: pressed ? motion.cardPressScale : 1 }],
        },
        shadow.low,
      ]}
    >
      <View
        style={{
          aspectRatio: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.surfaceSecondary,
          overflow: 'hidden' }}
      >
        {canShowPhoto ? (
          <CatImage
            uri={cat.photoUri}
            style={styles.photo}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
            onError={() => setPhotoFailed(true)}
          />
        ) : (
          <CatSprite colorLabel={analysis.color} seed={cat.number} size={80} />
        )}

        {onToggleFavorite ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            hitSlop={8}
            onPress={(event) => {
              // Prevent opening the fiche when tapping the heart (web + native).
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
              backgroundColor: colors.surfaceElevated,
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

      <View style={{ padding: spacing[8], gap: spacing[4] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[8] }}>
          <Text
            variant="bodySmall" weight="semibold"
            color="text"
            numberOfLines={1}
            style={{ flex: 1 }}
          >
            {cat.name}
          </Text>
          <View
            style={{
              width: spacing[16],
              height: spacing[16],
              borderRadius: radius.full,
              backgroundColor: theme.soft,
              alignItems: 'center',
              justifyContent: 'center' }}
          >
            {gender ? (
              <Text variant="caption" style={{ color: colors.mapPlayer }}>
                {gender}
              </Text>
            ) : (
              <View
                style={{
                  width: spacing[8],
                  height: spacing[8],
                  borderRadius: radius.full,
                  backgroundColor: theme.hex }}
              />
            )}
          </View>
        </View>
        <Text variant="caption" weight="semibold" style={{ color: rarity.foreground }}>
          {catDexRarityLabel(rarityId)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  photo: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
});
