import { useEffect, useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/Text';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme/ThemeProvider';

const DEMO_CAT = require('../../../../assets/onboarding-demo-cat.jpg');

/**
 * Écran 1 — le chat est le héros.
 * Halo → silhouette → photo → une seule phrase + proximité.
 */
export function SightingScene() {
  const { colors, fonts, spacing, radius, shadow, motion, gradients } = useTheme();
  const reduceMotion = useReducedMotion();

  const halo = useSharedValue(0.55);
  const reveal = useSharedValue(reduceMotion ? 1 : 0);
  const floatY = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    halo.value = withRepeat(
      withSequence(
        withTiming(1, { duration: motion.duration.reveal * 2, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.55, { duration: motion.duration.reveal * 2, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    reveal.value = withDelay(
      280,
      withSpring(1, { damping: 14, stiffness: 120 }),
    );
    floatY.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(-6, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      ),
    );
  }, [floatY, halo, motion.duration.reveal, reduceMotion, reveal]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + halo.value * 0.35,
    transform: [{ scale: 0.88 + halo.value * 0.18 }],
  }));

  const midHaloStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + halo.value * 0.25,
    transform: [{ scale: 0.92 + halo.value * 0.1 }],
  }));

  const photoStyle = useAnimatedStyle(() => ({
    opacity: reveal.value,
    transform: [
      { scale: 0.86 + reveal.value * 0.14 },
      { translateY: floatY.value },
    ],
  }));

  const particles = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        top: 12 + ((i * 37) % 76),
        left: 8 + ((i * 29) % 84),
        size: 3 + (i % 3),
        delay: 120 + i * 90,
      })),
    [],
  );

  const heroSize = spacing[96] + spacing[40];

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[40],
        paddingVertical: spacing[16],
      }}
    >
      <View
        style={{
          width: heroSize + spacing[48],
          height: heroSize + spacing[48],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LinearGradient
          colors={[...gradients.primarySoft]}
          style={[
            StyleSheet.absoluteFillObject,
            { borderRadius: radius.full, opacity: 0.9 },
          ]}
        />

        <Animated.View
          style={[
            {
              position: 'absolute',
              width: heroSize + spacing[32],
              height: heroSize + spacing[32],
              borderRadius: radius.full,
              borderWidth: 1.5,
              borderColor: colors.brand,
            },
            haloStyle,
          ]}
        />
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: heroSize + spacing[8],
              height: heroSize + spacing[8],
              borderRadius: radius.full,
              backgroundColor: colors.brandSoft,
            },
            midHaloStyle,
          ]}
        />

        {!reduceMotion
          ? particles.map((p) => (
              <Particle key={p.id} {...p} color={colors.brand} />
            ))
          : null}

        <Animated.View
          style={[
            {
              width: heroSize,
              height: heroSize,
              borderRadius: radius.full,
              overflow: 'hidden',
              borderWidth: 3,
              borderColor: colors.surfaceElevated,
              backgroundColor: colors.surfaceSecondary,
            },
            shadow.medium,
            photoStyle,
          ]}
        >
          <Image
            source={DEMO_CAT}
            resizeMode="cover"
            style={{ width: heroSize, height: heroSize }}
            accessibilityIgnoresInvertColors
          />
        </Animated.View>
      </View>

      <Animated.View
        entering={reduceMotion ? undefined : FadeInUp.delay(420).springify().damping(16)}
        style={{ gap: spacing[16], alignItems: 'center', paddingHorizontal: spacing[16] }}
      >
        <Text
          variant="h1"
          color="textBrand"
          align="center"
          style={{ fontFamily: fonts.display }}
        >
          Un chat se cache près de toi…
        </Text>

        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.delay(640).duration(motion.duration.slow)}
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing[16],
              paddingVertical: spacing[8],
              paddingHorizontal: spacing[16],
              borderRadius: radius.full,
              backgroundColor: colors.surfaceElevated,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.border,
            },
            shadow.low,
          ]}
        >
          <Text variant="bodySmall" color="text" style={{ fontFamily: fonts.bodySemi }}>
            Belleville
          </Text>
          <View
            style={{
              width: StyleSheet.hairlineWidth,
              alignSelf: 'stretch',
              backgroundColor: colors.border,
            }}
          />
          <Text variant="bodySmall" color="textBrand" style={{ fontFamily: fonts.bodySemi }}>
            150 m
          </Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

function Particle({
  top,
  left,
  size,
  delay,
  color,
}: {
  top: number;
  left: number;
  size: number;
  delay: number;
  color: string;
}) {
  const opacity = useSharedValue(0);
  const y = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.7, { duration: 900 }),
          withTiming(0.15, { duration: 900 }),
        ),
        -1,
        false,
      ),
    );
    y.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-8, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, opacity, y]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y.value }],
  }));

  return (
    <Animated.View
      entering={FadeIn.delay(delay)}
      style={[
        {
          position: 'absolute',
          top: `${top}%`,
          left: `${left}%`,
          width: size,
          height: size,
          borderRadius: 999,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}
