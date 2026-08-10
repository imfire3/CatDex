import { memo, useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import {
  CAT_PIN_AVATAR,
  CAT_PIN_SILHOUETTE,
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
  /** Purple bubble above featured pins — e.g. "Nox · 90 m". */
  callout?: string | null;
};

/**
 * Map pin — featured photo+callout when nearby, grey silhouette otherwise.
 */
function CatMapMarkerComponent({
  cat,
  onPress,
  isNearby = false,
  captured = true,
  callout = null,
}: Props) {
  const { spacing } = useTheme();
  const size = isNearby ? spacing[48] : CAT_PIN_SILHOUETTE;
  const calloutPad = callout ? spacing[24] : 0;
  const wrapW = Math.max(size + spacing[16], spacing[96]);
  const wrapH = size + (isNearby ? CAT_PIN_TIP_H : 0) + calloutPad;

  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const appear = useSharedValue(0);

  useEffect(() => {
    appear.value = withSpring(1, motionEasing.standard);
    setTracksViewChanges(true);
  }, [appear, cat.id, cat.photoUri, isNearby, callout]);

  // Safety net if onLoad never fires (sprite-only pins settle via callback).
  useEffect(() => {
    if (!tracksViewChanges) return;
    const freeze = setTimeout(() => setTracksViewChanges(false), 2500);
    return () => clearTimeout(freeze);
  }, [tracksViewChanges, cat.id, cat.photoUri]);

  const onVisualSettled = useCallback(() => {
    setTracksViewChanges(false);
  }, []);

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
      zIndex={isNearby ? 20 : captured ? 12 : 10}
    >
      <Animated.View
        style={[
          styles.wrap,
          { width: wrapW, height: wrapH, minWidth: CAT_PIN_AVATAR },
          bodyStyle,
        ]}
      >
        <CatPinVisual
          cat={cat}
          captured={captured}
          isNearby={isNearby}
          size={size}
          callout={callout}
          onVisualSettled={onVisualSettled}
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
