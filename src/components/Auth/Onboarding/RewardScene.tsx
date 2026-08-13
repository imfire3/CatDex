import { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  interpolate,
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

import { Glyph } from './glyphs';
import { OnboardingCatCard } from './OnboardingCatCard';

const REWARDS = [
  { id: 'xp', label: '+30 XP', glyph: 'xp' as const },
  { id: 'badge', label: 'Photographe', glyph: 'badge' as const },
  { id: 'companion', label: 'Premier compagnon', glyph: 'paw' as const },
  { id: 'dex', label: 'CatDex débloqué', glyph: 'book' as const },
];

/**
 * Écran 3 — le chat saute dans la carte CatDex.
 * Flip / spring Pokémon-like, puis récompenses une par une.
 */
export function RewardScene() {
  const { colors, spacing, radius, motion } = useTheme();
  const reduceMotion = useReducedMotion();
  const [showRewards, setShowRewards] = useState(reduceMotion);

  const flip = useSharedValue(reduceMotion ? 1 : 0);
  const glow = useSharedValue(0.5);
  const enterY = useSharedValue(reduceMotion ? 0 : 80);
  const enterScale = useSharedValue(reduceMotion ? 1 : 0.7);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    if (reduceMotion) {
      setShowRewards(true);
      return;
    }

    enterY.value = withSpring(0, { damping: 13, stiffness: 120 });
    enterScale.value = withSpring(1, { damping: 11, stiffness: 140 });
    flip.value = withDelay(
      280,
      withSequence(
        withTiming(0.5, { duration: 220, easing: Easing.in(Easing.cubic) }),
        withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) }),
      ),
    );
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: motion.duration.reveal * 2 }),
        withTiming(0.45, { duration: motion.duration.reveal * 2 }),
      ),
      -1,
      false,
    );

    const t = setTimeout(() => setShowRewards(true), 900);
    return () => clearTimeout(t);
  }, [enterScale, enterY, flip, glow, motion.duration.reveal, reduceMotion]);

  const cardStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flip.value, [0, 0.5, 1], [-18, 90, 0]);
    return {
      transform: [
        { perspective: 900 },
        { translateY: enterY.value },
        { scale: enterScale.value },
        { rotateY: `${rotateY}deg` },
      ],
    };
  });

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.22 + glow.value * 0.4,
    transform: [{ scale: 0.9 + glow.value * 0.16 }],
  }));

  const cardW = spacing[96] + spacing[80];

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[24],
        paddingVertical: spacing[8] }}
    >
      <OnboardingConfetti />

      <Animated.View
        entering={reduceMotion ? undefined : FadeInUp.delay(40).springify().damping(16)}
        style={{ alignItems: 'center', gap: spacing[4] }}
      >
        <Text
          variant="headline"
          color="textBrand"
          align="center"
        >
          Nouveau chat !
        </Text>
      </Animated.View>

      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: cardW + spacing[48],
              height: cardW + spacing[48],
              borderRadius: radius.full,
              backgroundColor: colors.brandSoft,
            },
            glowStyle,
          ]}
        />

        <Animated.View style={cardStyle}>
          <OnboardingCatCard size="compact" showMeta={false} />
        </Animated.View>
      </View>

      {/* Stars */}
      <Animated.View
        entering={reduceMotion ? undefined : FadeIn.delay(700).duration(motion.duration.slow)}
      >
        <Text variant="body" color="textBrand" align="center" style={{ letterSpacing: 4 }}>
          ★ ★ ★ ★ ★
        </Text>
      </Animated.View>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing[8],
          justifyContent: 'center',
          alignSelf: 'stretch',
          minHeight: spacing[80] }}
      >
        {showRewards
          ? REWARDS.map((item, index) => (
              <RewardPop key={item.id} label={item.label} glyph={item.glyph} index={index} />
            ))
          : null}
      </View>
    </View>
  );
}

function RewardPop({
  label,
  glyph,
  index,
}: {
  label: string;
  glyph: 'xp' | 'badge' | 'paw' | 'book';
  index: number;
}) {
  const { colors, spacing, radius, shadow, motion } = useTheme();
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(reduceMotion ? 1 : 0.55);

  useEffect(() => {
    if (reduceMotion) return;
    scale.value = withDelay(
      index * 160,
      withSequence(
        withSpring(1.12, { damping: 9, stiffness: 210 }),
        withTiming(1, { duration: motion.duration.fast }),
      ),
    );
    if (Platform.OS !== 'web') {
      const t = setTimeout(() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }, index * 160);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [index, motion.duration.fast, reduceMotion, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={
        reduceMotion
          ? undefined
          : FadeInDown.delay(index * 140).duration(motion.duration.normal)
      }
      style={style}
    >
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing[8],
            paddingVertical: spacing[8],
            paddingHorizontal: spacing[16],
            borderRadius: radius.full,
            backgroundColor: 'rgba(255,255,255,0.92)',
            borderWidth: 1,
            borderColor: colors.border,
          },
          shadow.low,
        ]}
      >
        <View
          style={{
            width: spacing[24],
            height: spacing[24],
            borderRadius: radius.full,
            backgroundColor: colors.brandSoft,
            alignItems: 'center',
            justifyContent: 'center' }}
        >
          <Glyph name={glyph} color={colors.brand} size={14} />
        </View>
        <Text variant="bodySmall" weight="semibold" color="textBrand">
          {label}
        </Text>
      </View>
    </Animated.View>
  );
}

function OnboardingConfetti() {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const pieces = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: 4 + ((i * 17) % 90),
        delay: (i % 9) * 45,
        color: [colors.brand, colors.orange, colors.success, colors.rose, colors.yellow][
          i % 5
        ]!,
        size: 5 + (i % 4) * 2,
      })),
    [colors.brand, colors.orange, colors.rose, colors.success, colors.yellow],
  );

  if (reduceMotion) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((piece) => (
        <ConfettiPiece key={piece.id} {...piece} />
      ))}
    </View>
  );
}

function ConfettiPiece({
  left,
  delay,
  color,
  size,
}: {
  left: number;
  delay: number;
  color: string;
  size: number;
}) {
  const y = useSharedValue(-30);
  const opacity = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    y.value = withDelay(delay, withTiming(460, { duration: 1600 + delay }));
    opacity.value = withDelay(delay, withTiming(0, { duration: 1600 + delay }));
    rotate.value = withDelay(delay, withTiming(220 + delay, { duration: 1500 }));
  }, [delay, opacity, rotate, y]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }, { rotate: `${rotate.value}deg` }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      entering={FadeIn.delay(delay)}
      style={[
        {
          position: 'absolute',
          top: 16,
          left: `${left}%`,
          width: size,
          height: size * 1.4,
          borderRadius: 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}
