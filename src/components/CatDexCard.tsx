/**
 * Sprite gallery tile — dense CatDex grid matching design mock.
 */
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { CatSprite } from '@/components/CatSprite';
import { Text } from '@/components/Text';
import { formatDexNumber } from '@/lib/constants';
import { themeFromColorLabel, themeSoft } from '@/lib/catTheme';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

type Props = {
  cat: Cat;
  onPress: () => void;
};

function CatDexCardComponent({ cat, onPress }: Props) {
  const { colors, fonts, spacing, radius, shadow, scheme, motion } = useTheme();
  const theme = themeFromColorLabel(cat.analysis.color, cat.number);
  const dexLabel = formatDexNumber(cat.number);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${dexLabel}, ${cat.name}`}
      onPress={onPress}
      style={({ pressed }) => [
        {
          flex: 1,
          borderRadius: radius.lg,
          backgroundColor: themeSoft(theme, scheme),
          borderWidth: 1,
          borderColor: colors.border,
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
          padding: spacing[8],
        }}
      >
        <CatSprite colorLabel={cat.analysis.color} seed={cat.number} size={112} />
      </View>
      <View style={{ paddingHorizontal: spacing[16], paddingBottom: spacing[16], gap: spacing[4] }}>
        <Text variant="caption" color="textMuted" style={{ fontFamily: fonts.bodySemi }}>
          {dexLabel}
        </Text>
        <Text
          variant="bodySmall"
          color="textBrand"
          numberOfLines={1}
          style={{ fontFamily: fonts.bodySemi, textTransform: 'uppercase' }}
        >
          {cat.name}
        </Text>
      </View>
    </Pressable>
  );
}

export const CatDexCard = memo(CatDexCardComponent);
