import { Image, type ImageStyle, type StyleProp } from 'react-native';

import { useTheme } from '@/theme';

const LOGO = require('../../assets/catdex-logo.png');

type Size = 'sm' | 'md' | 'lg' | 'hero';

const SIZE_MAP: Record<Size, number> = {
  sm: 32,
  md: 48,
  lg: 80,
  hero: 128,
};

type Props = {
  size?: Size | number;
  style?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
};

/** Official CatDex badge logo. */
export function BrandLogo({
  size = 'md',
  style,
  accessibilityLabel = 'CatDex',
}: Props) {
  const { spacing } = useTheme();
  const dim = typeof size === 'number' ? size : (SIZE_MAP[size] ?? spacing[48]);

  return (
    <Image
      source={LOGO}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      resizeMode="contain"
      style={[{ width: dim, height: dim }, style]}
    />
  );
}
