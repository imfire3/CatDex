/**
 * Corner radius — surfaces/inputs at 8; CTAs (auth buttons) use 16.
 * Circles (FAB, avatar, badge, progress) keep pill/full.
 */
export const radiusScale = [8, 16] as const;

export type RadiusValue = (typeof radiusScale)[number];

export const radius = {
  8: 8,
  12: 8,
  16: 16,
  20: 8,
  24: 8,
  28: 8,
  32: 8,
  xs: 8,
  sm: 8,
  md: 8,
  lg: 8,
  xl: 16,
  sheet: 8,
  '2xl': 16,
  /** Auth / primary CTA corners (brief). */
  cta: 16,
  pill: 9999,
  full: 9999,
} as const;
