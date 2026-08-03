import type { Camera } from 'react-native-maps';

import { PARIS_20E } from '@/lib/constants';
import { motionDuration } from '@/theme/motion';

/** Street-level framing for the 3D explorer. */
export const MAP_ZOOM = 17;

/** Strong game-world tilt (degrees) — Apple/Google 3D buildings. */
export const MAP_PITCH = 58;

/** Camera animation duration — within 150–300 ms. */
export const MAP_CAMERA_DURATION = Math.min(motionDuration.slow, 280);

/** Approximate altitude (meters) for iOS when zoom is unavailable. */
export const MAP_ALTITUDE = 520;

/** How far the player may pinch out / in. */
export const MAP_MIN_ZOOM = 13;
export const MAP_MAX_ZOOM = 19;

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

/** Pan-only follow — keeps the user's current zoom / pitch. */
export function buildFollowCamera(
  coordinate: { latitude: number; longitude: number },
  current?: Camera | null,
): Camera {
  return {
    center: coordinate,
    pitch: current?.pitch ?? MAP_PITCH,
    heading: current?.heading ?? 0,
    zoom: current?.zoom ?? MAP_ZOOM,
    altitude: current?.altitude ?? MAP_ALTITUDE,
  };
}

export const INITIAL_MAP_CAMERA = buildMapCamera(PARIS_20E.center);
