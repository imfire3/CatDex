import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme/ThemeProvider';

type Piece = {
  id: number;
  left: number;
  delay: number;
  color: string;
  size: number;
  isPaw: boolean;
};

function ConfettiPiece({ piece }: { piece: Piece }) {
  const y = useSharedValue(-30);
  const opacity = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    y.value = withDelay(piece.delay, withTiming(520, { duration: 1600 + piece.delay }));
    opacity.value = withDelay(piece.delay, withTiming(0, { duration: 1600 + piece.delay }));
    rotate.value = withDelay(piece.delay, withTiming(220 + piece.delay, { duration: 1500 }));
  }, [opacity, piece.delay, rotate, y]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }, { rotate: `${rotate.value}deg` }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      entering={FadeIn.delay(piece.delay)}
      style={[
        {
          position: 'absolute',
          top: 16,
          left: `${piece.left}%`,
          width: piece.size,
          height: piece.isPaw ? piece.size : piece.size * 1.4,
          borderRadius: piece.isPaw ? piece.size / 2 : 2,
          backgroundColor: piece.color,
        },
        style,
      ]}
    />
  );
}

/** Confetti burst with occasional circular “paw” dots. */
export function RewardConfetti({ count = 20 }: { count?: number }) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: 4 + ((i * 17) % 90),
        delay: (i % 9) * 45,
        color: [colors.brand, colors.orange, colors.success, colors.rose, colors.yellow][
          i % 5
        ]!,
        size: 5 + (i % 4) * 2,
        isPaw: i % 4 === 0,
      })),
    [colors.brand, colors.orange, colors.rose, colors.success, colors.yellow, count],
  );

  if (reduceMotion) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((piece) => (
        <ConfettiPiece key={piece.id} piece={piece} />
      ))}
    </View>
  );
}
