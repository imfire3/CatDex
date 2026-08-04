import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  size?: number;
  color?: string;
  rounded?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** L-shaped scan corners — camera viewfinder overlay. */
export function ScanFrame({ size = 240, color, rounded = false, style }: Props) {
  const { colors, spacing, radius } = useTheme();
  const stroke = color ?? colors.onAccent;
  const arm = spacing[32];
  const thickness = spacing[4];
  const cornerRadius = rounded ? radius.sm : 0;

  const corner = (rotation: 'tl' | 'tr' | 'bl' | 'br') => {
    const common = {
      position: 'absolute' as const,
      width: arm,
      height: arm,
      borderColor: stroke,
    };
    if (rotation === 'tl') {
      return {
        ...common,
        top: 0,
        left: 0,
        borderTopWidth: thickness,
        borderLeftWidth: thickness,
        borderTopLeftRadius: cornerRadius,
      };
    }
    if (rotation === 'tr') {
      return {
        ...common,
        top: 0,
        right: 0,
        borderTopWidth: thickness,
        borderRightWidth: thickness,
        borderTopRightRadius: cornerRadius,
      };
    }
    if (rotation === 'bl') {
      return {
        ...common,
        bottom: 0,
        left: 0,
        borderBottomWidth: thickness,
        borderLeftWidth: thickness,
        borderBottomLeftRadius: cornerRadius,
      };
    }
    return {
      ...common,
      bottom: 0,
      right: 0,
      borderBottomWidth: thickness,
      borderRightWidth: thickness,
      borderBottomRightRadius: cornerRadius,
    };
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
