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
};

/**
 * CatDex map marker — round avatar, white ring, soft halo,
 * float + pulse (Reanimated), bounce on appear.
 */
function CatMapMarkerComponent({ cat, onPress }: Props) {
  const { colors, spacing, shadow } = useTheme();
  const size = spacing[48];
  const haloSize = size + spacing[16];

  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const appear = useSharedValue(0);
  const floatY = useSharedValue(0);
  const pulse = useSharedValue(0.7);

  useEffect(() => {
    appear.value = withSpring(1, motionEasing.bouncy);
    floatY.value = withDelay(
      motionDuration.slow,
      withRepeat(
        withSequence(
          withTiming(-3, {
            duration: motionDuration.slow + 80,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(0, {
            duration: motionDuration.slow + 80,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1,
        false,
      ),
    );
    pulse.value = withDelay(
      motionDuration.normal,
      withRepeat(
        withTiming(1, {
          duration: motionDuration.slow + 40,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      ),
    );

    // Keep bitmap updates long enough for enter + a few float frames, then freeze for perf.
    const freeze = setTimeout(() => setTracksViewChanges(false), 2200);
    return () => clearTimeout(freeze);
  }, [appear, floatY, pulse]);

  const bodyStyle = useAnimatedStyle(() => ({
    opacity: appear.value,
    transform: [
      { translateY: floatY.value },
      { scale: 0.72 + appear.value * 0.28 },
    ],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.12 + pulse.value * 0.16,
    transform: [{ scale: 0.9 + pulse.value * 0.18 }],
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
              borderWidth: 3,
              borderColor: colors.mapPinRing,
              backgroundColor: colors.accentSoft,
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
