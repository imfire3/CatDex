import type { Camera } from 'react-native-maps';

import { PARIS_20E } from '@/lib/constants';
import { motionDuration } from '@/theme/motion';

/** Street-level framing for the 3D explorer. */
export const MAP_ZOOM = 16.6;

/** Strong quartier tilt (degrees) — buildings readable in 3D. */
export const MAP_PITCH = 62;

/** Camera animation duration — within 150–300 ms. */
export const MAP_CAMERA_DURATION = Math.min(motionDuration.slow, 280);

/**
 * Compass rotate duration — longer ease so heading-up feels continuous,
 * not stepped, when the phone turns.
 */
export const MAP_HEADING_DURATION = Math.max(motionDuration.slow, 420);

/** Longer fly when jumping to a cat in another quartier. */
export const MAP_FLY_TO_PIN_DURATION = Math.max(motionDuration.reveal, 640);

/** Approximate altitude (meters) for iOS when zoom is unavailable. */
export const MAP_ALTITUDE = 580;

/** How far the player may pinch out / in. */
export const MAP_MIN_ZOOM = 13;
export const MAP_MAX_ZOOM = 19;

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
 * Soft follow — keeps zoom / pitch, orients toward compass heading when known.
 */
export function buildFollowCamera(
  coordinate: { latitude: number; longitude: number },
  current?: Camera | null,
  heading?: number | null,
): Camera {
  return {
    center: coordinate,
    pitch: current?.pitch ?? MAP_PITCH,
    heading: heading ?? current?.heading ?? 0,
    zoom: current?.zoom ?? MAP_ZOOM,
    altitude: current?.altitude ?? MAP_ALTITUDE,
  };
}

export const INITIAL_MAP_CAMERA = buildMapCamera(PARIS_20E.center);
