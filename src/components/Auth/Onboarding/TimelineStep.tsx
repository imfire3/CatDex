import { View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useEffect, type ReactNode } from 'react';

import { Text } from '@/components/Text';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme/ThemeProvider';

import { Glyph, type OnboardingGlyph } from './glyphs';

type TimelineStepProps = {
  label: string;
  glyph: OnboardingGlyph;
  /** Compact illustration under the label */
  children?: ReactNode;
  /** Draw the vertical connector below this step */
  showConnector?: boolean;
  /** Stagger index for draw / fade animation */
  index?: number;
  isLast?: boolean;
};

/**
 * Une étape de la timeline verticale — icône + texte + illustration.
 * Reliée par une ligne verticale qui apparaît progressivement.
 */
export function TimelineStep({
  label,
  glyph,
  children,
  showConnector = true,
  index = 0,
  isLast = false,
}: TimelineStepProps) {
  const { colors, spacing, radius, motion, shadow } = useTheme();
  const reduceMotion = useReducedMotion();
  const lineOpacity = useSharedValue(reduceMotion || isLast ? 1 : 0);

  useEffect(() => {
    if (reduceMotion || isLast) return;
    lineOpacity.value = withDelay(
      280 + index * 180,
      withTiming(1, { duration: motion.duration.reveal }),
    );
  }, [index, isLast, lineOpacity, motion.duration.reveal, reduceMotion]);

  const lineStyle = useAnimatedStyle(() => ({
    opacity: lineOpacity.value * 0.55,
  }));

  const entering = reduceMotion
    ? undefined
    : FadeInDown.delay(120 + index * 140).duration(motion.duration.slow);

  const nodeSize = spacing[32];

  return (
    <Animated.View entering={entering} style={{ alignSelf: 'stretch' }}>
      <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: spacing[16] }}>
        <View style={{ alignItems: 'center', width: nodeSize }}>
          <View
            style={[
              {
                width: nodeSize,
                height: nodeSize,
                borderRadius: radius.full,
                backgroundColor: colors.surfaceElevated,
                borderWidth: 1.5,
                borderColor: colors.brand,
                alignItems: 'center',
                justifyContent: 'center',
              },
              shadow.low,
            ]}
          >
            <Glyph name={glyph} color={colors.brand} size={16} />
          </View>
          {showConnector && !isLast ? (
            <Animated.View
              style={[
                {
                  width: 2,
                  flex: 1,
                  minHeight: spacing[24],
                  marginTop: spacing[8],
                  borderRadius: radius.full,
                  backgroundColor: colors.brand,
                },
                lineStyle,
              ]}
            />
          ) : null}
        </View>

        <View
          style={{
            flex: 1,
            gap: spacing[8],
            paddingBottom: isLast ? 0 : spacing[32],
            paddingTop: spacing[4] }}
        >
          <Text variant="bodySmall" weight="semibold" color="text">
            {label}
          </Text>
          {children}
        </View>
      </View>
    </Animated.View>
  );
}
