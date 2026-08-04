import { memo, useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
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

import { useTheme } from '@/theme';
import { motionDuration, motionEasing } from '@/theme/motion';
import type { Cat } from '@/types/cat';

const POLITE_CAT_PIN = require('../../assets/models/paws-polite-cat/pin.png');

type Props = {
  cat: Cat;
  onPress: (cat: Cat) => void;
  isNearby?: boolean;
  /** Dim / mystery look for not-yet-captured world cats. */
  captured?: boolean;
};

/**
 * Map pin — 3D polite-cat sprite with soft halo and appear bounce.
 */
function CatMapMarkerComponent({
  cat,
  onPress,
  isNearby = false,
  captured = true,
}: Props) {
  const { colors, spacing, shadow } = useTheme();
  const size = spacing[56];
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

    // Keep tracking long enough for iOS MapKit to snapshot the custom view.
    const freeze = setTimeout(() => setTracksViewChanges(false), 2200);
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
      anchor={{ x: 0.5, y: 0.92 }}
      zIndex={captured ? 12 : 10}
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
              backgroundColor: colors.brand,
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
            },
            shadow.low,
          ]}
        >
          <Image
            source={POLITE_CAT_PIN}
            style={{
              width: size,
              height: size,
              opacity: captured ? 1 : 0.72,
            }}
            resizeMode="contain"
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
    justifyContent: 'flex-end',
  },
});
