/**
 * Shared CatDex map pin — flat circular face + tip anchored to the ground.
 * Featured (nearby): photo + purple ring + name/distance callout.
 * Distant: grey silhouette pin (mock Explorer).
 */
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { CatImage } from '@/components/CatImage';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

export const CAT_PIN_AVATAR = 40;
export const CAT_PIN_TIP_H = 8;
export const CAT_PIN_SILHOUETTE = 32;

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
  /** Override diameter of the face circle (default 40 / 32). */
  size?: number;
  /** Purple bubble above the pin — e.g. "Nox · 90 m". */
  callout?: string | null;
  /** Fired once the photo settles (load or error) so native markers can freeze. */
  onVisualSettled?: () => void;
};

function CatSilhouetteIcon({ color, size }: { color: string; size: number }) {
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
  cat,
  captured = true,
  isNearby = false,
  size,
  callout,
  onVisualSettled,
}: PinVisualProps) {
  const { colors, spacing, radius, shadow, fonts } = useTheme();
  const [photoFailed, setPhotoFailed] = useState(false);
  const featured = isNearby;
  const pinSize = size ?? (featured ? spacing[48] : CAT_PIN_SILHOUETTE);
  const tipW = spacing[16];
  const tipH = CAT_PIN_TIP_H;
  const ring = featured ? spacing[4] : 0;
  const showPhoto =
    featured &&
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

  if (!featured) {
    return (
      <View style={styles.root} pointerEvents="none">
        <View
          style={[
            styles.avatar,
            {
              width: pinSize,
              height: pinSize,
              borderRadius: radius.full,
              backgroundColor: colors.textMuted,
              opacity: captured ? 0.92 : 0.8,
            },
            shadow.low,
          ]}
        >
          <CatSilhouetteIcon color={colors.onBrand} size={Math.round(pinSize * 0.62)} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root} pointerEvents="none">
      {callout ? (
        <View
          style={[
            styles.callout,
            {
              backgroundColor: colors.brand,
              borderRadius: radius.full,
              paddingHorizontal: spacing[8],
              paddingVertical: spacing[4],
              marginBottom: spacing[4],
              maxWidth: spacing[96] + spacing[48],
            },
            shadow.low,
          ]}
        >
          <Text
            variant="caption"
            color="onAccent"
            numberOfLines={1}
            style={{ fontFamily: fonts.bodySemi }}
          >
            {callout}
          </Text>
        </View>
      ) : null}

      <View
        style={[
          styles.ground,
          {
            width: pinSize + spacing[8],
            height: spacing[8],
            borderRadius: radius.full,
            backgroundColor: colors.brandSoft,
            opacity: 0.9,
          },
        ]}
      />

      <View style={styles.column}>
        <View
          style={[
            styles.avatar,
            {
              width: pinSize,
              height: pinSize,
              borderRadius: radius.full,
              borderWidth: ring,
              borderColor: colors.brand,
              backgroundColor: colors.surfaceElevated,
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
                backgroundColor: colors.brandSoft,
              }}
            >
              <CatSilhouetteIcon color={colors.brand} size={Math.round(pinSize * 0.55)} />
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
  callout: {
    zIndex: 2,
  },
});
