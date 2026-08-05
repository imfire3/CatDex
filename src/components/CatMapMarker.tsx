import { memo, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import {
  CAT_PIN_AVATAR,
  CAT_PIN_TIP_H,
  CatPinVisual,
} from '@/components/maps/CatPinVisual';
import { useTheme } from '@/theme';
import { motionEasing } from '@/theme/motion';
import type { Cat } from '@/types/cat';

type Props = {
  cat: Cat;
  onPress: (cat: Cat) => void;
  isNearby?: boolean;
  /** Dim / mystery look for not-yet-captured world cats. */
  captured?: boolean;
};

/**
 * Map pin — flat face circle + tip. No float animation (keeps tip on lat/lng).
 */
function CatMapMarkerComponent({
  cat,
  onPress,
  isNearby = false,
  captured = true,
}: Props) {
  const { spacing } = useTheme();
  const size = isNearby ? spacing[48] : CAT_PIN_AVATAR;
  // Tight box: tip is the bottom edge → Marker anchor y=1 stays on the ground.
  const wrapW = size + spacing[16];
  const wrapH = size + CAT_PIN_TIP_H;

  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const appear = useSharedValue(0);

  useEffect(() => {
    appear.value = withSpring(1, motionEasing.standard);
    const freeze = setTimeout(() => setTracksViewChanges(false), 900);
    return () => clearTimeout(freeze);
  }, [appear, cat.id, cat.photoUri]);

  const bodyStyle = useAnimatedStyle(() => ({
    opacity: appear.value,
  }));

  return (
    <Marker
      coordinate={{ latitude: cat.latitude, longitude: cat.longitude }}
      onPress={() => onPress(cat)}
      tracksViewChanges={tracksViewChanges}
      anchor={{ x: 0.5, y: 1 }}
      tracksInfoWindowChanges={false}
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
