import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { BrandLogo } from '@/components/BrandLogo';
import { Text } from '@/components/Text';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme/ThemeProvider';

type BrandLoaderProps = {
  label?: string;
};

/**
 * Full-screen brand loader — logo au centre, pulse doux.
 * Utilisé en sortie d’onboarding (après permissions).
 */
export function BrandLoader({ label = 'Préparation de ton quartier…' }: BrandLoaderProps) {
  const { colors, spacing, motion } = useTheme();
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.85);

  useEffect(() => {
    if (reduceMotion) return;
    scale.value = withRepeat(
      withSequence(
        withTiming(1.06, {
          duration: motion.duration.reveal,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(1, {
          duration: motion.duration.reveal,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1,
      false,
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: motion.duration.reveal }),
        withTiming(0.75, { duration: motion.duration.reveal }),
      ),
      -1,
      false,
    );
  }, [motion.duration.reveal, opacity, reduceMotion, scale]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      style={[
        styles.root,
        {
          backgroundColor: colors.background,
          gap: spacing[32],
          paddingHorizontal: spacing[24],
        },
      ]}
    >
      <Animated.View style={logoStyle}>
        <BrandLogo size="hero" />
      </Animated.View>
      <Text variant="body" color="textSecondary" align="center">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
