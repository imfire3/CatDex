import { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { ProgressBar } from '@/components/Progress';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

const ANALYSIS_STEPS = [
  'Détection du chat',
  'Couleur du pelage',
  'Race probable',
  'Traits & prénom',
] as const;

type Props = {
  photoUri: string;
};

function StepCheck({ done }: { done: boolean }) {
  const { colors, radius } = useTheme();

  return (
    <View
      style={{
        width: 22,
        height: 22,
        borderRadius: radius.full,
        backgroundColor: done ? colors.success : 'rgba(255,255,255,0.22)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {done ? (
        <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
          <Path
            d="M5 12l5 5L19 7"
            stroke={colors.onAccent}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ) : (
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: radius.full,
            backgroundColor: 'rgba(255,255,255,0.55)',
          }}
        />
      )}
    </View>
  );
}

/**
 * Analysis screen — captured photo full-bleed in the background,
 * checklist + progress overlaid so the user can read each step.
 */
export function AnalysisLoadingView({ photoUri }: Props) {
  const { colors, fonts, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const [progress, setProgress] = useState(0.06);

  useEffect(() => {
    // Slow enough that each checklist line is readable (~4–5s to ~96%).
    const timer = setInterval(() => {
      setProgress((value) => {
        if (value >= 0.96) return value;
        const step = value < 0.35 ? 0.035 : value < 0.7 ? 0.028 : 0.018;
        return Math.min(0.96, value + step);
      });
    }, 180);

    return () => clearInterval(timer);
  }, []);

  const completedSteps = useMemo(() => {
    const thresholds = [0.18, 0.4, 0.62, 0.84];
    return ANALYSIS_STEPS.map((_, index) => progress >= thresholds[index]);
  }, [progress]);

  const activeStep =
    ANALYSIS_STEPS[
      Math.min(
        ANALYSIS_STEPS.length - 1,
        completedSteps.lastIndexOf(true) + 1,
      )
    ] ?? ANALYSIS_STEPS[0];

  const percentLabel = `${Math.round(progress * 100)}%`;

  return (
    <View style={styles.root}>
      <Image
        source={{ uri: photoUri }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
        accessibilityLabel="Photo en cours d’analyse"
      />

      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: 'rgba(21, 23, 43, 0.48)' },
        ]}
      />

      <View
        style={{
          flex: 1,
          paddingTop: insets.top + spacing[24],
          paddingBottom: insets.bottom + spacing[24],
          paddingHorizontal: spacing[24],
          justifyContent: 'flex-end',
          gap: spacing[24],
        }}
      >
        <View style={{ gap: spacing[8] }}>
          <Text
            variant="h2"
            color="onAccent"
            style={{ fontFamily: fonts.display }}
          >
            Analyse en cours…
          </Text>
          <Text variant="body" color="onAccent" style={{ opacity: 0.9 }}>
            {activeStep}
          </Text>
        </View>

        <View style={{ gap: spacing[8] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[8] }}>
            <View style={{ flex: 1 }}>
              <ProgressBar progress={progress} height={8} />
            </View>
            <Text
              variant="caption"
              color="onAccent"
              style={{ fontFamily: fonts.bodySemi, minWidth: 36 }}
            >
              {percentLabel}
            </Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: colors.glassFill,
            borderRadius: radius[8],
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing[16],
            gap: spacing[16],
          }}
        >
          {ANALYSIS_STEPS.map((label, index) => (
            <View
              key={label}
              style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[8] }}
            >
              <StepCheck done={completedSteps[index]} />
              <Text
                variant="bodySmall"
                color={completedSteps[index] ? 'textBrand' : 'textSecondary'}
                style={{
                  fontFamily: completedSteps[index] ? fonts.bodySemi : fonts.body,
                }}
              >
                {label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#15172B',
  },
});
