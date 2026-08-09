import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { CatDexIcon } from '@/components/icons/catdex';
import { RewardHalo } from '@/components/reward';
import { Text } from '@/components/Text';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Beat 2 — tu prends une photo (shutter + frame).
 */
export function PhotoScene() {
  const { colors, fonts, spacing, radius, shadow, motion } = useTheme();
  const reduceMotion = useReducedMotion();
  const shutter = useSharedValue(0);
  const pulse = useSharedValue(0.6);

  useEffect(() => {
    if (reduceMotion) return;
    shutter.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 120, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 280, easing: Easing.in(Easing.quad) }),
          withTiming(0, { duration: 1400 }),
        ),
        -1,
        false,
      ),
    );
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: motion.duration.reveal * 2 }),
        withTiming(0.55, { duration: motion.duration.reveal * 2 }),
      ),
      -1,
      false,
    );
  }, [motion.duration.reveal, pulse, reduceMotion, shutter]);

  const flashStyle = useAnimatedStyle(() => ({
    opacity: shutter.value * 0.55,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + pulse.value * 0.4,
    transform: [{ scale: 0.92 + pulse.value * 0.1 }],
  }));

  const frame = spacing[96] + spacing[64];

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[24],
        paddingHorizontal: spacing[24],
      }}
    >
      <Animated.View
        entering={reduceMotion ? undefined : FadeInUp.delay(40).springify().damping(16)}
        style={{ alignItems: 'center', gap: spacing[8] }}
      >
        <Text
          variant="h1"
          color="textBrand"
          align="center"
          style={{ fontFamily: fonts.display }}
        >
          Tu prends une photo.
        </Text>
        <Text variant="body" color="textSecondary" align="center">
          Un clic. Le quartier devient une chasse au chat.
        </Text>
      </Animated.View>

      <View style={{ width: frame, height: frame, alignItems: 'center', justifyContent: 'center' }}>
        <RewardHalo size={frame + spacing[32]} />
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: frame,
              height: frame,
              borderRadius: radius.cta,
              borderWidth: 3,
              borderColor: colors.brand,
            },
            ringStyle,
            shadow.glow,
          ]}
        />
        <View
          style={[
            {
              width: frame - spacing[24],
              height: frame - spacing[24],
              borderRadius: radius.lg,
              backgroundColor: colors.surfaceElevated,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            },
            shadow.medium,
          ]}
        >
          <CatDexIcon name="camera" color={colors.brand} size={48} />
          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.onBrand }, flashStyle]}
          />
        </View>
      </View>

      <Animated.View entering={reduceMotion ? undefined : FadeIn.delay(300)}>
        <Text variant="caption" color="textMuted" align="center">
          Cadre · déclenche · capture
        </Text>
      </Animated.View>
    </View>
  );
}
