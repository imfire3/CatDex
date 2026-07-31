/**
 * Opacity tokens — soft overlays & disabled states.
 */
export const opacity = {
  none: 0,
  faint: 0.08,
  soft: 0.14,
  medium: 0.4,
  strong: 0.72,
  pressed: 0.88,
  disabled: 0.45,
  full: 1,
} as const;

export type OpacityToken = keyof typeof opacity;
