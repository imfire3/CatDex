import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { Text } from '@/components/Text';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme/ThemeProvider';

import { DEMO_ONBOARDING_CAT } from './demoCat';
import { OnboardingCatCard } from './OnboardingCatCard';

/**
 * Écran 1 — un chat apparaît près de toi.
 * Hero = carte CatDex style Pokémon (photo propre), pas un crop du welcome.
 */
export function SightingScene() {
  const { colors, fonts, spacing, radius, shadow, motion, gradients } = useTheme();
  const reduceMotion = useReducedMotion();

  const cardScale = useSharedValue(reduceMotion ? 1 : 0.86);
  const cardY = useSharedValue(reduceMotion ? 0 : 28);
  const floatY = useSharedValue(0);
  const glow = useSharedValue(0.55);

  useEffect(() => {
    if (reduceMotion) return;
    cardScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    cardY.value = withSpring(0, { damping: 14, stiffness: 110 });
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.5, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    floatY.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(-6, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      ),
    );
  }, [cardScale, cardY, floatY, glow, reduceMotion]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: cardY.value + floatY.value },
      { scale: cardScale.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + glow.value * 0.4,
    transform: [{ scale: 0.88 + glow.value * 0.18 }],
  }));

  const pawPrints = useMemo(
    () =>
      [
        { top: '10%', left: '6%', rotate: '-18deg', delay: 200 },
        { top: '16%', right: '8%', rotate: '22deg', delay: 360 },
        { top: '70%', left: '8%', rotate: '12deg', delay: 480 },
        { top: '74%', right: '6%', rotate: '-28deg', delay: 620 },
      ] as const,
    [],
  );

  return (
    <View style={{ flex: 1, overflow: 'hidden' }}>
      <LinearGradient
        colors={[colors.brandSoft, colors.background, colors.background]}
        locations={[0, 0.42, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={[...gradients.primarySoft]}
        style={{
          position: 'absolute',
          top: spacing[16],
          alignSelf: 'center',
          width: spacing[96] * 2 + spacing[48],
          height: spacing[96] * 2 + spacing[48],
          borderRadius: radius.full,
          opacity: 0.7,
        }}
      />

      {pawPrints.map((paw, i) => (
        <Animated.View
          key={`paw-${i}`}
          entering={reduceMotion ? undefined : FadeIn.delay(paw.delay).duration(motion.duration.reveal)}
          style={{
            position: 'absolute',
            top: paw.top,
            left: 'left' in paw ? paw.left : undefined,
            right: 'right' in paw ? paw.right : undefined,
            opacity: 0.16,
            transform: [{ rotate: paw.rotate }],
          }}
        >
          <PawMark color={colors.brand} size={26} />
        </Animated.View>
      ))}

      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: spacing[24],
          gap: spacing[24],
        }}
      >
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: spacing[96] * 2 + spacing[64],
                height: spacing[96] * 2 + spacing[64],
                borderRadius: radius.full,
                backgroundColor: colors.brandSoft,
              },
              glowStyle,
            ]}
          />
          <Animated.View style={cardStyle}>
            <OnboardingCatCard size="hero" showMeta />
          </Animated.View>
        </View>

        <Animated.View
          entering={reduceMotion ? undefined : FadeInUp.delay(320).springify().damping(15)}
          style={{
            alignItems: 'center',
            gap: spacing[16],
            paddingHorizontal: spacing[8],
          }}
        >
          <Text
            variant="h2"
            color="textBrand"
            align="center"
            style={{ fontFamily: fonts.display }}
          >
            Un chat vient d’apparaître près de toi
          </Text>

          <View
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
              {DEMO_ONBOARDING_CAT.neighborhood}
            </Text>
            <View style={{ width: 1, height: spacing[16], backgroundColor: colors.border }} />
            <Text variant="bodySmall" color="textBrand" style={{ fontFamily: fonts.bodySemi }}>
              {DEMO_ONBOARDING_CAT.distance}
            </Text>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

function PawMark({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 18.5c-2.6 0-4.7-1.4-4.7-2.8 0-.8.9-1.2 1.8-.9.6.2 1.4.4 2.9.4s2.3-.2 2.9-.4c.9-.3 1.8.1 1.8.9 0 1.4-2.1 2.8-4.7 2.8Z"
        fill={color}
      />
      <Path
        d="M7.2 11.2a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8ZM16.8 11.2a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8ZM9.4 7.4a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4ZM14.6 7.4a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Z"
        fill={color}
      />
    </Svg>
  );
}
