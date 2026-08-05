/**
 * Corner radius — soft, playful surfaces.
 * Small 12 · Medium 16 · Large 20 · Extra large 28 · Full 999
 */
export const radiusScale = [12, 16, 20, 28] as const;

export type RadiusValue = (typeof radiusScale)[number];

export const radius = {
  8: 12,
  12: 12,
  16: 16,
  20: 20,
  24: 20,
  28: 28,
  32: 28,
  xs: 12,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  sheet: 28,
  '2xl': 28,
  /** Primary CTA corners (brief: 20px). */
  cta: 20,
  pill: 999,
  full: 999,
} as const;
