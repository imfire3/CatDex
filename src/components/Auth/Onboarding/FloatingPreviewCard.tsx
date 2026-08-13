import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/Text';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme/ThemeProvider';

import { DEMO_CAT_IMAGE } from './demoCat';

export type FloatingPreviewVariant = 'sighting' | 'analysis' | 'dex';

type FloatingPreviewCardProps = {
  variant: FloatingPreviewVariant;
  delay?: number;
  /** Soft float animation */
  float?: boolean;
};

/**
 * Preview flottante compacte — remplace les grosses cards.
 * Ombre légère, format capsule visuelle.
 */
export function FloatingPreviewCard({
  variant,
  delay = 0,
  float = true,
}: FloatingPreviewCardProps) {
  const { colors, spacing, radius, shadow, motion } = useTheme();
  const reduceMotion = useReducedMotion();
  const floatY = useSharedValue(0);
  const floatDuration = motion.duration.reveal * 3 + motion.duration.slow;

  useEffect(() => {
    if (reduceMotion || !float) return;
    floatY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-3, { duration: floatDuration, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: floatDuration, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, float, floatDuration, floatY, reduceMotion]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const entering = reduceMotion
    ? undefined
    : FadeInDown.delay(delay).duration(motion.duration.slow);

  const thumb = spacing[48];

  const content =
    variant === 'sighting' ? (
      <>
        <View
          style={{
            width: thumb,
            height: thumb,
            borderRadius: radius[8],
            overflow: 'hidden',
            backgroundColor: colors.surfaceSecondary }}
        >
          <Image
            source={DEMO_CAT_IMAGE}
            resizeMode="cover"
            style={{ width: thumb, height: thumb }}
            accessibilityIgnoresInvertColors
          />
        </View>
        <View style={{ flex: 1, gap: spacing[4], minWidth: 0 }}>
          <Text variant="bodySmall" weight="semibold" color="text">
            Belleville
          </Text>
          <Text variant="caption" weight="semibold" color="textBrand">
            150 m
          </Text>
        </View>
      </>
    ) : variant === 'analysis' ? (
      <>
        <View
          style={{
            width: thumb,
            height: thumb,
            borderRadius: radius.full,
            backgroundColor: colors.brandSoft,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border }}
        >
          <Text variant="bodySmall" weight="semibold" color="textBrand">
            95 %
          </Text>
        </View>
        <View style={{ flex: 1, gap: spacing[4], minWidth: 0 }}>
          <Text variant="bodySmall" weight="semibold" color="text">
            Analyse IA
          </Text>
          <Text variant="caption" color="textSecondary">
            Européen
          </Text>
        </View>
      </>
    ) : (
      <>
        <View
          style={{
            width: spacing[40],
            height: spacing[56],
            borderRadius: radius[8],
            overflow: 'hidden',
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.brand,
            backgroundColor: colors.surfaceSecondary }}
        >
          <Image
            source={DEMO_CAT_IMAGE}
            resizeMode="cover"
            style={{ width: spacing[40], height: spacing[56] }}
            accessibilityIgnoresInvertColors
          />
          <LinearGradient
            colors={['transparent', 'rgba(21,23,43,0.7)']}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: spacing[24],
              justifyContent: 'flex-end',
              paddingHorizontal: spacing[4],
              paddingBottom: spacing[4] }}
          >
            <Text variant="caption" weight="semibold" color="onAccent">
              #001
            </Text>
          </LinearGradient>
        </View>
        <View style={{ flex: 1, gap: spacing[4], minWidth: 0 }}>
          <Text variant="caption" color="textMuted">
            #001
          </Text>
          <Text variant="bodySmall" weight="semibold" color="text">
            Miel
          </Text>
          <Text variant="caption" weight="semibold" color="textBrand">
            Rare
          </Text>
        </View>
      </>
    );

  const a11y =
    variant === 'sighting'
      ? 'Chat aperçu à Belleville, 150 mètres'
      : variant === 'analysis'
        ? 'Analyse IA, 95 pourcent, Européen'
        : 'Carte CatDex numéro 001, Miel, Rare';

  return (
    <Animated.View entering={entering} style={[floatStyle, { alignSelf: 'stretch' }]}>
      <View
        accessibilityRole="image"
        accessibilityLabel={a11y}
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing[16],
            paddingVertical: spacing[8],
            paddingHorizontal: spacing[8],
            paddingRight: spacing[16],
            borderRadius: radius[8],
            backgroundColor: colors.surfaceElevated,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border,
            alignSelf: 'stretch',
          },
          shadow.low,
        ]}
      >
        {content}
      </View>
    </Animated.View>
  );
}
