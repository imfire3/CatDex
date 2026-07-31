/**
 * Corner radius — compact, consistent.
 * chips 12 · inputs/buttons 16 · cards 24 · sheets 32 · FAB pill
 */
export const radiusScale = [8, 12, 16, 20, 24, 28, 32] as const;

export type RadiusValue = (typeof radiusScale)[number];

export const radius = {
  8: 8,
  12: 12,
  16: 16,
  20: 20,
  24: 24,
  28: 28,
  32: 32,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  sheet: 32,
  '2xl': 32,
  pill: 9999,
  full: 9999,
} as const;
