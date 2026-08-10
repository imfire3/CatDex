/**
 * Explorer map pin — purple silhouette + tip (mock left screen).
 * Selected: larger pin with concentric brand pulse rings.
 */
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

export const CAT_PIN_AVATAR = 40;
export const CAT_PIN_TIP_H = 8;
export const CAT_PIN_SILHOUETTE = 36;
export const CAT_PIN_SELECTED = 48;

/**
 * Scale HTML pin content with MapLibre zoom so markers feel glued to the map.
 * Root Marker element must NOT be transformed — only an inner wrapper.
 */
export function pinScaleForZoom(zoom: number): number {
  return Math.min(1.2, Math.max(0.55, 0.55 + (zoom - 13) * 0.11));
}

type PinVisualProps = {
  cat: Cat;
  captured?: boolean;
  isNearby?: boolean;
  selected?: boolean;
  size?: number;
  /** @deprecated Option-1 mock has no name callout on pins. */
  callout?: string | null;
  onVisualSettled?: () => void;
};

export function CatSilhouetteIcon({
  color,
  size,
}: {
  color: string;
  size: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7.2 10.2 5.5 6.2l3 1.7M16.8 10.2 18.5 6.2l-3 1.7"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6.4 11c0 3.6 2.4 6.2 5.6 6.2s5.6-2.6 5.6-6.2c0-2.2-1.7-4-5.6-4s-5.6 1.8-5.6 4Z"
        fill={color}
      />
      <Circle cx="10.2" cy="12" r="0.9" fill="#FFFFFF" />
      <Circle cx="13.8" cy="12" r="0.9" fill="#FFFFFF" />
    </Svg>
  );
}

/**
 * Visual-only pin body (no Map Marker wrapper).
 * Tip sits on the bottom edge — Marker anchor must be bottom-center.
 */
export function CatPinVisual({
  selected = false,
  size,
  onVisualSettled,
}: PinVisualProps) {
  const { colors, spacing, radius, shadow } = useTheme();
  const pinSize = size ?? (selected ? CAT_PIN_SELECTED : CAT_PIN_SILHOUETTE);
  const tipW = spacing[16];
  const tipH = CAT_PIN_TIP_H;
  const pulseMax = selected ? pinSize * 2.4 : 0;

  useEffect(() => {
    onVisualSettled?.();
  }, [onVisualSettled, selected, pinSize]);

  return (
    <View
      style={[
        styles.root,
        selected
          ? {
              width: pulseMax,
              height: pulseMax / 2 + pinSize + tipH,
              justifyContent: 'flex-end',
            }
          : undefined,
      ]}
      pointerEvents="none"
    >
      {selected ? (
        <View
          style={[
            styles.pulseLayer,
            {
              width: pulseMax,
              height: pulseMax,
              bottom: tipH + pinSize / 2 - pulseMax / 2,
            },
          ]}
        >
          <View
            style={{
              width: pulseMax,
              height: pulseMax,
              borderRadius: pulseMax / 2,
              backgroundColor: colors.brandSoft,
              opacity: 0.55,
            }}
          />
          <View
            style={[
              styles.pulseRing,
              {
                width: pulseMax * 0.72,
                height: pulseMax * 0.72,
                borderRadius: (pulseMax * 0.72) / 2,
                borderColor: colors.brand,
                opacity: 0.28,
              },
            ]}
          />
          <View
            style={[
              styles.pulseRing,
              {
                width: pulseMax * 0.48,
                height: pulseMax * 0.48,
                borderRadius: (pulseMax * 0.48) / 2,
                borderColor: colors.brand,
                opacity: 0.4,
              },
            ]}
          />
        </View>
      ) : null}

      <View style={styles.column}>
        <View
          style={[
            styles.avatar,
            {
              width: pinSize,
              height: pinSize,
              borderRadius: radius.full,
              backgroundColor: colors.brand,
            },
            shadow.low,
          ]}
        >
          <CatSilhouetteIcon
            color={colors.onBrand}
            size={Math.round(pinSize * 0.55)}
          />
        </View>
        <View
          style={{
            width: 0,
            height: 0,
            marginTop: -spacing[4],
            borderLeftWidth: tipW / 2,
            borderRightWidth: tipW / 2,
            borderTopWidth: tipH,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderTopColor: colors.brand,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  column: {
    alignItems: 'center',
    zIndex: 2,
  },
  avatar: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseLayer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 2,
  },
});
