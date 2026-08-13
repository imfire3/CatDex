import { useEffect, useState } from 'react';
import { Image, Platform, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { Text } from '@/components/Text';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme/ThemeProvider';

import { DEMO_CAT_IMAGE } from './demoCat';

const REVEALS = [
  'Race détectée',
  'Couleur détectée',
  'Pelage détecté',
  'Pose détectée',
  'Personnalité générée',
] as const;

/**
 * Écran 2 — révélation IA, pas une liste de cards.
 * Gros scan + checks qui pop toutes les ~300 ms.
 */
export function ScanScene() {
  const { colors, spacing, radius, shadow, motion } = useTheme();
  const reduceMotion = useReducedMotion();
  const [count, setCount] = useState(reduceMotion ? REVEALS.length : 0);

  const sweep = useSharedValue(0);
  const pulse = useSharedValue(0.75);
  const photoScale = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.75, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    sweep.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.linear }),
      -1,
      false,
    );
    photoScale.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [photoScale, pulse, reduceMotion, sweep]);

  useEffect(() => {
    if (reduceMotion) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    REVEALS.forEach((_, index) => {
      timers.push(
        setTimeout(() => {
          setCount(index + 1);
          if (Platform.OS !== 'web') {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }, 400 + index * 300),
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [reduceMotion]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + pulse.value * 0.4,
    transform: [{ scale: 0.88 + pulse.value * 0.14 }],
  }));

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sweep.value * 360}deg` }],
  }));

  const photoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: photoScale.value }],
  }));

  const frame = spacing[96] + spacing[48];

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[32],
        paddingVertical: spacing[8] }}
    >
      {/* Camera / scan hero with cat inside */}
      <View
        style={{
          width: frame + spacing[48],
          height: frame + spacing[48],
          alignItems: 'center',
          justifyContent: 'center' }}
      >
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: frame + spacing[40],
              height: frame + spacing[40],
              borderRadius: radius.full,
              borderWidth: 2,
              borderColor: colors.brand,
            },
            ringStyle,
          ]}
        />
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: frame + spacing[16],
              height: frame + spacing[16],
              borderRadius: radius.full,
              borderWidth: 2,
              borderColor: colors.brand,
              borderStyle: 'dashed',
              opacity: 0.45,
            },
            sweepStyle,
          ]}
        />

        {/* Scan line */}
        {!reduceMotion ? <ScanBeam size={frame} color={colors.brand} /> : null}

        <Animated.View
          style={[
            {
              width: frame,
              height: frame,
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
            source={DEMO_CAT_IMAGE}
            resizeMode="cover"
            style={{ width: '100%', height: '100%' }}
            accessibilityIgnoresInvertColors
          />
          <View
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: colors.brand, opacity: 0.08 },
            ]}
          />
        </Animated.View>
      </View>

      <Animated.View
        entering={reduceMotion ? undefined : FadeIn.delay(120).duration(motion.duration.slow)}
        style={{ alignItems: 'center', gap: spacing[4] }}
      >
        <Text
          variant="title"
          color="textBrand"
          align="center"
        >
          L’IA découvre qui il est
        </Text>
      </Animated.View>

      {/* Revelation stack — no white cards */}
      <View style={{ alignItems: 'center', gap: spacing[8], minHeight: spacing[96] + spacing[40] }}>
        {REVEALS.map((label, index) => {
          const visible = index < count;
          if (!visible && !reduceMotion) return <View key={label} style={{ height: spacing[32] }} />;
          return (
            <RevealLine
              key={label}
              label={label}
              visible={visible || reduceMotion}
            />
          );
        })}
      </View>
    </View>
  );
}

function ScanBeam({ size, color }: { size: number; color: string }) {
  const y = useSharedValue(0);

  useEffect(() => {
    y.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [y]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: (y.value - 0.5) * (size * 0.7) }],
    opacity: 0.55,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: size * 0.78,
          height: 2,
          borderRadius: 999,
          backgroundColor: color,
          zIndex: 4,
        },
        style,
      ]}
    />
  );
}

function RevealLine({
  label,
  visible,
}: {
  label: string;
  visible: boolean;
}) {
  const { colors, spacing, radius, motion } = useTheme();
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(visible || reduceMotion ? 1 : 0.85);
  const opacity = useSharedValue(visible || reduceMotion ? 1 : 0);

  useEffect(() => {
    if (!visible || reduceMotion) return;
    opacity.value = withTiming(1, { duration: motion.duration.fast });
    scale.value = withSequence(
      withSpring(1.08, { damping: 10, stiffness: 220 }),
      withTiming(1, { duration: motion.duration.fast }),
    );
  }, [motion.duration.fast, opacity, reduceMotion, scale, visible]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!visible && reduceMotion) return null;

  return (
    <Animated.View
      entering={
        reduceMotion || !visible
          ? undefined
          : FadeInUp.delay(20).duration(motion.duration.fast)
      }
      style={[
        style,
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing[8],
          paddingVertical: spacing[4],
          paddingHorizontal: spacing[16],
        },
      ]}
    >
      <View
        style={{
          width: spacing[24],
          height: spacing[24],
          borderRadius: radius.full,
          backgroundColor: colors.successSoft,
          alignItems: 'center',
          justifyContent: 'center' }}
      >
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
          <Path
            d="M5 12.5 9.5 17 19 7.5"
            stroke={colors.success}
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
      <Text variant="body" weight="semibold" color="text">
        {label}
      </Text>
    </Animated.View>
  );
}
