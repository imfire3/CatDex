/**
 * Shared CatDex map pin — flat circular face + tip anchored to the ground.
 * Kept intentionally 2D so pins stay readable and stick to the map on zoom.
 */
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { CatImage } from '@/components/CatImage';
import { CatSprite } from '@/components/CatSprite';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

export const CAT_PIN_AVATAR = 40;
export const CAT_PIN_TIP_H = 8;

/**
 * Scale HTML pin content with MapLibre zoom so markers feel glued to the map.
 * Root Marker element must NOT be transformed — only an inner wrapper.
 */
export function pinScaleForZoom(zoom: number): number {
  // minZoom 13 → ~0.55, default ~16.6 → ~1, maxZoom 19 → ~1.2
  return Math.min(1.2, Math.max(0.55, 0.55 + (zoom - 13) * 0.11));
}

type PinVisualProps = {
  cat: Cat;
  captured?: boolean;
  isNearby?: boolean;
  /** Override diameter of the face circle (default 40). */
  size?: number;
  /** Fired once the photo settles (load or error) so native markers can freeze. */
  onVisualSettled?: () => void;
};

/**
 * Visual-only pin body (no Map Marker wrapper).
 * Tip sits on the bottom edge — Marker anchor must be bottom-center.
 */
export function CatPinVisual({
  cat,
  captured = true,
  isNearby = false,
  size = CAT_PIN_AVATAR,
  onVisualSettled,
}: PinVisualProps) {
  const { colors, spacing, radius, shadow } = useTheme();
  const [photoFailed, setPhotoFailed] = useState(false);
  const tipW = spacing[16];
  const tipH = CAT_PIN_TIP_H;
  const ring = spacing[4];
  const showPhoto =
    Boolean(cat.photoUri) &&
    !photoFailed &&
    !cat.photoUri.startsWith('blob:');

  useEffect(() => {
    setPhotoFailed(false);
  }, [cat.id, cat.photoUri]);

  useEffect(() => {
    if (!showPhoto) {
      onVisualSettled?.();
    }
  }, [showPhoto, onVisualSettled]);

  return (
    <View style={styles.root} pointerEvents="none">
      <View
        style={[
          styles.ground,
          {
            width: size + spacing[8],
            height: spacing[8],
            borderRadius: radius.full,
            backgroundColor: colors.brandSoft,
            opacity: isNearby ? 0.9 : 0.55,
          },
        ]}
      />

      <View style={styles.column}>
        <View
          style={[
            styles.avatar,
            {
              width: size,
              height: size,
              borderRadius: radius.full,
              borderWidth: ring,
              borderColor: isNearby ? colors.accent : colors.brand,
              backgroundColor: colors.surfaceElevated,
              opacity: captured ? 1 : 0.82,
            },
            shadow.low,
          ]}
        >
          {showPhoto ? (
            <CatImage
              uri={cat.photoUri}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
              accessibilityLabel={cat.name}
              onError={() => {
                setPhotoFailed(true);
                onVisualSettled?.();
              }}
              onLoad={() => onVisualSettled?.()}
            />
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.surfaceSecondary,
              }}
            >
              <CatSprite
                colorLabel={cat.analysis?.color ?? 'Roux'}
                seed={cat.number}
                size={size - ring * 2}
                faceOnly
              />
            </View>
          )}
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
            borderTopColor: isNearby ? colors.accent : colors.brand,
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
  },
  avatar: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ground: {
    position: 'absolute',
    bottom: 2,
  },
});
