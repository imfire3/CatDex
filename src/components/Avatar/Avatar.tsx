import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

export type AvatarSize = 'S' | 'M' | 'L' | 'XL';

const SIZE_MAP: Record<AvatarSize, 32 | 40 | 48 | 64 | 96> = {
  S: 32,
  M: 40,
  L: 48,
  XL: 64,
};

export type AvatarProps = {
  size?: AvatarSize;
  /** Extra-large profile hero — uses spacing 96 */
  hero?: boolean;
  source?: ImageSourcePropType | { uri: string };
  initials?: string;
  accessibilityLabel?: string;
  /** Accent ring (collection identity) */
  accentBorder?: boolean;
  /** Primary gradient behind initials */
  gradient?: boolean;
};

export function Avatar({
  size = 'M',
  hero = false,
  source,
  initials,
  accessibilityLabel,
  accentBorder = false,
  gradient = false,
}: AvatarProps) {
  const { colors, radius, typography, spacing, gradients, shadow } = useTheme();
  const dimension = hero ? spacing[96] : SIZE_MAP[size];

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel ?? initials ?? 'Avatar'}
      style={[
        styles.base,
        {
          width: dimension,
          height: dimension,
          borderRadius: radius.full,
          backgroundColor: colors.surfaceSecondary,
          borderColor: accentBorder ? colors.accent : colors.border,
          borderWidth: accentBorder ? 3 : 2,
        },
        accentBorder ? shadow.glow : null,
      ]}
    >
      {source ? (
        <Image source={source} style={styles.image} />
      ) : gradient ? (
        <LinearGradient
          colors={[gradients.primary[0], gradients.primary[1]]}
          style={styles.image}
        >
          <Text
            variant={hero || size === 'XL' ? 'h1' : 'label'}
            color="onAccent"
            style={{
              textTransform: 'uppercase',
              fontSize:
                hero || size === 'XL'
                  ? typography.h1.fontSize
                  : size === 'S'
                    ? typography.caption.fontSize
                    : typography.bodySmall.fontSize,
            }}
          >
            {(initials ?? '?').slice(0, 2)}
          </Text>
        </LinearGradient>
      ) : (
        <Text
          variant="label"
          color="textSecondary"
          style={{
            fontSize: size === 'S' ? typography.caption.fontSize : typography.bodySmall.fontSize,
            textTransform: 'uppercase',
          }}
        >
          {(initials ?? '?').slice(0, 2)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
