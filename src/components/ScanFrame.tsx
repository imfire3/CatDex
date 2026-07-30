import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

/** L-shaped scan corners — inspired by premium card scanners. */
export function ScanFrame({ size = 240, color, style }: Props) {
  const { colors, spacing } = useTheme();
  const stroke = color ?? colors.primary;
  const arm = spacing[32];
  const thickness = spacing[4];

  const corner = (rotation: 'tl' | 'tr' | 'bl' | 'br') => {
    const common = {
      position: 'absolute' as const,
      width: arm,
      height: arm,
      borderColor: stroke,
    };
    if (rotation === 'tl') {
      return { ...common, top: 0, left: 0, borderTopWidth: thickness, borderLeftWidth: thickness };
    }
    if (rotation === 'tr') {
      return { ...common, top: 0, right: 0, borderTopWidth: thickness, borderRightWidth: thickness };
    }
    if (rotation === 'bl') {
      return { ...common, bottom: 0, left: 0, borderBottomWidth: thickness, borderLeftWidth: thickness };
    }
    return { ...common, bottom: 0, right: 0, borderBottomWidth: thickness, borderRightWidth: thickness };
  };

  return (
    <View style={[{ width: size, height: size }, style]}>
      <View style={corner('tl')} />
      <View style={corner('tr')} />
      <View style={corner('bl')} />
      <View style={corner('br')} />
    </View>
  );
}
