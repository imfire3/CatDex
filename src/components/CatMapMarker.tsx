import { memo, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { CatSprite } from '@/components/CatSprite';
import { useTheme } from '@/theme';
import { motionDuration, motionEasing } from '@/theme/motion';
import type { Cat } from '@/types/cat';

type Props = {
  cat: Cat;
  onPress: (cat: Cat) => void;
  isNearby?: boolean;
};

/**
 * CatDex map marker — round avatar, white ring, luminous halo,
 * bounce on appear + short float/pulse (then freeze for map FPS).
 */
function CatMapMarkerComponent({ cat, onPress, isNearby = false }: Props) {
  const { colors, spacing, shadow } = useTheme();
  const size = spacing[48];
  const haloSize = size + spacing[24];

  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const appear = useSharedValue(0);
  const floatY = useSharedValue(0);
  const pulse = useSharedValue(0.65);

  useEffect(() => {
    appear.value = withSpring(1, motionEasing.bouncy);
    floatY.value = withDelay(
      motionDuration.normal,
      withRepeat(
        withSequence(
          withTiming(-4, {
            duration: 260,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(0, {
            duration: 260,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1,
        false,
      ),
    );
    pulse.value = withDelay(
      motionDuration.fast,
      withRepeat(
        withTiming(1, {
          duration: isNearby ? 180 : 280,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      ),
    );

    // Appear + a few float frames, then freeze bitmap for scroll FPS.
    const freeze = setTimeout(() => setTracksViewChanges(false), 1400);
    return () => clearTimeout(freeze);
  }, [appear, floatY, isNearby, pulse]);

  const bodyStyle = useAnimatedStyle(() => ({
    opacity: appear.value,
    transform: [
      { translateY: floatY.value },
      { scale: 0.68 + appear.value * 0.32 },
    ],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: isNearby ? 0.28 + pulse.value * 0.35 : 0.12 + pulse.value * 0.18,
    transform: [{ scale: isNearby ? 0.82 + pulse.value * 0.38 : 0.88 + pulse.value * 0.22 }],
  }));

  return (
    <Marker
      coordinate={{ latitude: cat.latitude, longitude: cat.longitude }}
      onPress={() => onPress(cat)}
      tracksViewChanges={tracksViewChanges}
      anchor={{ x: 0.5, y: 0.5 }}
      zIndex={10}
    >
      <Animated.View
        style={[
          styles.wrap,
          { width: haloSize, height: haloSize },
          bodyStyle,
        ]}
      >
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
            styles.pin,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: colors.surfaceElevated,
            },
            shadow.low,
          ]}
        >
          <CatSprite
            colorLabel={cat.analysis.color}
            seed={cat.number}
            size={size - 6}
            faceOnly
          />
        </View>
      </Animated.View>
    </Marker>
  );
}

export const CatMapMarker = memo(CatMapMarkerComponent);

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
  },
  pin: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
