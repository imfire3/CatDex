import { useEffect, useMemo } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
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

const DEMO_CAT = require('../../../../assets/onboarding-demo-cat.jpg');
const { width: SCREEN_W } = Dimensions.get('window');

/**
 * Écran 1 — émotion pure.
 * Énorme chat qui déborde, fond vivant, une phrase, proximité, CTA.
 * Zéro carte blanche.
 */
export function SightingScene() {
  const { colors, fonts, spacing, radius, shadow, motion, gradients } = useTheme();
  const reduceMotion = useReducedMotion();

  const halo = useSharedValue(0.6);
  const catScale = useSharedValue(reduceMotion ? 1 : 0.82);
  const catY = useSharedValue(reduceMotion ? 0 : 40);
  const floatY = useSharedValue(0);

  const heroW = Math.min(SCREEN_W * 1.05, spacing[96] * 3 + spacing[40]);
  const heroH = heroW * 1.05;

  useEffect(() => {
    if (reduceMotion) return;
    catScale.value = withSpring(1, { damping: 12, stiffness: 90 });
    catY.value = withSpring(0, { damping: 14, stiffness: 100 });
    halo.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.55, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    floatY.value = withDelay(
      700,
      withRepeat(
        withSequence(
          withTiming(-8, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      ),
    );
  }, [catScale, catY, floatY, halo, reduceMotion]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.28 + halo.value * 0.35,
    transform: [{ scale: 0.86 + halo.value * 0.2 }],
  }));

  const catStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: catY.value + floatY.value },
      { scale: catScale.value },
    ],
  }));

  const pawPrints = useMemo(
    () =>
      [
        { top: '8%', left: '6%', rotate: '-18deg', delay: 200 },
        { top: '18%', right: '8%', rotate: '22deg', delay: 360 },
        { top: '72%', left: '10%', rotate: '12deg', delay: 480 },
        { top: '78%', right: '6%', rotate: '-28deg', delay: 620 },
      ] as const,
    [],
  );

  const sparks = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        top: 6 + ((i * 31) % 88),
        left: 4 + ((i * 27) % 90),
        size: 3 + (i % 3),
        delay: 100 + i * 80,
      })),
    [],
  );

  return (
    <View style={{ flex: 1, overflow: 'hidden' }}>
      {/* Living soft background glow */}
      <LinearGradient
        colors={[colors.brandSoft, colors.background, colors.background]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={[...gradients.primarySoft]}
        style={{
          position: 'absolute',
          top: -spacing[40],
          alignSelf: 'center',
          width: heroW,
          height: heroW,
          borderRadius: radius.full,
          opacity: 0.85,
        }}
      />

      {/* Floating paw prints */}
      {pawPrints.map((paw, i) => (
        <Animated.View
          key={`paw-${i}`}
          entering={reduceMotion ? undefined : FadeIn.delay(paw.delay).duration(motion.duration.reveal)}
          style={{
            position: 'absolute',
            top: paw.top,
            left: 'left' in paw ? paw.left : undefined,
            right: 'right' in paw ? paw.right : undefined,
            opacity: 0.18,
            transform: [{ rotate: paw.rotate }],
          }}
        >
          <PawMark color={colors.brand} size={28} />
        </Animated.View>
      ))}

      {/* Particles */}
      {!reduceMotion
        ? sparks.map((s) => <Spark key={s.id} {...s} color={colors.brand} />)
        : null}

      {/* Oversized cat hero — bleeds past edges */}
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'flex-end',
          marginHorizontal: -spacing[24],
          paddingBottom: spacing[8],
        }}
      >
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: heroW * 0.92,
              height: heroW * 0.92,
              borderRadius: radius.full,
              backgroundColor: colors.brandSoft,
            },
            haloStyle,
          ]}
        />
        <Animated.View
          style={[
            {
              width: heroW,
              height: heroH,
              borderRadius: radius.full,
              overflow: 'hidden',
              borderWidth: 4,
              borderColor: colors.surfaceElevated,
              backgroundColor: colors.surfaceSecondary,
            },
            shadow.floating,
            catStyle,
          ]}
        >
          <Image
            source={DEMO_CAT}
            resizeMode="cover"
            style={{ width: '100%', height: '110%', marginTop: '-4%' }}
            accessibilityIgnoresInvertColors
          />
        </Animated.View>
      </View>

      {/* Single message + proximity */}
      <Animated.View
        entering={reduceMotion ? undefined : FadeInUp.delay(380).springify().damping(15)}
        style={{
          alignItems: 'center',
          gap: spacing[16],
          paddingHorizontal: spacing[24],
          paddingBottom: spacing[8],
        }}
      >
        <Text
          variant="h1"
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
              backgroundColor: 'rgba(255,255,255,0.82)',
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.border,
            },
            shadow.low,
          ]}
        >
          <Text variant="bodySmall" color="text" style={{ fontFamily: fonts.bodySemi }}>
            Belleville
          </Text>
          <View style={{ width: 1, height: spacing[16], backgroundColor: colors.border }} />
          <Text variant="bodySmall" color="textBrand" style={{ fontFamily: fonts.bodySemi }}>
            150 m
          </Text>
        </View>
      </Animated.View>
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

function Spark({
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
        withSequence(withTiming(0.75, { duration: 900 }), withTiming(0.12, { duration: 900 })),
        -1,
        false,
      ),
    );
    y.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-10, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
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
