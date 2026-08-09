import { useEffect, useState } from 'react';
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
 * Player pin + radar pulse.
 * flat + centered anchor so the GPS point stays on the lat/lng (no 3D billboard drift).
 * tracksViewChanges freezes after paint so the marker does not jitter off-center.
 */
export function PlayerLocationMarker({ coordinate }: Props) {
  const { colors, spacing } = useTheme();
  const pulseA = useSharedValue(0);
  const pulseB = useSharedValue(0);
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

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
  }, [pulseA, pulseB]);

  useEffect(() => {
    setTracksViewChanges(true);
    const freeze = setTimeout(() => setTracksViewChanges(false), 1800);
    return () => clearTimeout(freeze);
  }, []);

  const radarSize = spacing[48];
  const coreSize = spacing[16];
  const ringSize = spacing[24];

  return (
    <Marker
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 0.5 }}
      centerOffset={{ x: 0, y: 0 }}
      tracksViewChanges={tracksViewChanges}
      flat
      zIndex={999}
    >
      <View style={[styles.wrap, { width: radarSize, height: radarSize }]} collapsable={false}>
        <View
          style={[
            styles.softGlow,
            {
              width: radarSize - spacing[8],
              height: radarSize - spacing[8],
              borderRadius: (radarSize - spacing[8]) / 2,
              backgroundColor: colors.mapPlayerSoft,
            },
          ]}
        />
        {tracksViewChanges ? (
          <>
            <PulseRing progress={pulseA} size={radarSize} color={colors.mapPlayer} />
            <PulseRing progress={pulseB} size={radarSize} color={colors.mapPlayer} />
          </>
        ) : (
          <View
            style={[
              styles.pulseRing,
              {
                width: radarSize * 0.7,
                height: radarSize * 0.7,
                borderRadius: (radarSize * 0.7) / 2,
                borderColor: colors.mapPlayer,
                opacity: 0.28,
              },
            ]}
          />
        )}
        <View
          style={[
            styles.ring,
            {
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
              backgroundColor: colors.mapPlayerRing,
              borderColor: colors.mapPlayerRing,
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
        </View>
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
