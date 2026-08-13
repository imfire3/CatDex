import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/Text';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme/ThemeProvider';

import { Glyph, type OnboardingGlyph } from './glyphs';

export type RewardChipItem = {
  id: string;
  label: string;
  glyph: OnboardingGlyph;
};

const DEFAULT_REWARDS: RewardChipItem[] = [
  { id: 'xp', label: '+30 XP', glyph: 'xp' },
  { id: 'badge', label: 'Badge', glyph: 'badge' },
  { id: 'dex', label: 'CatDex', glyph: 'book' },
];

type RewardChipsProps = {
  items?: RewardChipItem[];
  /** Base delay before the first chip pops */
  startDelay?: number;
};

function RewardChip({
  item,
  index,
  startDelay,
}: {
  item: RewardChipItem;
  index: number;
  startDelay: number;
}) {
  const { colors, spacing, radius, shadow, motion } = useTheme();
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(reduceMotion ? 1 : 0.72);
  const opacity = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) return;
    const delay = startDelay + index * 160;
    opacity.value = withDelay(delay, withTiming(1, { duration: motion.duration.fast }));
    scale.value = withDelay(
      delay,
      withSequence(
        withSpring(1.08, motion.easing.bouncy),
        withTiming(1, { duration: motion.duration.fast, easing: Easing.out(Easing.ease) }),
      ),
    );
  }, [index, motion.duration.fast, motion.easing.bouncy, opacity, reduceMotion, scale, startDelay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const entering = reduceMotion
    ? undefined
    : FadeInUp.delay(startDelay + index * 160).duration(motion.duration.normal);

  return (
    <Animated.View entering={entering} style={animatedStyle}>
      <View
        accessibilityRole="text"
        accessibilityLabel={item.label}
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing[8],
            paddingVertical: spacing[8],
            paddingHorizontal: spacing[16],
            borderRadius: radius.full,
            backgroundColor: colors.surfaceElevated,
            borderWidth: 1,
            borderColor: colors.border,
          },
          shadow.low,
        ]}
      >
        <View
          style={{
            width: spacing[24],
            height: spacing[24],
            borderRadius: radius.full,
            backgroundColor: colors.brandSoft,
            alignItems: 'center',
            justifyContent: 'center' }}
        >
          <Glyph name={item.glyph} color={colors.brand} size={14} />
        </View>
        <Text
          variant="bodySmall" weight="semibold"
          color="textBrand"
        >
          {item.label}
        </Text>
      </View>
    </Animated.View>
  );
}

/**
 * Trois petits jetons-capsule — récompenses qui pop une par une.
 * Remplace les trois grosses cards de récompense.
 */
export function RewardChips({
  items = DEFAULT_REWARDS,
  startDelay = 400,
}: RewardChipsProps) {
  const { spacing } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing[8],
        justifyContent: 'center',
        alignSelf: 'stretch',
        paddingVertical: spacing[8] }}
      accessibilityLabel="Récompenses de première capture"
    >
      {items.map((item, index) => (
        <RewardChip key={item.id} item={item} index={index} startDelay={startDelay} />
      ))}
    </View>
  );
}
