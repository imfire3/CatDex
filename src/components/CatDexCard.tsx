/**
 * Collection tile — photo, favorite, rarity badge.
 */
import { Image, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { CatSprite } from '@/components/CatSprite';
import { Text } from '@/components/Text';
import {
  catDexRarityLabel,
  rarityTokens,
  resolveRevealRarity,
  themeFromColorLabel,
} from '@/lib/catTheme';
import { genderSymbol } from '@/lib/catTraits';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

type Props = {
  cat: Cat;
  onPress: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
};

export function CatDexCard({ cat, onPress, isFavorite = false, onToggleFavorite }: Props) {
  const { colors, fonts, spacing, radius, shadow, iconStroke, motion } = useTheme();
  const theme = themeFromColorLabel(cat.analysis.color, cat.number);
  const hasPhoto = Boolean(cat.photoUri);
  const rarityId = resolveRevealRarity(cat.analysis, cat.number);
  const rarity = rarityTokens[rarityId];
  const gender = genderSymbol(cat.analysis.gender);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={cat.name}
      onPress={onPress}
      style={({ pressed }) => [
        {
          flex: 1,
          borderRadius: radius.cta,
          backgroundColor: colors.surfaceElevated,
          overflow: 'hidden',
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
          overflow: 'hidden',
        }}
      >
        {hasPhoto ? (
          <Image
            source={{ uri: cat.photoUri }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <CatSprite colorLabel={cat.analysis.color} seed={cat.number} size={112} />
        )}

        {onToggleFavorite ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            hitSlop={8}
            onPress={(event) => {
              event.stopPropagation();
              onToggleFavorite();
            }}
            style={({ pressed }) => ({
              position: 'absolute',
              top: spacing[8],
              right: spacing[8],
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

      <View style={{ padding: spacing[16], gap: spacing[4] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[8] }}>
          <Text
            variant="bodySmall"
            color="text"
            numberOfLines={1}
            style={{ flex: 1, fontFamily: fonts.bodySemi }}
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
              justifyContent: 'center',
            }}
          >
            {gender ? (
              <Text variant="caption" style={{ color: colors.mapPlayer, lineHeight: 14 }}>
                {gender}
              </Text>
            ) : (
              <View
                style={{
                  width: spacing[8],
                  height: spacing[8],
                  borderRadius: radius.full,
                  backgroundColor: theme.hex,
                }}
              />
            )}
          </View>
        </View>
        <Text variant="caption" style={{ fontFamily: fonts.bodySemi, color: rarity.foreground }}>
          {catDexRarityLabel(rarityId)}
        </Text>
      </View>
    </Pressable>
  );
}
