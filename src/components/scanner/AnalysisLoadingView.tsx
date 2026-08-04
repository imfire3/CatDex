import { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { ProgressBar } from '@/components/Progress';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

const ANALYSIS_STEPS = [
  'Forme du visage',
  'Couleurs et motifs',
  'Analyse du pelage',
  'Correspondance base de données',
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
        backgroundColor: done ? colors.success : colors.surfaceSecondary,
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
            backgroundColor: colors.borderDefault,
          }}
        />
      )}
    </View>
  );
}

/** Full-screen analysis loader — white app chrome, scan ring, checklist. */
export function AnalysisLoadingView({ photoUri }: Props) {
  const { colors, fonts, spacing, radius, shadow } = useTheme();
  const insets = useSafeAreaInsets();
  const [progress, setProgress] = useState(0.08);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((value) => {
        if (value >= 0.96) return value;
        const step = value < 0.45 ? 0.07 : value < 0.75 ? 0.045 : 0.028;
        return Math.min(0.96, value + step);
      });
    }, 160);

    return () => clearInterval(timer);
  }, []);

  const completedSteps = useMemo(() => {
    const thresholds = [0.2, 0.42, 0.65, 0.88];
    return ANALYSIS_STEPS.map((_, index) => progress >= thresholds[index]);
  }, [progress]);

  const ringSize = spacing[96] + spacing[32];
  const percentLabel = `${Math.round(progress * 100)}%`;

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top + spacing[24] }]}>
      <View style={{ flex: 1, paddingHorizontal: spacing[24], gap: spacing[32] }}>
        <View style={{ alignItems: 'center', paddingTop: spacing[16] }}>
          <View
            style={[
              {
                width: ringSize + spacing[24],
                height: ringSize + spacing[24],
                borderRadius: radius.full,
                backgroundColor: colors.brandSoft,
                alignItems: 'center',
                justifyContent: 'center',
              },
              shadow.low,
            ]}
          >
            <View
              style={{
                width: ringSize,
                height: ringSize,
                borderRadius: radius.full,
                borderWidth: 3,
                borderColor: colors.brand,
                overflow: 'hidden',
                backgroundColor: colors.surfaceElevated,
              }}
            >
              <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
            </View>

            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                { alignItems: 'center', justifyContent: 'center' },
              ]}
            >
              <View
                style={{
                  width: ringSize + spacing[8],
                  height: ringSize + spacing[8],
                  borderRadius: radius.full,
                  borderWidth: 2,
                  borderColor: colors.accentSoft,
                }}
              />
            </View>

            <View
              style={{
                position: 'absolute',
                right: spacing[8],
                top: '50%',
                marginTop: -5,
                width: 10,
                height: 10,
                borderRadius: radius.full,
                backgroundColor: colors.brand,
              }}
            />
            <View
              style={{
                position: 'absolute',
                left: spacing[8],
                top: '50%',
                marginTop: -5,
                width: 10,
                height: 10,
                borderRadius: radius.full,
                backgroundColor: colors.brand,
              }}
            />
          </View>
        </View>

        <View style={{ alignItems: 'center', gap: spacing[8] }}>
          <Text variant="h2" color="textBrand" align="center" style={{ fontFamily: fonts.display }}>
            Analyse en cours…
          </Text>
          <Text variant="bodySmall" color="textSecondary" align="center">
            IA à l'œuvre
          </Text>
        </View>

        <View style={{ gap: spacing[8] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[8] }}>
            <View style={{ flex: 1 }}>
              <ProgressBar progress={progress} height={8} />
            </View>
            <Text variant="caption" color="textBrand" style={{ fontFamily: fonts.bodySemi, minWidth: 36 }}>
              {percentLabel}
            </Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: colors.surfaceElevated,
            borderRadius: radius.cta,
            padding: spacing[16],
            gap: spacing[16],
          }}
        >
          {ANALYSIS_STEPS.map((label, index) => (
            <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[8] }}>
              <StepCheck done={completedSteps[index]} />
              <Text
                variant="bodySmall"
                color={completedSteps[index] ? 'text' : 'textMuted'}
                style={{ fontFamily: completedSteps[index] ? fonts.bodySemi : fonts.body }}
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
  },
});
