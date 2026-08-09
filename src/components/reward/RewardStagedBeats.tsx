import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { CatDexIcon, type CatDexIconName } from '@/components/icons/catdex';
import { Text } from '@/components/Text';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { playHapticLight } from '@/lib/gameFeedback';
import { useTheme } from '@/theme/ThemeProvider';

export type RewardBeat = {
  id: string;
  label: string;
  icon: CatDexIconName;
};

function BeatChip({ beat, index }: { beat: RewardBeat; index: number }) {
  const { colors, fonts, spacing, radius, shadow, motion } = useTheme();
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(reduceMotion ? 1 : 0.55);

  useEffect(() => {
    if (reduceMotion) return;
    scale.value = withDelay(
      index * 160,
      withSequence(
        withSpring(1.12, { damping: 9, stiffness: 210 }),
        withTiming(1, { duration: motion.duration.fast }),
      ),
    );
    const t = setTimeout(() => {
      void playHapticLight();
    }, index * 160);
    return () => clearTimeout(t);
  }, [index, motion.duration.fast, reduceMotion, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={
        reduceMotion
          ? undefined
          : FadeInDown.delay(index * 140).duration(motion.duration.normal)
      }
      style={style}
    >
      <View
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
            justifyContent: 'center',
          }}
        >
          <CatDexIcon name={beat.icon} color={colors.brand} size={14} />
        </View>
        <Text variant="bodySmall" color="textBrand" style={{ fontFamily: fonts.bodySemi }}>
          {beat.label}
        </Text>
      </View>
    </Animated.View>
  );
}

type Props = {
  beats: RewardBeat[];
  visible?: boolean;
};

/** Staged reward chips (XP, badge, companion…). */
export function RewardStagedBeats({ beats, visible = true }: Props) {
  const { spacing } = useTheme();
  if (!visible) return null;

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing[8],
        justifyContent: 'center',
        alignSelf: 'stretch',
        minHeight: spacing[80],
      }}
    >
      {beats.map((beat, index) => (
        <BeatChip key={beat.id} beat={beat} index={index} />
      ))}
    </View>
  );
}
