import { BlurView } from 'expo-blur';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type CardBaseProps = {
  children?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
};

/** Surface card — depth, soft border, 24 radius */
export function Card({ children, onPress, style, padded = true }: CardBaseProps) {
  const { colors, spacing, radius, shadow, motion } = useTheme();

  const content = (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: padded ? spacing[24] : 0,
          overflow: 'hidden',
        },
        shadow.low,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [{ transform: [{ scale: pressed ? motion.cardPressScale : 1 }] }]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

/**
 * Glass surface — kept for atmospheric panels (blur + glassFill).
 * Prefer Card for dense content lists.
 */
export function GlassCard({ children, onPress, style, padded = true }: CardBaseProps) {
  const { colors, spacing, radius, shadow, motion } = useTheme();

  const body = (
    <View
      style={[
        {
          borderRadius: radius.lg,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: colors.border,
        },
        shadow.low,
        style,
      ]}
    >
      <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
      <View style={{ padding: padded ? spacing[16] : 0, backgroundColor: colors.glassFill }}>
        {children}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [{ transform: [{ scale: pressed ? motion.cardPressScale : 1 }] }]}
      >
        {body}
      </Pressable>
    );
  }

  return body;
}
