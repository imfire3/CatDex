import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/theme';

type Props = {
  coordinate: { latitude: number; longitude: number };
};

const PULSE_MS = 2200;

function PulseRing({
  progress,
  size,
  color,
}: {
  progress: SharedValue<number>;
  size: number;
  color: string;
}) {
  const style = useAnimatedStyle(() => ({
    opacity: 0.45 * (1 - progress.value),
    transform: [{ scale: 0.35 + progress.value * 1.05 }],
  }));

  return (
    <Animated.View
      style={[
        styles.pulseRing,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: color,
        },
        style,
      ]}
    />
  );
}

/**
 * Player location — blue core, white ring, dual expanding halo (Pokémon GO–style).
 */
export function PlayerLocationMarker({ coordinate }: Props) {
  const { colors, spacing } = useTheme();
  const pulseA = useSharedValue(0);
  const pulseB = useSharedValue(0);
  const corePulse = useSharedValue(1);

  useEffect(() => {
    pulseA.value = withRepeat(
      withTiming(1, { duration: PULSE_MS, easing: Easing.out(Easing.quad) }),
      -1,
      false,
    );
    pulseB.value = withDelay(
      PULSE_MS / 2,
      withRepeat(
        withTiming(1, { duration: PULSE_MS, easing: Easing.out(Easing.quad) }),
        -1,
        false,
      ),
    );
    corePulse.value = withRepeat(
      withTiming(1.12, {
        duration: 1400,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
  }, [corePulse, pulseA, pulseB]);

  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: corePulse.value }],
  }));

  const haloSize = spacing[64] + spacing[16];
  const coreSize = spacing[16];
  const ringSize = spacing[24] + spacing[4];

  return (
    <Marker
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges
      flat={false}
      zIndex={999}
    >
      <View style={[styles.wrap, { width: haloSize, height: haloSize }]}>
        <View
          style={[
            styles.softGlow,
            {
              width: haloSize - spacing[8],
              height: haloSize - spacing[8],
              borderRadius: (haloSize - spacing[8]) / 2,
              backgroundColor: colors.mapPlayerSoft,
            },
          ]}
        />
        <PulseRing progress={pulseA} size={haloSize} color={colors.mapPlayer} />
        <PulseRing progress={pulseB} size={haloSize} color={colors.mapPlayer} />
        <Animated.View
          style={[
            styles.ring,
            {
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
              backgroundColor: colors.mapPlayerRing,
              borderColor: colors.mapPlayerRing,
            },
            coreStyle,
            {
              shadowColor: colors.mapPlayer,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.35,
              shadowRadius: 6,
              elevation: 4,
            },
          ]}
        >
          <View
            style={{
              width: coreSize,
              height: coreSize,
              borderRadius: coreSize / 2,
              backgroundColor: colors.mapPlayer,
            }}
          />
        </Animated.View>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  softGlow: {
    position: 'absolute',
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 2,
  },
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
});
