import { Redirect, router } from 'expo-router';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { getPostAuthHref, useAuthStore } from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

const { width: SCREEN_W } = Dimensions.get('window');

function Star({ x, y, size = 10, color }: { x: number; y: number; size?: number; color: string }) {
  return (
    <Path
      d={`M${x} ${y - size / 2} L${x + size * 0.12} ${y - size * 0.12} L${x + size / 2} ${y} L${x + size * 0.12} ${y + size * 0.12} L${x} ${y + size / 2} L${x - size * 0.12} ${y + size * 0.12} L${x - size / 2} ${y} L${x - size * 0.12} ${y - size * 0.12} Z`}
      fill={color}
      opacity={0.55}
    />
  );
}

function JoinAtmosphere() {
  const { colors } = useTheme();
  const fill = colors.brandSoft;
  const line = colors.brandSoft;
  const skyline = colors.brandSoft;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[colors.background, colors.surface, colors.background]}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: colors.brandSoft, opacity: 0.55 },
        ]}
      />

      <Svg
        width={SCREEN_W}
        height="100%"
        viewBox={`0 0 ${SCREEN_W} 800`}
        style={StyleSheet.absoluteFill}
        preserveAspectRatio="xMidYMid slice"
      >
        <Star x={SCREEN_W * 0.12} y={70} size={14} color={colors.brand} />
        <Star x={SCREEN_W * 0.28} y={48} size={8} color={colors.brand} />
        <Star x={SCREEN_W * 0.72} y={62} size={12} color={colors.brand} />
        <Star x={SCREEN_W * 0.88} y={90} size={9} color={colors.brand} />

        <Ellipse cx={SCREEN_W * 0.18} cy={110} rx={42} ry={18} fill={fill} />
        <Ellipse cx={SCREEN_W * 0.28} cy={110} rx={28} ry={14} fill={fill} />
        <Ellipse cx={SCREEN_W * 0.78} cy={100} rx={48} ry={20} fill={fill} />
        <Ellipse cx={SCREEN_W * 0.88} cy={100} rx={30} ry={14} fill={fill} />

        <Path
          d={`M0 360 L28 360 L28 310 L48 310 L48 280 L62 280 L62 300 L90 300 L90 250 L110 230 L130 250 L130 300 L160 300 L160 270 L185 270 L185 320 L210 320 L210 290 L235 260 L260 290 L260 330 L290 330 L290 300 L320 300 L320 340 L350 340 L350 280 L375 255 L400 280 L400 350 L430 350 L430 310 L455 310 L455 340 L480 340 L480 300 L510 300 L510 360 L${SCREEN_W} 360 L${SCREEN_W} 400 L0 400 Z`}
          fill={skyline}
        />

        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <Path
            key={`h-${i}`}
            d={`M0 ${420 + i * 48} Q${SCREEN_W / 2} ${400 + i * 36} ${SCREEN_W} ${420 + i * 48}`}
            stroke={line}
            strokeWidth={1.5}
            fill="none"
          />
        ))}
        {[0.15, 0.3, 0.45, 0.55, 0.7, 0.85].map((t) => (
          <Path
            key={`v-${t}`}
            d={`M${SCREEN_W * t} 400 L${SCREEN_W * (0.5 + (t - 0.5) * 1.6)} 780`}
            stroke={line}
            strokeWidth={1.5}
            fill="none"
          />
        ))}
      </Svg>
    </View>
  );
}

function PawPulse({ delay = 0, animate = true }: { delay?: number; animate?: boolean }) {
  const { colors } = useTheme();
  const scale = useSharedValue(animate ? 0.75 : 1);
  const opacity = useSharedValue(animate ? 0.4 : 0.35);

  useEffect(() => {
    if (!animate) return;
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.3, { duration: 1400 }),
          withTiming(0.75, { duration: 1400 }),
        ),
        -1,
        false,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.18, { duration: 1400 }),
          withTiming(0.45, { duration: 1400 }),
        ),
        -1,
        false,
      ),
    );
  }, [animate, delay, opacity, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[{ position: 'absolute' }, style]}>
      <Svg width={52} height={52} viewBox="0 0 56 56" fill="none">
        <Circle cx="28" cy="28" r="26" stroke={colors.brand} strokeWidth={2} opacity={0.45} />
        <Circle cx="28" cy="28" r="18" fill={colors.brandSoft} />
        <Path
          d="M28 34c-3.2 0-5.8-1.8-5.8-3.4 0-1 1.1-1.5 2.2-1.1.8.3 1.7.5 3.6.5s2.8-.2 3.6-.5c1.1-.4 2.2.1 2.2 1.1C33.8 32.2 31.2 34 28 34Zm-5.5-8.2c-1.4 0-2.5-1.3-2.5-2.8S21.1 20.2 22.5 20.2s2.5 1.3 2.5 2.8-1.1 2.8-2.5 2.8Zm11 0c-1.4 0-2.5-1.3-2.5-2.8s1.1-2.8 2.5-2.8 2.5 1.3 2.5 2.8-1.1 2.8-2.5 2.8Zm-7.8-4.6c-1.2 0-2.2-1.1-2.2-2.5s1-2.5 2.2-2.5 2.2 1.1 2.2 2.5-1 2.5-2.2 2.5Zm4.6 0c-1.2 0-2.2-1.1-2.2-2.5s1-2.5 2.2-2.5 2.2 1.1 2.2 2.5-1 2.5-2.2 2.5Z"
          fill={colors.brand}
        />
      </Svg>
    </Animated.View>
  );
}

/**
 * Pre-signup mood screen — illustrated atmosphere before the form.
 */
export default function JoinScreen() {
  const { colors, fonts, spacing, motion } = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const user = useAuthStore((state) => state.user);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);

  if (user) {
    return <Redirect href={getPostAuthHref(onboardingCompleted)} />;
  }

  const enter = reduceMotion ? undefined : FadeIn.duration(motion.duration.slow);
  const enterCopy = reduceMotion
    ? undefined
    : FadeInDown.delay(80).duration(motion.duration.slow);
  const enterCta = reduceMotion
    ? undefined
    : FadeInUp.delay(180).duration(motion.duration.normal);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Animated.View entering={enter} style={StyleSheet.absoluteFill} pointerEvents="none">
        <JoinAtmosphere />

        <View style={[styles.pulse, { top: '58%', left: '62%' }]}>
          <PawPulse delay={0} animate={!reduceMotion} />
        </View>
        <View style={[styles.pulse, { top: '66%', left: '32%' }]}>
          <PawPulse delay={450} animate={!reduceMotion} />
        </View>
        <View style={[styles.pulse, { top: '54%', left: '18%' }]}>
          <PawPulse delay={900} animate={!reduceMotion} />
        </View>
      </Animated.View>

      <Animated.View
        entering={enterCopy}
        style={[
          styles.hero,
          {
            paddingHorizontal: spacing[24],
            paddingTop: insets.top + spacing[48],
            gap: spacing[8],
          },
        ]}
      >
        <Text
          variant="h1"
          color="textBrand"
          align="center"
          style={{ fontFamily: fonts.display }}
        >
          Rejoins CatDex
        </Text>
        <Text variant="body" color="textSecondary" align="center">
          Commence ton aventure.{'\n'}Capture ton premier chat aujourd’hui.
        </Text>
      </Animated.View>

      <Animated.View
        entering={enterCta}
        style={{
          marginTop: 'auto',
          paddingHorizontal: spacing[24],
          paddingBottom: Math.max(insets.bottom, spacing[24]),
          gap: spacing[8],
        }}
      >
        <Button title="Suivant" onPress={() => router.push('/(auth)/signup')} />
        <Button
          variant="secondary"
          title="Retour"
          onPress={() => router.replace('/(auth)/welcome')}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  pulse: {
    position: 'absolute',
    width: 52,
    height: 52,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
