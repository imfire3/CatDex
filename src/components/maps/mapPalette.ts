/**
 * CatDex map tile palette — pale isometric game world.
 * Used by Google Maps `customMapStyle` and MapLibre style overrides.
 * Hex here are intentional (map style JSON cannot consume theme tokens).
 *
 * Reference look: high-key off-white ground, white extruded buildings,
 * thin lavender roads, soft mint parks, pale blue water — no labels.
 */
export const mapPalette = {
  /** Ground / canvas */
  land: '#F4F3F8',
  landSoft: '#EFEEF5',
  /** Building footprints + extrusions */
  building: '#FFFFFF',
  buildingShadow: '#E6E5EF',
  /** Parks & soft greenery */
  park: '#D8EFD0',
  parkDeep: '#B9DDB0',
  forest: '#C5E3BC',
  parkLabel: '#8BB884',
  /** Water */
  water: '#C9E4F5',
  waterLabel: '#8BB8D0',
  /** Delicate lavender / periwinkle roads */
  roadLocal: '#D0CBE6',
  roadArterial: '#C4BEE0',
  roadArterialStroke: '#B6AED6',
  roadHighway: '#B8B0D8',
  roadHighwayStroke: '#A69EC8',
  roadStroke: '#C8C2E0',
  /** Labels (kept muted; style usually hides them) */
  label: '#B0AEC0',
  labelStroke: '#F4F3F8',
} as const;
