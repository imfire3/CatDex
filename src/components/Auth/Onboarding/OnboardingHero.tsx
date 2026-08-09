import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Text } from '@/components/Text';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme/ThemeProvider';

import { AnimatedCircle } from './AnimatedCircle';

type OnboardingHeroProps = {
  title?: string;
  description?: string;
  circleLabel?: string;
};

/**
 * Haut d'écran immersif — cercle animé + titre + micro-description.
 * Pas de longs paragraphes.
 */
export function OnboardingHero({
  title = 'Ton premier compagnon t’attend',
  description = 'Prends une photo.\nL’IA s’occupe du reste.',
  circleLabel,
}: OnboardingHeroProps) {
  const { fonts, spacing, motion } = useTheme();
  const reduceMotion = useReducedMotion();
  const enter = (delay: number) =>
    reduceMotion
      ? undefined
      : FadeInDown.delay(delay).duration(motion.duration.reveal).springify().damping(18);

  return (
    <View
      style={{
        alignItems: 'center',
        gap: spacing[32],
        alignSelf: 'stretch',
        paddingTop: spacing[8],
      }}
    >
      <Animated.View entering={enter(40)}>
        <AnimatedCircle label={circleLabel} />
      </Animated.View>

      <Animated.View
        entering={enter(160)}
        style={{ gap: spacing[16], alignItems: 'center', paddingHorizontal: spacing[8] }}
      >
        <Text
          variant="h1"
          color="textBrand"
          align="center"
          style={{ fontFamily: fonts.display }}
        >
          {title}
        </Text>
        <Text variant="body" color="textSecondary" align="center">
          {description}
        </Text>
      </Animated.View>
    </View>
  );
}
