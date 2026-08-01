import type { Camera } from 'react-native-maps';

import { PARIS_20E } from '@/lib/constants';
import { motionDuration } from '@/theme/motion';

/** Pokémon GO–like street-level framing (~16.8). */
export const MAP_ZOOM = 16.8;

/** Soft game tilt (degrees). */
export const MAP_PITCH = 35;

/** Camera animation duration — within 150–350 ms. */
export const MAP_CAMERA_DURATION = motionDuration.slow;

/** Approximate altitude (meters) for iOS when zoom is unavailable. */
export const MAP_ALTITUDE = 650;

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
