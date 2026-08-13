import { memo, useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import {
  CAT_PIN_SELECTED,
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
  captured?: boolean;
  selected?: boolean;
  callout?: string | null;
};

/**
 * Map pin — purple silhouette; selected grows with pulse rings.
 */
function CatMapMarkerComponent({
  cat,
  onPress,
  isNearby = false,
  captured = true,
  selected = false,
}: Props) {
  const { spacing } = useTheme();
  const size = selected ? CAT_PIN_SELECTED : CAT_PIN_SILHOUETTE;
  const pulseMax = selected ? size * 2.4 : 0;
  const wrapW = selected ? pulseMax : size + spacing[16];
  const wrapH = selected
    ? pulseMax / 2 + size + CAT_PIN_TIP_H
    : size + CAT_PIN_TIP_H;

  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const appear = useSharedValue(0);

  useEffect(() => {
    appear.value = withSpring(1, motionEasing.standard);
    setTracksViewChanges(true);
  }, [appear, cat.id, selected, cat.photoUri]);

  useEffect(() => {
    if (!tracksViewChanges) return;
    const freeze = setTimeout(() => setTracksViewChanges(false), 1200);
    return () => clearTimeout(freeze);
  }, [tracksViewChanges, cat.id, selected]);

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
      zIndex={selected ? 30 : isNearby ? 20 : captured ? 12 : 10}
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
          selected={selected}
          size={size}
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
