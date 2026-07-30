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

/** Stroke weight for outline icons — SF Symbols / Lucide thin feel */
export const iconStroke = {
  regular: 1.5,
  bold: 1.8,
} as const;
