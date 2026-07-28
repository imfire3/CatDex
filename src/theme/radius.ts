/**
 * Corner radius scale — single source of truth.
 */
export const radiusScale = [8, 12, 16, 24, 32] as const;

export type RadiusValue = (typeof radiusScale)[number];

export const radius = {
  8: 8,
  12: 12,
  16: 16,
  24: 24,
  32: 32,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  full: 999,
} as const;
