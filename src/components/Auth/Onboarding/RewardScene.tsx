import { useEffect, useMemo } from 'react';
import { Image, Platform, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
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

import { Glyph } from './glyphs';

const DEMO_CAT = require('../../../../assets/onboarding-demo-cat.jpg');

const REWARDS = [
  { id: 'xp', label: '+85 XP', glyph: 'xp' as const },
  { id: 'badge', label: 'Premier badge', glyph: 'badge' as const },
  { id: 'dex', label: 'CatDex débloqué', glyph: 'book' as const },
];

/**
 * Écran 3 — explosion de récompenses.
 * Carte qui glisse, numéro, badges, confettis, haptic.
 */
export function RewardScene() {
  const { colors, fonts, spacing, radius, shadow, motion } = useTheme();
  const reduceMotion = useReducedMotion();
  const glow = useSharedValue(0.5);
  const cardY = useSharedValue(reduceMotion ? 0 : 48);
  const cardScale = useSharedValue(reduceMotion ? 1 : 0.9);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    if (reduceMotion) return;
    cardY.value = withSpring(0, { damping: 14, stiffness: 140 });
    cardScale.value = withSpring(1, { damping: 12, stiffness: 160 });
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: motion.duration.reveal * 2 }),
        withTiming(0.5, { duration: motion.duration.reveal * 2 }),
      ),
      -1,
      false,
    );
  }, [cardScale, cardY, glow, motion.duration.reveal, reduceMotion]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardY.value }, { scale: cardScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + glow.value * 0.35,
    transform: [{ scale: 0.92 + glow.value * 0.12 }],
  }));

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[32],
        paddingVertical: spacing[16],
      }}
    >
      <OnboardingConfetti />

      <Animated.View
        entering={reduceMotion ? undefined : FadeInUp.delay(80).springify().damping(16)}
        style={{ gap: spacing[8], alignItems: 'center' }}
      >
        <Text
          variant="h1"
          color="textBrand"
          align="center"
          style={{ fontFamily: fonts.display }}
        >
          Il rejoint ton CatDex
        </Text>
      </Animated.View>

      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: spacing[96] + spacing[64],
              height: spacing[96] + spacing[64],
              borderRadius: radius.full,
              backgroundColor: colors.brandSoft,
            },
            glowStyle,
          ]}
        />

        <Animated.View
          style={[
            cardStyle,
            {
              width: spacing[96] + spacing[96],
              borderRadius: radius.cta,
              overflow: 'hidden',
              backgroundColor: colors.surfaceElevated,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.border,
            },
            shadow.floating,
          ]}
        >
          <View style={{ height: spacing[96] + spacing[64], backgroundColor: colors.surfaceSecondary }}>
            <Image
              source={DEMO_CAT}
              resizeMode="cover"
              style={{ width: '100%', height: '100%' }}
              accessibilityIgnoresInvertColors
            />
            <LinearGradient
              colors={['transparent', 'rgba(21,23,43,0.72)']}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: spacing[48],
                justifyContent: 'flex-end',
                padding: spacing[8],
              }}
            >
              <Text variant="caption" color="onAccent" style={{ fontFamily: fonts.bodySemi }}>
                #001
              </Text>
            </LinearGradient>
          </View>
          <View style={{ padding: spacing[16], gap: spacing[8] }}>
            <Text variant="h3" color="text" style={{ fontFamily: fonts.display }}>
              Miel
            </Text>
            <View
              style={{
                alignSelf: 'flex-start',
                paddingVertical: spacing[4],
                paddingHorizontal: spacing[8],
                borderRadius: radius.full,
                backgroundColor: colors.brandSoft,
              }}
            >
              <Text variant="caption" color="textBrand" style={{ fontFamily: fonts.bodySemi }}>
                Rare
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing[8],
          justifyContent: 'center',
          alignSelf: 'stretch',
        }}
      >
        {REWARDS.map((item, index) => (
          <RewardPop key={item.id} label={item.label} glyph={item.glyph} index={index} />
        ))}
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
  glyph: 'xp' | 'badge' | 'book';
  index: number;
}) {
  const { colors, fonts, spacing, radius, shadow, motion } = useTheme();
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(reduceMotion ? 1 : 0.6);

  useEffect(() => {
    if (reduceMotion) return;
    scale.value = withDelay(
      520 + index * 180,
      withSequence(
        withSpring(1.08, { damping: 10, stiffness: 200 }),
        withTiming(1, { duration: motion.duration.fast }),
      ),
    );
    if (Platform.OS !== 'web') {
      const t = setTimeout(() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 520 + index * 180);
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
          : FadeInDown.delay(500 + index * 160).duration(motion.duration.normal)
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
            backgroundColor: colors.surfaceElevated,
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
            justifyContent: 'center',
          }}
        >
          <Glyph name={glyph} color={colors.brand} size={14} />
        </View>
        <Text variant="bodySmall" color="textBrand" style={{ fontFamily: fonts.bodySemi }}>
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
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        left: 6 + ((i * 19) % 88),
        delay: (i % 8) * 50,
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
  const y = useSharedValue(-24);
  const opacity = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    y.value = withDelay(delay, withTiming(420, { duration: 1500 + delay }));
    opacity.value = withDelay(delay, withTiming(0, { duration: 1500 + delay }));
    rotate.value = withDelay(delay, withTiming(200 + delay, { duration: 1400 }));
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
          top: 24,
          left: `${left}%`,
          width: size,
          height: size * 1.35,
          borderRadius: 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}
