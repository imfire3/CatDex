/**
 * CatDex map tile palette — pale flat game world.
 * Used by Google Maps `customMapStyle` and MapLibre style overrides.
 * Hex here are intentional (map style JSON cannot consume theme tokens).
 *
 * Matches app canvas (#F9F9FB): off-white ground, white buildings, gray
 * roads, mint parks, pale blue water — no labels, no brand wash.
 */
export const mapPalette = {
  /** Ground / canvas — same as theme background */
  land: '#F9F9FB',
  landSoft: '#EEF0F2',
  /** Building footprints + extrusions */
  building: '#FFFFFF',
  buildingShadow: '#D8DBDF',
  /** Parks & soft greenery */
  park: '#D8EFD0',
  parkDeep: '#B9DDB0',
  forest: '#C5E3BC',
  parkLabel: '#8BB884',
  /** Water */
  water: '#C9E4F5',
  waterLabel: '#8BB8D0',
  /** Neutral gray roads — brand stays on HUD / pins only */
  roadLocal: '#E4E6EA',
  roadArterial: '#D8DBDF',
  roadArterialStroke: '#CBD0D6',
  roadHighway: '#CBD0D6',
  roadHighwayStroke: '#B8BDC4',
  roadStroke: '#D8DBDF',
  /** Labels (kept muted; style usually hides them) */
  label: '#98A2B3',
  labelStroke: '#F9F9FB',
} as const;
