import { memo, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
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

import {
  CAT_PIN_AVATAR,
  CAT_PIN_TIP_H,
  CatPinVisual,
} from '@/components/maps/CatPinVisual';
import { useTheme } from '@/theme';
import { motionDuration, motionEasing } from '@/theme/motion';
import type { Cat } from '@/types/cat';

type Props = {
  cat: Cat;
  onPress: (cat: Cat) => void;
  isNearby?: boolean;
  /** Dim / mystery look for not-yet-captured world cats. */
  captured?: boolean;
};

/**
 * Map pin — low-poly 3D cat sprite + brand tip.
 */
function CatMapMarkerComponent({
  cat,
  onPress,
  isNearby = false,
  captured = true,
}: Props) {
  const { spacing } = useTheme();
  const size = isNearby ? spacing[64] : CAT_PIN_AVATAR;
  const wrapW = size + spacing[32];
  const wrapH = size + CAT_PIN_TIP_H + spacing[16];

  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const appear = useSharedValue(0);
  const floatY = useSharedValue(0);

  useEffect(() => {
    appear.value = withSpring(1, motionEasing.bouncy);
    floatY.value = withDelay(
      motionDuration.normal,
      withRepeat(
        withSequence(
          withTiming(-3, {
            duration: 900,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(0, {
            duration: 900,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1,
        false,
      ),
    );

    // Keep tracking long enough for iOS MapKit to snapshot the custom view.
    const freeze = setTimeout(() => setTracksViewChanges(false), 2400);
    return () => clearTimeout(freeze);
  }, [appear, floatY, cat.photoUri]);

  const bodyStyle = useAnimatedStyle(() => ({
    opacity: appear.value,
    transform: [
      { translateY: floatY.value },
      { scale: 0.86 + appear.value * 0.14 },
    ],
  }));

  return (
    <Marker
      coordinate={{ latitude: cat.latitude, longitude: cat.longitude }}
      onPress={() => onPress(cat)}
      tracksViewChanges={tracksViewChanges}
      anchor={{ x: 0.5, y: 1 }}
      zIndex={captured ? 12 : 10}
    >
      <Animated.View
        style={[
          styles.wrap,
          { width: wrapW, height: wrapH },
          bodyStyle,
        ]}
      >
        <CatPinVisual
          cat={cat}
          captured={captured}
          isNearby={isNearby}
          size={size}
        />
      </Animated.View>
    </Marker>
  );
}

export const CatMapMarker = memo(CatMapMarkerComponent);

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});
