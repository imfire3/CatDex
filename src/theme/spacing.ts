/**
 * Spacing — Figma Cat-DEX-UI 8pt system
 * Core: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64
 * 56 = large button · 80/96 kept for large layout gaps / multiline inputs
 */
export const spacingScale = [4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96] as const;

export type SpacingValue = (typeof spacingScale)[number];

export const spacing = {
  4: 4,
  8: 8,
  12: 12,
  16: 16,
  20: 20,
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

export function assertSpacing(value: number): asserts value is SpacingValue {
  if (!(spacingScale as readonly number[]).includes(value)) {
    throw new Error(`Spacing ${value} is outside the design-system scale`);
  }
}
