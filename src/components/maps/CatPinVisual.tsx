/**
 * Shared CatDex map pin look — circular photo, brand ring, tip, paw badge.
 * Used by native Marker views and mirrored in the web MapLibre DOM pin.
 */
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { CatImage } from '@/components/CatImage';
import { CatSprite } from '@/components/CatSprite';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

export const CAT_PIN_AVATAR = 48;
export const CAT_PIN_TIP_H = 10;
export const CAT_PIN_BADGE = 20;

type PinVisualProps = {
  cat: Cat;
  captured?: boolean;
  isNearby?: boolean;
  /** Override diameter of the photo circle (default 48). */
  size?: number;
};

export function PawIcon({
  color,
  size = 11,
}: {
  color: string;
  size?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 11.2c-1.2 0-2.2.9-2.2 2.1v.9h4.4v-.9c0-1.2-1-2.1-2.2-2.1Z"
        fill={color}
      />
      <Path
        d="M7.4 10.4a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4ZM16.6 10.4a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4ZM4.8 13.2a1.55 1.55 0 1 0 0-3.1 1.55 1.55 0 0 0 0 3.1ZM19.2 13.2a1.55 1.55 0 1 0 0-3.1 1.55 1.55 0 0 0 0 3.1Z"
        fill={color}
      />
      <Path
        d="M8.2 18.6c1.4-1.9 2.7-2.8 3.8-2.8s2.4.9 3.8 2.8c.5.7-.2 1.9-1.4 1.9H9.6c-1.2 0-1.9-1.2-1.4-1.9Z"
        fill={color}
      />
    </Svg>
  );
}

/**
 * Visual-only pin body (no Map Marker wrapper).
 */
export function CatPinVisual({
  cat,
  captured = true,
  isNearby = false,
  size = CAT_PIN_AVATAR,
}: PinVisualProps) {
  const { colors, spacing, shadow, radius } = useTheme();
  const [photoFailed, setPhotoFailed] = useState(false);
  const border = spacing[4];
  const badge = CAT_PIN_BADGE;
  const tipW = spacing[16];
  const tipH = CAT_PIN_TIP_H;
  const showPhoto =
    Boolean(cat.photoUri) &&
    !photoFailed &&
    !cat.photoUri.startsWith('blob:');

  return (
    <View style={styles.root} pointerEvents="none">
      {/* Soft ground pulse */}
      <View
        style={[
          styles.pulseOuter,
          {
            width: size + spacing[24],
            height: size + spacing[24],
            borderRadius: radius.full,
            borderColor: colors.brandSoft,
            opacity: isNearby ? 1 : 0.7,
          },
        ]}
      />
      <View
        style={[
          styles.pulseInner,
          {
            width: size + spacing[8],
            height: size + spacing[8],
            borderRadius: radius.full,
            backgroundColor: colors.brandSoft,
            opacity: isNearby ? 0.9 : 0.55,
          },
        ]}
      />

      <View style={styles.column}>
        <View
          style={[
            styles.avatarWrap,
            {
              width: size,
              height: size,
              borderRadius: radius.full,
              borderWidth: border,
              borderColor: colors.brand,
              backgroundColor: colors.surfaceElevated,
              opacity: captured ? 1 : 0.78,
            },
            shadow.medium,
          ]}
        >
          <View
            style={{
              flex: 1,
              borderRadius: radius.full,
              overflow: 'hidden',
              backgroundColor: colors.surfaceSecondary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CatSprite colorLabel={cat.analysis.color} seed={cat.number} size={size * 0.72} />
            {showPhoto ? (
              <CatImage
                uri={cat.photoUri}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
                onError={() => setPhotoFailed(true)}
              />
            ) : null}
          </View>

          <View
            style={[
              styles.badge,
              {
                width: badge,
                height: badge,
                borderRadius: radius.full,
                backgroundColor: colors.brand,
                borderWidth: 2,
                borderColor: colors.surfaceElevated,
                top: -spacing[4],
                right: -spacing[4],
              },
              shadow.low,
            ]}
          >
            <PawIcon color={colors.onBrand} size={11} />
          </View>
        </View>

        {/* Pointer tip */}
        <View
          style={{
            width: 0,
            height: 0,
            marginTop: -2,
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
  avatarWrap: {
    position: 'relative',
    overflow: 'visible',
  },
  badge: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  pulseOuter: {
    position: 'absolute',
    bottom: 2,
    borderWidth: 2,
  },
  pulseInner: {
    position: 'absolute',
    bottom: 8,
  },
});

/** Inline SVG string for web MapLibre pins (same paw glyph). */
export const PAW_SVG_MARKUP = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 11.2c-1.2 0-2.2.9-2.2 2.1v.9h4.4v-.9c0-1.2-1-2.1-2.2-2.1Z" fill="white"/><path d="M7.4 10.4a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4ZM16.6 10.4a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4ZM4.8 13.2a1.55 1.55 0 1 0 0-3.1 1.55 1.55 0 0 0 0 3.1ZM19.2 13.2a1.55 1.55 0 1 0 0-3.1 1.55 1.55 0 0 0 0 3.1Z" fill="white"/><path d="M8.2 18.6c1.4-1.9 2.7-2.8 3.8-2.8s2.4.9 3.8 2.8c.5.7-.2 1.9-1.4 1.9H9.6c-1.2 0-1.9-1.2-1.4-1.9Z" fill="white"/></svg>`;
