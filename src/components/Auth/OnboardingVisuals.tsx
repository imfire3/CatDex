import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, type ReactNode } from 'react';
import { Image, Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { Text } from '@/components/Text';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme/ThemeProvider';

const DEMO_CAT = require('../../../assets/world-cats/miel.jpg');

export type OnboardingGlyph = 'paw' | 'capture' | 'star';

type SoftKey = 'brandSoft' | 'orangeSoft' | 'roseSoft';
type TintKey = 'brand' | 'orange' | 'rose';

function Glyph({
  name,
  color,
  size = 28,
}: {
  name: OnboardingGlyph;
  color: string;
  size?: number;
}) {
  if (name === 'paw') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 18.5c-2.6 0-4.7-1.4-4.7-2.8 0-.8.9-1.2 1.8-.9.6.2 1.4.4 2.9.4s2.3-.2 2.9-.4c.9-.3 1.8.1 1.8.9 0 1.4-2.1 2.8-4.7 2.8Z"
          fill={color}
        />
        <Circle cx="7.2" cy="11.2" r="1.9" fill={color} />
        <Circle cx="16.8" cy="11.2" r="1.9" fill={color} />
        <Circle cx="9.4" cy="7.4" r="1.7" fill={color} />
        <Circle cx="14.6" cy="7.4" r="1.7" fill={color} />
      </Svg>
    );
  }

  if (name === 'capture') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={2.2} />
        <Path d="M3 12h18" stroke={color} strokeWidth={2.2} />
        <Circle cx="12" cy="12" r="3.4" fill={color} />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3.2 13.9 8.6l5.7.5-4.3 3.7 1.3 5.5L12 15.6 7.4 18.3l1.3-5.5L4.4 9.1l5.7-.5L12 3.2Z"
        fill={color}
      />
    </Svg>
  );
}

/** Illustrated badge — soft fill, sparkles, elevation. */
export function OnboardingIconBadge({
  glyph,
  softKey,
  tintKey,
  size = 56,
}: {
  glyph: OnboardingGlyph;
  softKey: SoftKey;
  tintKey: TintKey;
  size?: number;
}) {
  const { colors, radius, shadow, spacing } = useTheme();
  const sparkle = colors[tintKey];

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: radius.full,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: 'center',
          justifyContent: 'center',
        },
        shadow.low,
      ]}
    >
      <LinearGradient
        colors={[colors[softKey], colors.surfaceElevated]}
        style={StyleSheet.absoluteFill}
      />
      <View style={{ position: 'absolute', top: spacing[4], right: spacing[8] }}>
        <Svg width={8} height={8} viewBox="0 0 8 8">
          <Path
            d="M4 0 L4.6 3.4 L8 4 L4.6 4.6 L4 8 L3.4 4.6 L0 4 L3.4 3.4 Z"
            fill={sparkle}
            opacity={0.7}
          />
        </Svg>
      </View>
      <View style={{ position: 'absolute', bottom: spacing[8], left: spacing[8] }}>
        <Svg width={6} height={6} viewBox="0 0 8 8">
          <Path
            d="M4 0 L4.6 3.4 L8 4 L4.6 4.6 L4 8 L3.4 4.6 L0 4 L3.4 3.4 Z"
            fill={sparkle}
            opacity={0.4}
          />
        </Svg>
      </View>
      <Glyph name={glyph} color={colors[tintKey]} />
    </View>
  );
}

/** Map sighting preview — show a nearby cat instead of explaining GPS. */
export function OnboardingSightingPreview() {
  const { colors, fonts, spacing, radius, shadow } = useTheme();

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="Chat aperçu à Belleville, 150 mètres"
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing[16],
          padding: spacing[8],
          paddingRight: spacing[16],
          borderRadius: radius.cta,
          backgroundColor: colors.surfaceElevated,
          borderWidth: 1,
          borderColor: colors.border,
        },
        shadow.low,
      ]}
    >
      <Image
        source={DEMO_CAT}
        style={{
          width: spacing[64],
          height: spacing[64],
          borderRadius: radius[8],
          backgroundColor: colors.surfaceSecondary,
        }}
      />
      <View style={{ flex: 1, gap: spacing[4] }}>
        <Text variant="caption" color="textMuted">
          Chat aperçu
        </Text>
        <Text variant="h3" color="text">
          Belleville
        </Text>
        <Text
          variant="bodySmall"
          color="textBrand"
          style={{ fontFamily: fonts.bodySemi }}
        >
          📍 150 m
        </Text>
      </View>
      <OnboardingIconBadge glyph="paw" softKey="brandSoft" tintKey="brand" size={40} />
    </View>
  );
}

/** Capture / scan preview with recognition score. */
export function OnboardingScanPreview() {
  const { colors, fonts, spacing, radius, shadow } = useTheme();

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="Découverte en cours, 95 pourcent de confiance"
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing[16],
          padding: spacing[8],
          paddingRight: spacing[16],
          borderRadius: radius.cta,
          backgroundColor: colors.surfaceElevated,
          borderWidth: 1,
          borderColor: colors.border,
        },
        shadow.low,
      ]}
    >
      <View
        style={{
          width: spacing[64],
          height: spacing[64],
          borderRadius: radius[8],
          overflow: 'hidden',
          borderWidth: 2,
          borderColor: colors.orange,
        }}
      >
        <Image source={DEMO_CAT} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        <View
          style={{
            position: 'absolute',
            top: spacing[4],
            left: spacing[4],
            right: spacing[4],
            bottom: spacing[4],
            borderWidth: 1,
            borderColor: colors.onAccent,
            borderRadius: radius[8],
            opacity: 0.7,
          }}
        />
      </View>
      <View style={{ flex: 1, gap: spacing[4] }}>
        <Text variant="h3" color="text">
          Découverte
        </Text>
        <Text
          variant="bodySmall"
          color="textBrand"
          style={{ fontFamily: fonts.bodySemi }}
        >
          95 % de confiance
        </Text>
        <Text variant="caption" color="textBody">
          Roux · Européen
        </Text>
      </View>
      <OnboardingIconBadge glyph="capture" softKey="orangeSoft" tintKey="orange" size={40} />
    </View>
  );
}

/** Mini CatDex card — show collection reward instead of explaining it. */
export function OnboardingMiniDexPreview() {
  const { colors, fonts, spacing, radius, shadow } = useTheme();

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="Carte CatDex Miel, numéro 42, Rare Belleville"
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing[16],
          padding: spacing[8],
          paddingRight: spacing[16],
          borderRadius: radius.cta,
          backgroundColor: colors.surfaceElevated,
          borderWidth: 1,
          borderColor: colors.border,
        },
        shadow.low,
      ]}
    >
      <View
        style={{
          width: spacing[64],
          height: spacing[80],
          borderRadius: radius[8],
          overflow: 'hidden',
          borderWidth: 2,
          borderColor: colors.brand,
          backgroundColor: colors.surfaceSecondary,
        }}
      >
        <Image source={DEMO_CAT} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(21,23,43,0.72)']}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: spacing[32],
            justifyContent: 'flex-end',
            paddingHorizontal: spacing[4],
            paddingBottom: spacing[4],
          }}
        >
          <Text
            variant="caption"
            color="onAccent"
            style={{ fontFamily: fonts.bodySemi }}
          >
            #042
          </Text>
        </LinearGradient>
      </View>
      <View style={{ flex: 1, gap: spacing[4] }}>
        <Text variant="caption" color="textMuted">
          Nom généré
        </Text>
        <Text variant="h3" color="text">
          Miel
        </Text>
        <Text
          variant="bodySmall"
          color="textBrand"
          style={{ fontFamily: fonts.bodySemi }}
        >
          #042
        </Text>
        <Text variant="caption" color="textBody">
          Rare · Belleville
        </Text>
      </View>
      <OnboardingIconBadge glyph="star" softKey="roseSoft" tintKey="rose" size={40} />
    </View>
  );
}

/** Pulsing radar / paw hero for onboarding tops. */
export function OnboardingRadarHero({
  label = 'Radar félin',
}: {
  label?: string;
}) {
  const { colors, spacing, radius, shadow } = useTheme();
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(0.55);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.55, { duration: 1000 }),
      ),
      -1,
      false,
    );
  }, [pulse, reduceMotion]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: pulse.value * 0.4,
    transform: [{ scale: 0.8 + pulse.value * 0.4 }],
  }));

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={label}
      style={{
        alignSelf: 'center',
        width: spacing[96],
        height: spacing[96],
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: spacing[96],
            height: spacing[96],
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
            width: spacing[80],
            height: spacing[80],
            borderRadius: radius.full,
            borderWidth: 1.5,
            borderColor: colors.brand,
            opacity: 0.35,
          },
          ringStyle,
        ]}
      />
      <View
        style={[
          {
            width: spacing[64],
            height: spacing[64],
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
        <Glyph name="paw" color={colors.brand} size={32} />
      </View>
    </View>
  );
}

type StoryBeatProps = {
  label: string;
  delay?: number;
  children: ReactNode;
  showConnector?: boolean;
};

/** One beat of the visual storyboard. */
export function OnboardingStoryBeat({
  label,
  delay = 0,
  children,
  showConnector = true,
}: StoryBeatProps) {
  const { fonts, spacing, motion } = useTheme();
  const reduceMotion = useReducedMotion();
  const entering = reduceMotion
    ? undefined
    : FadeInDown.delay(delay).duration(motion.duration.normal);

  return (
    <Animated.View entering={entering} style={{ gap: spacing[8], alignSelf: 'stretch' }}>
      <Text
        variant="bodySmall"
        color="text"
        align="center"
        style={{ fontFamily: fonts.bodySemi }}
      >
        {label}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          if (Platform.OS !== 'web') {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }}
      >
        {children}
      </Pressable>
      {showConnector ? (
        <Text variant="caption" color="textBrand" align="center">
          ↓
        </Text>
      ) : null}
    </Animated.View>
  );
}

type GameCardProps = {
  glyph: OnboardingGlyph;
  softKey: SoftKey;
  tintKey: TintKey;
  title: string;
  stat: string;
  meta?: string;
  delay?: number;
  onPress?: () => void;
};

/** Interactive gameplay card — lift + brand halo on press. */
export function OnboardingGameCard({
  glyph,
  softKey,
  tintKey,
  title,
  stat,
  meta,
  delay = 0,
  onPress,
}: GameCardProps) {
  const { colors, fonts, spacing, radius, shadow, motion } = useTheme();
  const reduceMotion = useReducedMotion();
  const entering = reduceMotion
    ? undefined
    : FadeInDown.delay(delay).duration(motion.duration.normal);

  return (
    <Animated.View entering={entering}>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          if (Platform.OS !== 'web') {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          onPress?.();
        }}
        style={({ pressed }) => ({
          borderRadius: radius.cta,
          transform: [{ scale: pressed ? motion.pressScale : 1 }],
          backgroundColor: pressed ? colors.brandSoft : 'transparent',
          overflow: 'hidden' as const,
        })}
      >
        <View
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing[16],
              padding: spacing[16],
              borderRadius: radius.cta,
              backgroundColor: colors.surfaceElevated,
              borderWidth: 1,
              borderColor: colors.border,
            },
            shadow.low,
          ]}
        >
          <OnboardingIconBadge glyph={glyph} softKey={softKey} tintKey={tintKey} />
          <View style={{ flex: 1, gap: spacing[4], minWidth: 0 }}>
            <Text variant="h3" color="text">
              {title}
            </Text>
            <Text
              variant="bodySmall"
              color="textBrand"
              style={{ fontFamily: fonts.bodySemi }}
            >
              {stat}
            </Text>
            {meta ? (
              <Text variant="caption" color="textBody">
                {meta}
              </Text>
            ) : null}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

/** Compact white reward chips (not a heavy violet banner). */
export function OnboardingRewardRow({
  items,
}: {
  items: { label: string; value: string }[];
}) {
  const { colors, fonts, spacing, radius } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing[8],
        justifyContent: 'center',
        alignSelf: 'stretch',
      }}
    >
      {items.map((item) => (
        <View
          key={item.label}
          style={{
            minWidth: '28%',
            flexGrow: 1,
            paddingVertical: spacing[8],
            paddingHorizontal: spacing[8],
            borderRadius: radius[8],
            backgroundColor: colors.surfaceElevated,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
            gap: spacing[4],
          }}
        >
          <Text
            variant="body"
            color="textBrand"
            align="center"
            style={{ fontFamily: fonts.bodySemi }}
          >
            {item.value}
          </Text>
          <Text variant="caption" color="textBody" align="center">
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Soft pulse wrapper for primary onboarding CTAs. */
export function OnboardingPulseCta({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 780 }),
        withTiming(1, { duration: 780 }),
      ),
      -1,
      false,
    );
  }, [pulse, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  if (reduceMotion) return <>{children}</>;
  return <Animated.View style={style}>{children}</Animated.View>;
}
