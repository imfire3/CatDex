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
 * Premium player indicator — white ring, turquoise core, soft pulsing halo.
 * Single marker: `tracksViewChanges` stays on so the pulse renders on the map bitmap.
 */
export function PlayerLocationMarker({ coordinate }: Props) {
  const { colors, spacing, shadow } = useTheme();
  const pulse = useSharedValue(0.55);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, {
        duration: motionDuration.slow + 40,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [pulse]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.18 + pulse.value * 0.22,
    transform: [{ scale: 0.85 + pulse.value * 0.35 }],
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
        <View
          style={[
            styles.ring,
            {
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
              backgroundColor: colors.surface,
              borderColor: colors.surface,
            },
            shadow.medium,
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
  halo: {
    position: 'absolute',
  },
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
});
