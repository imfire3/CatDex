import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
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
import Svg, { Circle, Path } from 'react-native-svg';

import { Text } from '@/components/Text';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme/ThemeProvider';

const SCAN_ROWS = [
  { id: 'breed', label: 'Race', value: 'Européen' },
  { id: 'color', label: 'Couleur', value: 'Roux' },
  { id: 'coat', label: 'Pelage', value: 'Court' },
  { id: 'confidence', label: 'Confiance', value: '95 %' },
] as const;

/**
 * Écran 2 — la caméra / l’IA est le héros.
 * Cercle de scan → révélation progressive des traits + checks verts.
 */
export function ScanScene() {
  const { colors, fonts, spacing, radius, shadow, motion } = useTheme();
  const reduceMotion = useReducedMotion();
  const [revealed, setRevealed] = useState(reduceMotion ? SCAN_ROWS.length : 0);

  const sweep = useSharedValue(0);
  const ring = useSharedValue(0.7);

  useEffect(() => {
    if (reduceMotion) return;
    ring.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.7, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    sweep.value = withRepeat(
      withTiming(1, { duration: 2200, easing: Easing.linear }),
      -1,
      false,
    );
  }, [reduceMotion, ring, sweep]);

  useEffect(() => {
    if (reduceMotion) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    SCAN_ROWS.forEach((_, index) => {
      timers.push(
        setTimeout(() => {
          setRevealed(index + 1);
          if (Platform.OS !== 'web') {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }, 700 + index * 520),
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [reduceMotion]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + ring.value * 0.4,
    transform: [{ scale: 0.9 + ring.value * 0.12 }],
  }));

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sweep.value * 360}deg` }],
  }));

  const camSize = spacing[96] + spacing[24];

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
      <Animated.View
        entering={reduceMotion ? undefined : FadeIn.duration(motion.duration.reveal)}
        style={{
          width: camSize + spacing[48],
          height: camSize + spacing[48],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: camSize + spacing[40],
              height: camSize + spacing[40],
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
              width: camSize + spacing[16],
              height: camSize + spacing[16],
              borderRadius: radius.full,
              borderWidth: 2,
              borderColor: colors.brandSoft,
              borderStyle: 'dashed',
            },
            sweepStyle,
          ]}
        />

        <View
          style={[
            {
              width: camSize,
              height: camSize,
              borderRadius: radius.full,
              backgroundColor: colors.surfaceElevated,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            },
            shadow.medium,
          ]}
        >
          <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
            <Path
              d="M4 8.5A2.5 2.5 0 0 1 6.5 6h2.1l1.2-1.8A1.5 1.5 0 0 1 11.05 3.5h1.9a1.5 1.5 0 0 1 1.25.7L15.4 6h2.1A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z"
              stroke={colors.brand}
              strokeWidth={1.8}
              strokeLinejoin="round"
            />
            <Circle cx="12" cy="12.5" r="3.2" stroke={colors.brand} strokeWidth={1.8} />
          </Svg>
        </View>
      </Animated.View>

      <Animated.View
        entering={reduceMotion ? undefined : FadeInUp.delay(200).springify().damping(16)}
        style={{ gap: spacing[8], alignItems: 'center' }}
      >
        <Text
          variant="h1"
          color="textBrand"
          align="center"
          style={{ fontFamily: fonts.display }}
        >
          L’IA révèle son identité
        </Text>
      </Animated.View>

      <View style={{ alignSelf: 'stretch', gap: spacing[8], maxWidth: 320, width: '100%' }}>
        {SCAN_ROWS.map((row, index) => {
          const visible = index < revealed;
          return (
            <ScanRow
              key={row.id}
              label={row.label}
              value={row.value}
              visible={visible}
            />
          );
        })}
      </View>
    </View>
  );
}

function ScanRow({
  label,
  value,
  visible,
}: {
  label: string;
  value: string;
  visible: boolean;
}) {
  const { colors, fonts, spacing, radius, shadow, motion } = useTheme();
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(visible || reduceMotion ? 1 : 0.92);
  const opacity = useSharedValue(visible || reduceMotion ? 1 : 0.35);

  useEffect(() => {
    if (reduceMotion) return;
    if (visible) {
      opacity.value = withTiming(1, { duration: motion.duration.fast });
      scale.value = withSpring(1, { damping: 12, stiffness: 180 });
    }
  }, [motion.duration.fast, opacity, reduceMotion, scale, visible]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={
        reduceMotion || !visible
          ? undefined
          : FadeInDown.delay(40).duration(motion.duration.normal)
      }
      style={[
        style,
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing[16],
          paddingVertical: spacing[8],
          paddingHorizontal: spacing[16],
          borderRadius: radius.cta,
          backgroundColor: colors.surfaceElevated,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: visible ? colors.success : colors.border,
        },
        shadow.low,
      ]}
    >
      <View style={{ flex: 1, gap: spacing[4] }}>
        <Text variant="caption" color="textMuted">
          {label}
        </Text>
        <Text
          variant="body"
          color={visible ? 'text' : 'textMuted'}
          style={{ fontFamily: fonts.bodySemi }}
        >
          {visible ? value : 'Analyse…'}
        </Text>
      </View>
      <View
        style={{
          width: spacing[32],
          height: spacing[32],
          borderRadius: radius.full,
          backgroundColor: visible ? colors.successSoft : colors.surfaceSecondary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {visible ? (
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path
              d="M5 12.5 9.5 17 19 7.5"
              stroke={colors.success}
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        ) : (
          <View
            style={{
              width: spacing[8],
              height: spacing[8],
              borderRadius: radius.full,
              backgroundColor: colors.border,
            }}
          />
        )}
      </View>
    </Animated.View>
  );
}
