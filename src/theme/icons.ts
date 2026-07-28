/**
 * Icon sizing tokens — keep icons on the 8pt grid.
 */

export const iconSize = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
} as const;

export type IconSize = keyof typeof iconSize;

/** Stroke weight for outline icons */
export const iconStroke = {
  regular: 1.7,
  bold: 2.2,
} as const;
