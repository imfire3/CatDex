import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

export type AvatarSize = 'S' | 'M' | 'L' | 'XL';

const SIZE_MAP: Record<AvatarSize, 32 | 40 | 48 | 64> = {
  S: 32,
  M: 40,
  L: 48,
  XL: 64,
};

export type AvatarProps = {
  size?: AvatarSize;
  source?: ImageSourcePropType | { uri: string };
  initials?: string;
  accessibilityLabel?: string;
};

export function Avatar({ size = 'M', source, initials, accessibilityLabel }: AvatarProps) {
  const { colors, radius, typography } = useTheme();
  const dimension = SIZE_MAP[size];

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
          borderColor: colors.mapPinRing,
          borderWidth: 2,
        },
      ]}
    >
      {source ? (
        <Image source={source} style={styles.image} />
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
  },
});
