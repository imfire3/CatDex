/**
 * Shared CatDex map pin — low-poly 3D cat sprite on a soft ground pulse.
 * Used by native Marker views and mirrored in the web MapLibre DOM pin.
 */
import { Image, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

/** Bundled low-poly tabby used as the Explorer map pin. */
export const LOWPOLY_CAT_PIN = require('../../../assets/models/lowpoly-tabby/pin.png');

export const CAT_PIN_AVATAR = 56;
export const CAT_PIN_TIP_H = 8;

type PinVisualProps = {
  cat: Cat;
  captured?: boolean;
  isNearby?: boolean;
  /** Override height of the cat sprite (default 56). */
  size?: number;
};

/**
 * Resolve a Metro `require()` image to a URL usable in DOM / MapLibre.
 */
export function resolveBundledImageUri(asset: number | string | { uri?: string }): string {
  if (typeof asset === 'string') return asset;
  if (asset && typeof asset === 'object' && typeof asset.uri === 'string') {
    return asset.uri;
  }
  const resolved = Image.resolveAssetSource(asset as number);
  return resolved?.uri ?? '';
}

/**
 * Visual-only pin body (no Map Marker wrapper).
 */
export function CatPinVisual({
  captured = true,
  isNearby = false,
  size = CAT_PIN_AVATAR,
}: PinVisualProps) {
  const { colors, spacing, radius } = useTheme();
  const tipW = spacing[16];
  const tipH = CAT_PIN_TIP_H;
  const spriteH = size;
  const spriteW = Math.round(size * 0.92);

  return (
    <View style={styles.root} pointerEvents="none">
      <View
        style={[
          styles.pulseOuter,
          {
            width: spriteW + spacing[16],
            height: spacing[24],
            borderRadius: radius.full,
            borderColor: colors.brandSoft,
            opacity: isNearby ? 0.95 : 0.65,
          },
        ]}
      />
      <View
        style={[
          styles.pulseInner,
          {
            width: spriteW * 0.72,
            height: spacing[8],
            borderRadius: radius.full,
            backgroundColor: colors.brandSoft,
            opacity: isNearby ? 0.85 : 0.5,
          },
        ]}
      />

      <View style={styles.column}>
        <Image
          source={LOWPOLY_CAT_PIN}
          accessibilityLabel="Chat"
          resizeMode="contain"
          style={{
            width: spriteW,
            height: spriteH,
            opacity: captured ? 1 : 0.72,
          }}
        />

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
  pulseOuter: {
    position: 'absolute',
    bottom: 6,
    borderWidth: 2,
  },
  pulseInner: {
    position: 'absolute',
    bottom: 10,
  },
});
