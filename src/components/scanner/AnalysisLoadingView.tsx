import { useCallback, useEffect, useMemo, useRef, useState, memo, type ReactNode } from 'react';
import { Image, Platform, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { AuthBackButton } from '@/components/Auth/AuthChrome';
import { ProgressBar } from '@/components/Progress';
import { Text } from '@/components/Text';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme/ThemeProvider';

const ANALYSIS_STEPS = [
  'Repérage du chat',
  'Qualité de la photo',
  'Race & pelage',
  'Pose & environnement',
  'Nom CatDex',
] as const;

const TIPS = [
  'Les chats roux sont majoritairement des mâles.',
  'Les yeux des chatons changent de couleur en grandissant.',
  'Certains chats reconnaissent leur prénom.',
  'Les chats utilisent leur queue pour communiquer.',
  'Un chat dort en moyenne 12 à 16 heures par jour.',
  'Chaque chat a des caractéristiques uniques, comme nous !',
] as const;

const WAITING_MESSAGES = [
  'On peaufine les détails…',
  'Encore quelques secondes…',
  'Presque prêt…',
  'On finalise la fiche…',
] as const;

type Props = {
  photoUri?: string;
  onBack?: () => void;
};

function progressForElapsedMs(elapsedMs: number): number {
  if (elapsedMs <= 0) return 0.12;
  if (elapsedMs < 2_500) {
    return 0.12 + 0.78 * (1 - Math.exp(-elapsedMs / 900));
  }
  const extra = elapsedMs - 2_500;
  return Math.min(0.99, 0.9 + 0.09 * (1 - Math.exp(-extra / 8_000)));
}

function StepCheck({ done, active }: { done: boolean; active?: boolean }) {
  const { colors, radius } = useTheme();
  const scale = useSharedValue(done ? 1 : 0.85);

  useEffect(() => {
    if (!done) return;
    scale.value = withSequence(
      withTiming(1.2, { duration: 140 }),
      withTiming(1, { duration: 160 }),
    );
  }, [done, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (done) {
    return (
      <Animated.View
        style={[
          {
            width: 22,
            height: 22,
            borderRadius: radius.full,
            backgroundColor: colors.success,
            alignItems: 'center',
            justifyContent: 'center',
          },
          animStyle,
        ]}
      >
        <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
          <Path
            d="M5 12l5 5L19 7"
            stroke={colors.onAccent}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Animated.View>
    );
  }

  return (
    <View
      style={{
        width: 22,
        height: 22,
        borderRadius: radius.full,
        backgroundColor: active ? colors.brandSoft : colors.surfaceTertiary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: radius.full,
          backgroundColor: active ? colors.brand : colors.textMuted,
        }}
      />
    </View>
  );
}

function OrbitSparkle({
  size,
  orbit,
  duration,
  phase = 0,
}: {
  size: number;
  orbit: number;
  duration: number;
  phase?: number;
}) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const spin = useSharedValue(phase);

  useEffect(() => {
    if (reduceMotion) return;
    spin.value = phase;
    spin.value = withRepeat(
      withTiming(phase + 1, { duration, easing: Easing.linear }),
      -1,
      false,
    );
    return () => {
      cancelAnimation(spin);
    };
  }, [duration, phase, reduceMotion, spin]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: 100 - size / 2,
          top: 100 - size / 2,
          width: size,
          height: size,
        },
        style,
      ]}
    >
      <View style={{ transform: [{ translateY: -orbit }] }}>
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2.5 13.8 9l6.7 1.2-5 4.4 1.4 6.4L12 17.8 7.1 21l1.4-6.4-5-4.4L10.2 9 12 2.5Z"
            fill={colors.brand}
          />
        </Svg>
      </View>
    </Animated.View>
  );
}

const ScanningHero = memo(function ScanningHero({
  photoUri,
  showPhoto,
  onPhotoError,
}: {
  photoUri?: string;
  showPhoto: boolean;
  onPhotoError: () => void;
}) {
  const { colors, radius } = useTheme();
  const reduceMotion = useReducedMotion();
  const rotate = useSharedValue(0);
  const halo = useSharedValue(0.7);
  const scan = useSharedValue(0);
  const photoSource = useMemo(
    () => (photoUri ? { uri: photoUri } : undefined),
    [photoUri],
  );

  useEffect(() => {
    if (reduceMotion) return;
    rotate.value = withRepeat(
      withSequence(
        withTiming(2.5, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        withTiming(-2.5, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    halo.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.65, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    scan.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    return () => {
      cancelAnimation(rotate);
      cancelAnimation(halo);
      cancelAnimation(scan);
    };
  }, [halo, reduceMotion, rotate, scan]);

  const photoStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));
  const haloStyle = useAnimatedStyle(() => ({
    opacity: halo.value * 0.9,
    transform: [{ scale: 0.92 + halo.value * 0.12 }],
  }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + scan.value * 0.45,
    transform: [{ scale: 0.95 + scan.value * 0.08 }],
  }));

  return (
    <View
      style={{
        width: 200,
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: 180,
            height: 180,
            borderRadius: radius.full,
            backgroundColor: colors.brandSoft,
          },
          haloStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: 168,
            height: 168,
            borderRadius: radius.full,
            borderWidth: 2,
            borderColor: colors.brand,
            borderStyle: 'dashed',
          },
          ringStyle,
        ]}
      />
      <OrbitSparkle size={16} orbit={88} duration={4200} phase={0} />
      <OrbitSparkle size={12} orbit={78} duration={3600} phase={0.33} />
      <OrbitSparkle size={14} orbit={92} duration={5000} phase={0.66} />
      <Animated.View
        style={[
          {
            width: 152,
            height: 152,
            borderRadius: radius.full,
            overflow: 'hidden',
            borderWidth: 3,
            borderColor: colors.surface,
            backgroundColor: colors.surfaceSecondary,
          },
          photoStyle,
        ]}
      >
        {showPhoto && photoSource ? (
          <Image
            source={photoSource}
            accessibilityLabel="Photo du chat en cours d’analyse"
            resizeMode="cover"
            fadeDuration={0}
            style={{ width: '100%', height: '100%' }}
            onError={onPhotoError}
          />
        ) : (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.brandSoft,
            }}
          >
            <Text variant="caption" color="textBrand">
              Analyse…
            </Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
});

function ScanStatusLine() {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const timer = setInterval(() => {
      setElapsedMs(Date.now() - startedAt);
    }, 400);
    return () => clearInterval(timer);
  }, []);

  const waiting = elapsedMs >= 2_500;
  const waitingIndex = Math.floor(elapsedMs / 2_200) % WAITING_MESSAGES.length;
  const statusLabel = waiting
    ? WAITING_MESSAGES[waitingIndex]!
    : 'Détection rapide…';

  return (
    <Text variant="caption" color="textSecondary" align="center" numberOfLines={1}>
      {statusLabel}
    </Text>
  );
}

function ScanProgressCard() {
  const { colors, fonts, spacing, radius, shadow } = useTheme();
  const [progress, setProgress] = useState(0.12);
  const prevDoneCount = useRef(0);

  useEffect(() => {
    const startedAt = Date.now();
    const timer = setInterval(() => {
      setProgress(progressForElapsedMs(Date.now() - startedAt));
    }, 250);
    return () => clearInterval(timer);
  }, []);

  const completedSteps = useMemo(() => {
    const thresholds = [0.18, 0.38, 0.58, 0.78, 0.92];
    return ANALYSIS_STEPS.map((_, index) => progress >= (thresholds[index] ?? 1));
  }, [progress]);

  useEffect(() => {
    const doneCount = completedSteps.filter(Boolean).length;
    if (doneCount > prevDoneCount.current && Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    prevDoneCount.current = doneCount;
  }, [completedSteps]);

  const activeIndex = Math.min(
    ANALYSIS_STEPS.length - 1,
    Math.max(0, completedSteps.lastIndexOf(true) + 1),
  );
  const waitingOnApi = progress >= 0.85;
  const percentLabel = `${Math.round(progress * 100)}%`;

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.cta,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing[16],
          gap: spacing[16],
        },
        shadow.low,
      ]}
    >
      <View style={{ gap: spacing[8] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[8] }}>
          <View style={{ flex: 1 }}>
            <ProgressBar progress={progress} height={10} />
          </View>
          <Text
            variant="bodySmall"
            color="textBrand"
            style={{ fontFamily: fonts.bodySemi, minWidth: 40, textAlign: 'right' }}
          >
            {percentLabel}
          </Text>
        </View>
        {waitingOnApi ? (
          <Text variant="caption" color="textMuted">
            Encore un instant si le réseau est lent…
          </Text>
        ) : null}
      </View>

      <View style={{ gap: spacing[16] }}>
        {ANALYSIS_STEPS.map((label, index) => {
          const done = completedSteps[index]!;
          const active = !done && index === activeIndex;
          return (
            <View
              key={label}
              style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[8] }}
            >
              <StepCheck done={done} active={active} />
              <Text
                variant="bodySmall"
                color={done || active ? 'textBrand' : 'textSecondary'}
                style={{
                  fontFamily: done || active ? fonts.bodySemi : fonts.body,
                }}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function ScanTipCard() {
  const { colors, fonts, spacing, radius, shadow } = useTheme();
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((index) => (index + 1) % TIPS.length);
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.cta,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing[16],
          flexDirection: 'row',
          gap: spacing[16],
          alignItems: 'flex-start',
        },
        shadow.low,
      ]}
    >
      <View
        style={{
          width: spacing[40],
          height: spacing[40],
          borderRadius: radius.full,
          backgroundColor: colors.brandSoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 3 13.6 8.4 19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3Z"
            fill={colors.brand}
          />
        </Svg>
      </View>
      <View style={{ flex: 1, gap: spacing[4] }}>
        <Text variant="bodySmall" color="textBrand" style={{ fontFamily: fonts.bodySemi }}>
          Le savais-tu ?
        </Text>
        <Text variant="bodySmall" color="textBody">
          {TIPS[tipIndex]}
        </Text>
      </View>
    </View>
  );
}

function AnalysisTab({
  label,
  active,
  onPress,
  children,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  children: ReactNode;
}) {
  const { colors, fonts, spacing, radius, motion } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: Boolean(active), disabled: !onPress }}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[4],
        opacity: pressed ? 0.85 : 1,
        transform: [{ scale: pressed ? motion.pressScale : 1 }],
      })}
    >
      <View
        style={{
          width: spacing[40],
          height: spacing[40],
          borderRadius: radius.full,
          borderWidth: active ? 2 : 0,
          borderColor: active ? colors.brand : 'transparent',
          backgroundColor: active ? colors.brandSoft : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </View>
      <Text
        variant="caption"
        color={active ? 'textBrand' : 'textMuted'}
        style={{ fontFamily: active ? fonts.bodySemi : fonts.body }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function AnalysisLoadingView({ photoUri, onBack }: Props) {
  const { colors, fonts, spacing, radius, shadow, iconStroke, gradients } = useTheme();
  const insets = useSafeAreaInsets();
  const [photoFailed, setPhotoFailed] = useState(false);
  const handlePhotoError = useCallback(() => setPhotoFailed(true), []);
  const showPhoto =
    Boolean(photoUri) &&
    !photoFailed &&
    Boolean(photoUri && !photoUri.startsWith('blob:'));

  useEffect(() => {
    setPhotoFailed(false);
  }, [photoUri]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[gradients.primarySoft[0], colors.background, colors.background]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View
        style={{
          flex: 1,
          paddingTop: insets.top + spacing[8],
          paddingBottom: insets.bottom + spacing[8],
        }}
      >
        <View
          style={{
            paddingHorizontal: spacing[24],
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: spacing[40],
            marginBottom: spacing[16],
          }}
        >
          <View style={{ zIndex: 1 }}>
            <AuthBackButton
              onPress={() => {
                if (onBack) onBack();
                else if (router.canGoBack()) router.back();
                else router.replace('/(tabs)/map');
              }}
            />
          </View>
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              alignItems: 'center',
              paddingHorizontal: spacing[48],
            }}
          >
            <Text
              variant="h3"
              color="textBrand"
              align="center"
              style={{ fontFamily: fonts.display }}
            >
              Découverte en cours
            </Text>
            <ScanStatusLine />
          </View>
          <View style={{ width: spacing[40] }} />
        </View>

        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            height: 220,
            marginBottom: spacing[16],
          }}
        >
          <ScanningHero
            photoUri={photoUri}
            showPhoto={showPhoto}
            onPhotoError={handlePhotoError}
          />
        </View>

        <View style={{ flex: 1, paddingHorizontal: spacing[24], gap: spacing[16] }}>
          <ScanProgressCard />
          <ScanTipCard />
        </View>

        <View
          style={[
            {
              marginTop: spacing[8],
              marginHorizontal: spacing[16],
              paddingVertical: spacing[8],
              paddingHorizontal: spacing[8],
              borderRadius: radius.cta,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              flexDirection: 'row',
            },
            shadow.low,
          ]}
        >
          <AnalysisTab label="Découverte" active>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M11 4.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Z"
                stroke={colors.brand}
                strokeWidth={iconStroke.regular}
              />
              <Path
                d="M16 16.5 20 20.5"
                stroke={colors.brand}
                strokeWidth={iconStroke.regular}
                strokeLinecap="round"
              />
            </Svg>
          </AnalysisTab>
          <AnalysisTab label="Fiche">
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M7 4h10a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2V6a2 2 0 0 1 2-2Z"
                stroke={colors.textMuted}
                strokeWidth={iconStroke.regular}
                strokeLinejoin="round"
              />
            </Svg>
          </AnalysisTab>
          <AnalysisTab label="Carte" onPress={() => router.replace('/(tabs)/map')}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M4 7.5 9 5l6 2.5L20 5v13.5L15 21l-6-2.5L4 21V7.5Z"
                stroke={colors.textMuted}
                strokeWidth={iconStroke.regular}
                strokeLinejoin="round"
              />
            </Svg>
          </AnalysisTab>
          <AnalysisTab label="Mon CatDex" onPress={() => router.replace('/(tabs)/catdex')}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 18c-3.5 0-6-2.2-6-5.2C6 9.5 8.2 7 10.2 5.6c.7-.5 1.6-.5 2.3 0C14.5 7 16.8 9.5 16.8 12.8 16.8 15.8 14.3 18 12 18Z"
                stroke={colors.textMuted}
                strokeWidth={iconStroke.regular}
                strokeLinejoin="round"
              />
              <Path
                d="M9.5 12a1 1 0 1 0 0.01 0M14.5 12a1 1 0 1 0 0.01 0"
                fill={colors.textMuted}
                stroke={colors.textMuted}
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            </Svg>
          </AnalysisTab>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
