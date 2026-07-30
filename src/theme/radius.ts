/**
 * Corner radius — large, soft, premium.
 * Buttons 20 · Cards 24 · Sheets 28 · FAB full
 */
export const radiusScale = [12, 16, 20, 24, 28, 32] as const;

export type RadiusValue = (typeof radiusScale)[number];

export const radius = {
  12: 12,
  16: 16,
  20: 20,
  24: 24,
  28: 28,
  32: 32,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  sheet: 28,
  '2xl': 32,
  full: 9999,
} as const;
