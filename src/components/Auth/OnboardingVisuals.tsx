import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { Glyph, type OnboardingGlyph } from '@/components/Auth/Onboarding/glyphs';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme/ThemeProvider';

export type { OnboardingGlyph };

type SoftKey = 'brandSoft' | 'orangeSoft' | 'roseSoft';
type TintKey = 'brand' | 'orange' | 'rose';

/** Illustrated badge — soft fill, sparkles, elevation. Used on permission screens. */
export function OnboardingIconBadge({
  glyph,
  softKey,
  tintKey,
  size = 56,
}: {
  glyph: OnboardingGlyph;
  softKey: SoftKey;
  tintKey: TintKey;
  size?: number;
}) {
  const { colors, radius, shadow, spacing } = useTheme();
  const sparkle = colors[tintKey];

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: radius.full,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: 'center',
          justifyContent: 'center',
        },
        shadow.low,
      ]}
    >
      <LinearGradient
        colors={[colors[softKey], colors.surfaceElevated]}
        style={StyleSheet.absoluteFill}
      />
      <View style={{ position: 'absolute', top: spacing[4], right: spacing[8] }}>
        <Svg width={8} height={8} viewBox="0 0 8 8">
          <Path
            d="M4 0 L4.6 3.4 L8 4 L4.6 4.6 L4 8 L3.4 4.6 L0 4 L3.4 3.4 Z"
            fill={sparkle}
            opacity={0.7}
          />
        </Svg>
      </View>
      <View style={{ position: 'absolute', bottom: spacing[8], left: spacing[8] }}>
        <Svg width={6} height={6} viewBox="0 0 8 8">
          <Path
            d="M4 0 L4.6 3.4 L8 4 L4.6 4.6 L4 8 L3.4 4.6 L0 4 L3.4 3.4 Z"
            fill={sparkle}
            opacity={0.4}
          />
        </Svg>
      </View>
      <Glyph name={glyph} color={colors[tintKey]} />
    </View>
  );
}

/** Soft pulse wrapper for primary onboarding CTAs (permission screens). */
export function OnboardingPulseCta({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 780 }),
        withTiming(1, { duration: 780 }),
      ),
      -1,
      false,
    );
  }, [pulse, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  if (reduceMotion) return <>{children}</>;
  return <Animated.View style={style}>{children}</Animated.View>;
}

/** @deprecated Prefer immersive Onboarding components from `@/components/Auth/Onboarding`. */
export {
  AnimatedCircle,
  DiscoveryTimeline,
  FloatingPreviewCard,
  OnboardingHero,
  PrimaryCTA,
  ProgressDots,
  RewardChips,
  TimelineStep,
} from './Onboarding';
