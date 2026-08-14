import type { Camera } from 'react-native-maps';

import { PARIS_20E } from '@/lib/constants';
import { motionDuration } from '@/theme/motion';

/** Street-level framing for the explorer. */
export const MAP_ZOOM = 16.6;

/**
 * Flat top-down map — no 3D tilt (pitch caused zoom/follow bugs on Apple Maps).
 */
export const MAP_PITCH = 0;

/** Camera animation duration — within 150–300 ms. */
export const MAP_CAMERA_DURATION = Math.min(motionDuration.slow, 280);

/** Longer fly when jumping to a cat in another quartier. */
export const MAP_FLY_TO_PIN_DURATION = Math.max(motionDuration.reveal, 640);

/** Approximate altitude (meters) for iOS when zoom is unavailable. */
export const MAP_ALTITUDE = 720;

/** How far the player may pinch out / in around street-level framing. */
export const MAP_MIN_ZOOM = 15;
export const MAP_MAX_ZOOM = 18;

/** Min meters before soft follow re-centers on the player. */
export const MAP_FOLLOW_THRESHOLD_M = 5;

export function buildMapCamera(
  coordinate: { latitude: number; longitude: number },
  overrides?: Partial<Camera>,
): Camera {
  return {
    center: coordinate,
    pitch: MAP_PITCH,
    heading: 0,
    zoom: MAP_ZOOM,
    altitude: MAP_ALTITUDE,
    ...overrides,
  };
}

/**
 * Soft follow — keeps zoom (unless overridden), flat pitch, north-up.
 * Compass heading rotates the player pin only, never the map.
 *
 * Prefer the player's pinch zoom when known. Otherwise keep the live camera
 * zoom/altitude pair together so Apple Maps does not oscillate between them.
 */
export function buildFollowCamera(
  coordinate: { latitude: number; longitude: number },
  current?: Camera | null,
  _heading?: number | null,
  zoomOverride?: number | null,
): Camera {
  const zoom =
    typeof zoomOverride === 'number'
      ? zoomOverride
      : typeof current?.zoom === 'number'
        ? current.zoom
        : MAP_ZOOM;

  // When the player pinched to a zoom, omit altitude so the native map
  // derives it from zoom instead of fighting a stale altitude value.
  if (typeof zoomOverride === 'number') {
    return {
      center: coordinate,
      pitch: MAP_PITCH,
      heading: 0,
      zoom,
    };
  }

  return {
    center: coordinate,
    pitch: MAP_PITCH,
    heading: 0,
    zoom,
    altitude: current?.altitude ?? MAP_ALTITUDE,
  };
}

export const INITIAL_MAP_CAMERA = buildMapCamera(PARIS_20E.center);
