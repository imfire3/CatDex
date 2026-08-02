/**
 * CatDex map tile palette — used only by Google Maps `customMapStyle`.
 * Hex here are intentional (Google style JSON cannot consume theme tokens).
 * Soft game-world look: luminous land, pastel parks, calm water, muted roads.
 */
export const mapPalette = {
  land: '#F8F8F5',
  landSoft: '#F3F3F0',
  building: '#EEEEEC',
  park: '#BFE8B4',
  parkLabel: '#7AAA72',
  forest: '#A8D49C',
  water: '#B8F0EA',
  waterLabel: '#6EB5AE',
  roadLocal: '#F0F0EC',
  roadArterial: '#E2E2DC',
  roadArterialStroke: '#D6D6D0',
  roadHighway: '#D8D8D2',
  roadHighwayStroke: '#CCCCC6',
  roadStroke: '#E8E8E2',
  label: '#B5B8BE',
  labelStroke: '#F8F8F5',
} as const;
