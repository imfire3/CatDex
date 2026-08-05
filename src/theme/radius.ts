/**
 * Corner radius — Figma Cat-DEX-UI
 * Small 12 · Medium 16 · Large 20 · XL 28 · Full 999
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
  /** Small — chips, compact controls */
  xs: 12,
  sm: 12,
  /** Medium — buttons, inputs, color swatches */
  md: 16,
  /** Large — cards, panels */
  lg: 20,
  /** XL — sheets, large media */
  xl: 28,
  sheet: 28,
  '2xl': 28,
  /** Primary / CTA corners */
  cta: 16,
  pill: 999,
  full: 999,
} as const;
