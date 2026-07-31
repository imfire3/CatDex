/**
 * Corner radius — game-premium surfaces.
 * buttons 24 · cards 28 · sheets 36 · inputs 20 · chips pill
 */
export const radiusScale = [8, 12, 16, 20, 24, 28, 32, 36] as const;

export type RadiusValue = (typeof radiusScale)[number];

export const radius = {
  8: 8,
  12: 12,
  16: 16,
  20: 20,
  24: 24,
  28: 28,
  32: 32,
  36: 36,
  xs: 8,
  sm: 12,
  md: 20,
  /** Buttons */
  button: 24,
  lg: 24,
  /** Cards */
  card: 28,
  xl: 28,
  '2xl': 32,
  /** Bottom sheets */
  sheet: 36,
  pill: 999,
  full: 999,
} as const;
