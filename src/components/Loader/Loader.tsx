import { useContext, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/Text';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ThemeContext, useTheme } from '@/theme/ThemeProvider';
import { iconSize as iconSizeTokens } from '@/theme/icons';
import { palette } from '@/theme/colors';

export function Spinner({
  size = 'md',
  color,
}: {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}) {
  const theme = useContext(ThemeContext);
  const resolvedColor = color ?? theme?.colors.primary ?? palette.light.accent;
  const sizes = theme?.iconSize ?? iconSizeTokens;
  const dimension = size === 'sm' ? sizes.sm : size === 'lg' ? sizes.xl : sizes.lg;
  return (
    <ActivityIndicator color={resolvedColor} size={dimension > 24 ? 'large' : 'small'} />
  );
}

export function Skeleton({
  width = '100%',
  height = 16,
  style,
}: {
  width?: number | `${number}%`;
  height?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors, radius, motion } = useTheme();
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = withRepeat(
      withTiming(1, {
        duration: motion.duration.slow,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true,
    );
  }, [motion.duration.slow, opacity, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: reduceMotion ? 0.6 : opacity.value,
  }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          width,
          height,
          borderRadius: radius.sm,
          backgroundColor: colors.skeleton,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function PageLoading({ label = 'Chargement…' }: { label?: string }) {
  const { colors, spacing } = useTheme();

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      style={[styles.page, { backgroundColor: colors.background, gap: spacing[16] }]}
    >
      <Spinner size="lg" />
      <Text variant="bodySmall" color="textSecondary">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
