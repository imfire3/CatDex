import type { Camera } from 'react-native-maps';

import { PARIS_20E } from '@/lib/constants';
import { motionDuration } from '@/theme/motion';

/** Street-level framing — slightly pulled back so the quartier breathes. */
export const MAP_ZOOM = 16.2;

/** Soft game tilt (degrees). */
export const MAP_PITCH = 38;

/** Camera animation duration — within 150–300 ms. */
export const MAP_CAMERA_DURATION = Math.min(motionDuration.slow, 280);

/** Approximate altitude (meters) for iOS when zoom is unavailable. */
export const MAP_ALTITUDE = 780;

/** Min meters before soft follow re-centers on the player. */
export const MAP_FOLLOW_THRESHOLD_M = 28;

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

export const INITIAL_MAP_CAMERA = buildMapCamera(PARIS_20E.center);
