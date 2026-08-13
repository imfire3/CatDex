/** Min degrees the compass must move before the map re-orients. */
export const MAP_HEADING_THRESHOLD_DEG = 4;

export function normalizeHeading(degrees: number): number {
  const n = degrees % 360;
  return n < 0 ? n + 360 : n;
}

/** Smallest absolute angle between two headings (0–180). */
export function headingDeltaDegrees(a: number, b: number): number {
  const delta = Math.abs(normalizeHeading(a) - normalizeHeading(b)) % 360;
  return delta > 180 ? 360 - delta : delta;
}

export type DeviceHeadingSample = {
  trueHeading: number;
  magHeading: number;
  accuracy: number;
};

/**
 * Prefer true north when available; fall back to magnetic.
 * Returns null when the sample is unusable.
 */
export function resolveDeviceHeading(sample: DeviceHeadingSample): number | null {
  const raw =
    sample.trueHeading >= 0 ? sample.trueHeading : sample.magHeading;
  if (!Number.isFinite(raw) || raw < 0) return null;

  return normalizeHeading(raw);
}

export function shouldUpdateHeading(
  previous: number | null,
  next: number,
  thresholdDeg = MAP_HEADING_THRESHOLD_DEG,
): boolean {
  if (previous == null) return true;
  return headingDeltaDegrees(previous, next) >= thresholdDeg;
}

/**
 * Web DeviceOrientation → compass degrees (0 = north, clockwise).
 * iOS Safari: webkitCompassHeading. Elsewhere: invert alpha (absolute or relative).
 */
export function headingFromDeviceOrientation(event: {
  alpha: number | null;
  absolute?: boolean;
  webkitCompassHeading?: number;
}): number | null {
  const webkit = event.webkitCompassHeading;
  if (typeof webkit === 'number' && Number.isFinite(webkit)) {
    return normalizeHeading(webkit);
  }

  if (typeof event.alpha === 'number' && Number.isFinite(event.alpha)) {
    return normalizeHeading(360 - event.alpha);
  }

  return null;
}

/** True when the browser requires a tap to unlock DeviceOrientation (iOS Safari). */
export function webCompassNeedsUserGesture(): boolean {
  if (typeof window === 'undefined') return false;
  type OrientationCtor = {
    requestPermission?: () => Promise<'granted' | 'denied'>;
  };
  const OrientationEvent = (
    window as Window & { DeviceOrientationEvent?: OrientationCtor }
  ).DeviceOrientationEvent;
  return typeof OrientationEvent?.requestPermission === 'function';
}
