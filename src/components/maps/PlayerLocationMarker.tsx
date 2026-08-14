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
  /** Compass degrees (0 = north). Rotates the facing wedge with the map. */
  heading?: number | null;
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
 * Keep tracksViewChanges on so the pin moves/rotates smoothly while walking.
 */
export function PlayerLocationMarker({ coordinate, heading = null }: Props) {
  const { colors, spacing } = useTheme();
  const pulseA = useSharedValue(0);
  const pulseB = useSharedValue(0);
  const hasHeading = heading != null && Number.isFinite(heading);

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

  const radarSize = spacing[48];
  const coreSize = spacing[16];
  const ringSize = spacing[24];
  const wedgeSize = spacing[8];

  return (
    <Marker
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 0.5 }}
      centerOffset={{ x: 0, y: 0 }}
      tracksViewChanges
      flat
      rotation={hasHeading ? heading : 0}
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
        <PulseRing progress={pulseA} size={radarSize} color={colors.mapPlayer} />
        <PulseRing progress={pulseB} size={radarSize} color={colors.mapPlayer} />
        {hasHeading ? (
          <View
            style={[
              styles.facingWedge,
              {
                borderLeftWidth: wedgeSize,
                borderRightWidth: wedgeSize,
                borderBottomWidth: spacing[16],
                borderBottomColor: colors.mapPlayer,
                top: spacing[4],
              },
            ]}
          />
        ) : null}
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
  facingWedge: {
    position: 'absolute',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
