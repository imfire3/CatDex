import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { AuthBackButton } from '@/components/Auth/AuthChrome';
import { ProgressBar } from '@/components/Progress';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

const ANALYSIS_STEPS = [
  'Détection du chat',
  'Qualité de la photo',
  'Type & pelage',
  'Pose & environnement',
  'Nom CatDex',
] as const;

const TIP =
  'Chaque chat a des caractéristiques uniques, comme nous les humains !';

/** Shown once the checklist is done but the API is still working. */
const WAITING_MESSAGES = [
  'L’IA peaufine les détails…',
  'Encore quelques secondes…',
  'Presque prêt…',
  'On finalise la fiche…',
] as const;

type Props = {
  photoUri?: string;
  onBack?: () => void;
};

/**
 * Fake progress tuned for a quick analysis (~2–4s):
 * climbs to ~90% fast, then crawls while the API finishes.
 */
function progressForElapsedMs(elapsedMs: number): number {
  if (elapsedMs <= 0) return 0.12;
  if (elapsedMs < 2_500) {
    // 12% → ~90% in ~2.5s
    return 0.12 + 0.78 * (1 - Math.exp(-elapsedMs / 900));
  }
  const extra = elapsedMs - 2_500;
  // 90% → ~99% while waiting on a slow network / cold start
  return Math.min(0.99, 0.9 + 0.09 * (1 - Math.exp(-extra / 8_000)));
}

function StepCheck({ done, active }: { done: boolean; active?: boolean }) {
  const { colors, radius } = useTheme();

  if (done) {
    return (
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: radius.full,
          backgroundColor: colors.success,
          alignItems: 'center',
          justifyContent: 'center',
        }}
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
      </View>
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

function Sparkle({
  size,
  style,
}: {
  size: number;
  style: { top?: number; left?: number; right?: number; bottom?: number };
}) {
  const { colors } = useTheme();
  return (
    <View pointerEvents="none" style={[{ position: 'absolute', width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 2.5 13.8 9l6.7 1.2-5 4.4 1.4 6.4L12 17.8 7.1 21l1.4-6.4-5-4.4L10.2 9 12 2.5Z"
          fill={colors.brand}
          opacity={0.55}
        />
      </Svg>
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

/**
 * Post-capture analysis UI — light card layout with the scanned photo,
 * progress checklist and tip (product mock).
 */
export function AnalysisLoadingView({ photoUri, onBack }: Props) {
  const { colors, fonts, spacing, radius, shadow, iconStroke, gradients } = useTheme();
  const insets = useSafeAreaInsets();
  const [progress, setProgress] = useState(0.08);
  const [waitingIndex, setWaitingIndex] = useState(0);
  const [photoFailed, setPhotoFailed] = useState(false);
  const showPhoto =
    Boolean(photoUri) &&
    !photoFailed &&
    !photoUri!.startsWith('blob:');

  useEffect(() => {
    setPhotoFailed(false);
  }, [photoUri]);

  useEffect(() => {
    const startedAt = Date.now();
    const timer = setInterval(() => {
      setProgress(progressForElapsedMs(Date.now() - startedAt));
    }, 120);
    return () => clearInterval(timer);
  }, []);

  const isWaitingOnApi = progress >= 0.85;

  useEffect(() => {
    if (!isWaitingOnApi) return;
    const timer = setInterval(() => {
      setWaitingIndex((index) => (index + 1) % WAITING_MESSAGES.length);
    }, 2200);
    return () => clearInterval(timer);
  }, [isWaitingOnApi]);

  const completedSteps = useMemo(() => {
    const thresholds = [0.2, 0.45, 0.65, 0.85];
    return ANALYSIS_STEPS.map((_, index) => progress >= thresholds[index]!);
  }, [progress]);

  const activeIndex = Math.min(
    ANALYSIS_STEPS.length - 1,
    Math.max(0, completedSteps.lastIndexOf(true) + 1),
  );
  const percentLabel = `${Math.round(progress * 100)}%`;
  const statusLabel = isWaitingOnApi
    ? WAITING_MESSAGES[waitingIndex]!
    : 'Détection rapide…';

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
        {/* Header */}
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
              Analyse en cours
            </Text>
            <Text variant="caption" color="textSecondary" align="center" numberOfLines={1}>
              {statusLabel}
            </Text>
          </View>
          <View style={{ width: spacing[40] }} />
        </View>

        {/* Hero */}
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            height: 220,
            marginBottom: spacing[16],
          }}
        >
          <View
            style={{
              width: 200,
              height: 200,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                position: 'absolute',
                width: 180,
                height: 180,
                borderRadius: radius.full,
                backgroundColor: colors.brandSoft,
                opacity: 0.85,
              }}
            />
            <View
              style={{
                position: 'absolute',
                width: 150,
                height: 150,
                borderRadius: radius.full,
                borderWidth: 2,
                borderColor: colors.brandSoft,
              }}
            />
            <Sparkle size={18} style={{ top: 16, right: 28 }} />
            <Sparkle size={12} style={{ top: 48, left: 24 }} />
            <Sparkle size={14} style={{ bottom: 36, right: 20 }} />
            <View
              style={{
                width: 152,
                height: 152,
                borderRadius: radius.full,
                overflow: 'hidden',
                borderWidth: 3,
                borderColor: colors.surface,
                backgroundColor: colors.surfaceSecondary,
              }}
            >
              {showPhoto ? (
                <Image
                  source={{ uri: photoUri! }}
                  accessibilityLabel="Photo du chat en cours d’analyse"
                  resizeMode="cover"
                  style={{ width: '100%', height: '100%' }}
                  onError={() => setPhotoFailed(true)}
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
            </View>
          </View>
        </View>

        <View style={{ flex: 1, paddingHorizontal: spacing[24], gap: spacing[16] }}>
          {/* Progress card */}
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
              {isWaitingOnApi ? (
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

          {/* Tip card */}
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
                {TIP}
              </Text>
            </View>
          </View>
        </View>

        {/* Analysis flow tabs */}
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
          <AnalysisTab label="Analyse" active>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Circle cx="11" cy="11" r="6.5" stroke={colors.brand} strokeWidth={iconStroke.regular} />
              <Path
                d="M16 16.5 20 20.5"
                stroke={colors.brand}
                strokeWidth={iconStroke.regular}
                strokeLinecap="round"
              />
            </Svg>
          </AnalysisTab>
          <AnalysisTab label="Résultats">
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
          <AnalysisTab label="Collection" onPress={() => router.replace('/(tabs)/catdex')}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 18c-3.5 0-6-2.2-6-5.2C6 9.5 8.2 7 10.2 5.6c.7-.5 1.6-.5 2.3 0C14.5 7 16.8 9.5 16.8 12.8 16.8 15.8 14.3 18 12 18Z"
                stroke={colors.textMuted}
                strokeWidth={iconStroke.regular}
                strokeLinejoin="round"
              />
              <Circle cx="9.5" cy="12" r="1" fill={colors.textMuted} />
              <Circle cx="14.5" cy="12" r="1" fill={colors.textMuted} />
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
