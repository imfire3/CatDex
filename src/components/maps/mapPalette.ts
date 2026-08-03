/**
 * CatDex map tile palette — used only by Google Maps `customMapStyle`.
 * Hex here are intentional (Google style JSON cannot consume theme tokens).
 * Soft game-world look: luminous land, pastel parks, calm water, muted roads.
 */
export const mapPalette = {
  land: '#F8F8F5',
  landSoft: '#F3F3F0',
  building: '#F4F4F8',
  park: '#BFE8B4',
  parkLabel: '#7AAA72',
  forest: '#A8D49C',
  water: '#B8F0EA',
  waterLabel: '#6EB5AE',
  roadLocal: '#ECECF2',
  roadArterial: '#D4D4DE',
  roadArterialStroke: '#BFC0CC',
  roadHighway: '#C8C8D4',
  roadHighwayStroke: '#B0B0BE',
  roadStroke: '#DCDCE6',
  label: '#B5B8BE',
  labelStroke: '#F8F8F5',
} as const;
