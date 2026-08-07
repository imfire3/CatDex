/**
 * Shared CatDex map pin — flat circular face + tip anchored to the ground.
 * Kept intentionally 2D so pins stay readable and stick to the map on zoom.
 *
 * Ownership:
 * - owned (ton CatDex) → photo + anneau brand
 * - mystery (autre joueur, pas encore capturé) → silhouette + anneau muted, sans photo
 */
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

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
  /** True when this cat is already in the player's CatDex. */
  captured?: boolean;
  isNearby?: boolean;
  /** Override diameter of the face circle (default 40). */
  size?: number;
  /** Fired once the photo settles (load or error) so native markers can freeze. */
  onVisualSettled?: () => void;
};

function MysteryFace({ size, color }: { size: number; color: string }) {
  const icon = Math.max(16, Math.round(size * 0.45));
  return (
    <Svg width={icon} height={icon} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.75} />
      <Path
        d="M9.2 9.2a2.8 2.8 0 0 1 5.4.9c0 1.6-1.4 2.2-2.1 2.7-.6.4-.9.9-.9 1.6"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
      />
      <Circle cx="12" cy="17.2" r="1.1" fill={color} />
    </Svg>
  );
}

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
  const owned = captured;
  const ringColor = owned
    ? isNearby
      ? colors.success
      : colors.brand
    : colors.textMuted;
  const tipColor = ringColor;
  const groundColor = owned ? colors.brandSoft : colors.surfaceMuted;
  const showPhoto =
    owned &&
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
            backgroundColor: groundColor,
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
              borderColor: ringColor,
              backgroundColor: owned ? colors.surfaceElevated : colors.surfaceSecondary,
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
          ) : owned ? (
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
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.surfaceSecondary,
              }}
            >
              <MysteryFace size={size} color={colors.textMuted} />
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
            borderTopColor: tipColor,
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
