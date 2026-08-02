import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/theme';
import { motionDuration } from '@/theme/motion';

type Props = {
  coordinate: { latitude: number; longitude: number };
};

/**
 * Premium player indicator — white ring, turquoise core, breathing halo.
 * Single marker: `tracksViewChanges` stays on so the pulse renders on the map bitmap.
 */
export function PlayerLocationMarker({ coordinate }: Props) {
  const { colors, spacing, shadow } = useTheme();
  const pulse = useSharedValue(0.45);
  const breath = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, {
        duration: 280,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
    breath.value = withRepeat(
      withTiming(1.08, {
        duration: motionDuration.slow + 80,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [breath, pulse]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.16 + pulse.value * 0.28,
    transform: [{ scale: (0.82 + pulse.value * 0.42) * breath.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breath.value }],
  }));

  const coreSize = spacing[16];
  const ringSize = spacing[24];
  const haloSize = spacing[48];

  return (
    <Marker
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges
      flat={false}
      zIndex={999}
    >
      <View style={[styles.wrap, { width: haloSize, height: haloSize }]}>
        <Animated.View
          style={[
            styles.halo,
            {
              width: haloSize,
              height: haloSize,
              borderRadius: haloSize / 2,
              backgroundColor: colors.accent,
            },
            haloStyle,
          ]}
        />
        <Animated.View
          style={[
            styles.ring,
            {
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
              backgroundColor: colors.surface,
              borderColor: colors.surface,
            },
            shadow.low,
            ringStyle,
          ]}
        >
          <View
            style={{
              width: coreSize,
              height: coreSize,
              borderRadius: coreSize / 2,
              backgroundColor: colors.accent,
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
  halo: {
    position: 'absolute',
  },
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
});
