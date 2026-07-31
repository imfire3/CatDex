/**
 * 8pt grid — ONLY these values are allowed in the Design System.
 * 4 = micro only. 56 / 80 added for button height / large gaps.
 */
export const spacingScale = [4, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96] as const;

export type SpacingValue = (typeof spacingScale)[number];

export const spacing = {
  4: 4,
  8: 8,
  16: 16,
  24: 24,
  32: 32,
  40: 40,
  48: 48,
  56: 56,
  64: 64,
  80: 80,
  96: 96,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,
  '5xl': 96,
} as const;
