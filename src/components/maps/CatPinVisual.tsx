/**
 * Explorer map pin — owned (solid ring + ✓) vs discoverable (dashed ring + ?).
 * Selected: larger pin with concentric brand pulse rings.
 */
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { CatImage } from '@/components/CatImage';
import { Text } from '@/components/Text';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { CatDiscoveryState } from '@/lib/catDiscovery';
import { isCatPhotoRef } from '@/lib/photoStorage';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

export const CAT_PIN_AVATAR = 40;
export const CAT_PIN_TIP_H = 8;
export const CAT_PIN_SILHOUETTE = 36;
export const CAT_PIN_SELECTED = 48;
const BADGE_SIZE = 16;

/**
 * Scale HTML pin content with MapLibre zoom so markers feel glued to the map.
 * Root Marker element must NOT be transformed — only an inner wrapper.
 */
export function pinScaleForZoom(zoom: number): number {
  return Math.min(1.2, Math.max(0.55, 0.55 + (zoom - 13) * 0.11));
}

export function canShowPinPhoto(uri?: string | null): boolean {
  if (!uri || uri.startsWith('blob:') || uri.startsWith('demo')) return false;
  return (
    isCatPhotoRef(uri) ||
    uri.startsWith('data:') ||
    uri.startsWith('http') ||
    uri.startsWith('file:')
  );
}

type PinVisualProps = {
  cat: Cat;
  /** @deprecated Prefer discoveryState — kept for call-site compatibility. */
  captured?: boolean;
  discoveryState?: CatDiscoveryState;
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

function PinStatusBadge({
  state,
  brand,
  onBrand,
  surface,
}: {
  state: CatDiscoveryState;
  brand: string;
  onBrand: string;
  surface: string;
}) {
  const owned = state === 'owned';
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.badge,
        {
          width: BADGE_SIZE,
          height: BADGE_SIZE,
          borderRadius: BADGE_SIZE / 2,
          backgroundColor: owned ? brand : surface,
          borderColor: brand,
          borderWidth: 1.5,
        },
      ]}
    >
      <Text
        variant="caption"
        style={{
          color: owned ? onBrand : brand,
          fontSize: 10,
          lineHeight: 12,
          fontWeight: '700',
        }}
      >
        {owned ? '✓' : '?'}
      </Text>
    </View>
  );
}

function NearbyDiscoverPulse({
  size,
  brandSoft,
  enabled,
}: {
  size: number;
  brandSoft: string;
  enabled: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(0.55);

  useEffect(() => {
    if (!enabled || reduceMotion) {
      pulse.value = 0.55;
      return;
    }
    pulse.value = withRepeat(
      withTiming(1, {
        duration: 2200,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [enabled, pulse, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    opacity: enabled && !reduceMotion ? pulse.value * 0.35 : 0,
    transform: [{ scale: 0.85 + pulse.value * 0.25 }],
  }));

  if (!enabled || reduceMotion) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.nearbyPulse,
        {
          width: size * 1.7,
          height: size * 1.7,
          borderRadius: (size * 1.7) / 2,
          backgroundColor: brandSoft,
          bottom: CAT_PIN_TIP_H + size / 2 - (size * 1.7) / 2,
        },
        style,
      ]}
    />
  );
}

/**
 * Visual-only pin body (no Map Marker wrapper).
 * Tip sits on the bottom edge — Marker anchor must be bottom-center.
 */
export function CatPinVisual({
  cat,
  captured = true,
  discoveryState,
  isNearby = false,
  selected = false,
  size,
  onVisualSettled,
}: PinVisualProps) {
  const { colors, spacing, radius, shadow } = useTheme();
  const state: CatDiscoveryState =
    discoveryState ?? (captured ? 'owned' : 'discoverable');
  const owned = state === 'owned';
  const pinSize = size ?? (selected ? CAT_PIN_SELECTED : CAT_PIN_SILHOUETTE);
  const tipW = spacing[16];
  const tipH = CAT_PIN_TIP_H;
  const pulseMax = selected ? pinSize * 2.4 : 0;
  const ringPad = 3;
  const ringSize = pinSize + ringPad * 2;
  const showPhoto = canShowPinPhoto(cat.photoUri);
  const [photoFailed, setPhotoFailed] = useState(false);
  const showNearbyPulse = isNearby && !owned && !selected;

  useEffect(() => {
    setPhotoFailed(false);
  }, [cat.id, cat.photoUri]);

  useEffect(() => {
    if (!showPhoto || photoFailed) {
      onVisualSettled?.();
    }
  }, [onVisualSettled, selected, pinSize, showPhoto, photoFailed, state]);

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
      accessibilityLabel={
        owned
          ? `${cat.name}, dans ton CatDex`
          : `${cat.name || 'Chat'}, à découvrir`
      }
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

      <NearbyDiscoverPulse
        size={pinSize}
        brandSoft={colors.brandSoft}
        enabled={showNearbyPulse}
      />

      <View style={styles.column}>
        <View style={{ width: ringSize, height: ringSize, alignItems: 'center', justifyContent: 'center' }}>
          <Svg
            width={ringSize}
            height={ringSize}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          >
            <Circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={(pinSize + (owned ? 2.5 : 2)) / 2}
              stroke={colors.brand}
              strokeWidth={owned ? 2.5 : 1.75}
              strokeOpacity={owned ? 1 : 0.72}
              strokeDasharray={owned ? undefined : '3.5 2.75'}
              fill="none"
            />
          </Svg>

          <View
            style={[
              styles.avatar,
              {
                width: pinSize,
                height: pinSize,
                borderRadius: radius.full,
                backgroundColor: colors.brand,
                borderWidth: 2,
                borderColor: colors.surface,
                opacity: owned ? 1 : 0.92,
              },
              owned ? shadow.medium : shadow.low,
            ]}
          >
            {showPhoto && !photoFailed ? (
              <>
                <CatImage
                  uri={cat.photoUri}
                  accessibilityLabel={cat.name}
                  style={{
                    width: pinSize,
                    height: pinSize,
                    opacity: owned ? 1 : 0.78,
                  }}
                  onLoad={() => onVisualSettled?.()}
                  onError={() => {
                    setPhotoFailed(true);
                    onVisualSettled?.();
                  }}
                />
                {!owned ? (
                  <View
                    pointerEvents="none"
                    style={[
                      StyleSheet.absoluteFill,
                      { backgroundColor: colors.surface, opacity: 0.22 },
                    ]}
                  />
                ) : null}
              </>
            ) : (
              <CatSilhouetteIcon
                color={colors.onBrand}
                size={Math.round(pinSize * 0.55)}
              />
            )}
          </View>

          <View style={styles.badgeAnchor}>
            <PinStatusBadge
              state={state}
              brand={colors.brand}
              onBrand={colors.onBrand}
              surface={colors.surface}
            />
          </View>
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
            borderTopColor: owned ? colors.brand : colors.brand,
            opacity: owned ? 1 : 0.75,
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
  nearbyPulse: {
    position: 'absolute',
    alignSelf: 'center',
  },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeAnchor: {
    position: 'absolute',
    top: -2,
    right: -2,
    zIndex: 4,
  },
});
