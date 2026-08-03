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
 * Player pin + wide radar pulse (explorer mock).
 */
export function PlayerLocationMarker({ coordinate }: Props) {
  const { colors, spacing, shadow } = useTheme();
  const pulse = useSharedValue(0.35);
  const breath = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, {
        duration: 900,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
    breath.value = withRepeat(
      withTiming(1.06, {
        duration: motionDuration.slow + 120,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [breath, pulse]);

  const radarStyle = useAnimatedStyle(() => ({
    opacity: 0.12 + pulse.value * 0.22,
    transform: [{ scale: 0.55 + pulse.value * 0.7 }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breath.value }],
  }));

  const coreSize = spacing[16];
  const ringSize = spacing[24];
  const radarSize = spacing[96];

  return (
    <Marker
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges
      flat={false}
      zIndex={999}
    >
      <View style={[styles.wrap, { width: radarSize, height: radarSize }]}>
        <Animated.View
          style={[
            styles.halo,
            {
              width: radarSize,
              height: radarSize,
              borderRadius: radarSize / 2,
              backgroundColor: colors.brand,
            },
            radarStyle,
          ]}
        />
        <Animated.View
          style={[
            styles.halo,
            {
              width: spacing[64],
              height: spacing[64],
              borderRadius: spacing[64] / 2,
              backgroundColor: colors.brandSoft,
              opacity: 0.85,
            },
            radarStyle,
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
              backgroundColor: colors.brand,
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
