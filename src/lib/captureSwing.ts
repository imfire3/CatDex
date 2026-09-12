export const CAPTURE_SWING_MIN_MS = 1_200;
export const CAPTURE_SWING_MAX_MS = 2_200;
/** Total width of the hit zone as a fraction of the track (centered on 0.5). */
export const CAPTURE_HIT_WINDOW = 0.14;
/** Total duration for the 3 success shakes. */
export const CAPTURE_SHAKE_TOTAL_MS = 1_200;

export type CaptureSwingPhase = 'swinging' | 'resolving' | 'success';

export function sampleSwingDurationMs(random: () => number = Math.random): number {
  const t = Math.min(1, Math.max(0, random()));
  return Math.round(
    CAPTURE_SWING_MIN_MS + t * (CAPTURE_SWING_MAX_MS - CAPTURE_SWING_MIN_MS),
  );
}

export function isCaptureHit(
  normalizedX: number,
  hitWindow: number = CAPTURE_HIT_WINDOW,
): boolean {
  const half = hitWindow / 2;
  const lo = 0.5 - half;
  const hi = 0.5 + half;
  return normalizedX >= lo && normalizedX <= hi;
}

export function resolveCaptureTap(
  phase: CaptureSwingPhase,
  normalizedX: number,
): 'hit' | 'miss' | 'ignored' {
  if (phase !== 'swinging') return 'ignored';
  return isCaptureHit(normalizedX) ? 'hit' : 'miss';
}
