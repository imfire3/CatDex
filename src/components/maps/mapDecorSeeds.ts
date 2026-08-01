/**
 * Sparse decorative anchors in Paris 20e (parks / green corners).
 * Cap ≤ 10 — world flavor, never clutter.
 */
export type MapDecorKind = 'tree' | 'bush' | 'flower';

export type MapDecorSeed = {
  id: string;
  kind: MapDecorKind;
  latitude: number;
  longitude: number;
};

export const MAP_DECOR_SEEDS: readonly MapDecorSeed[] = [
  // Parc de Belleville / surrounds
  { id: 'd1', kind: 'tree', latitude: 48.8712, longitude: 2.3855 },
  { id: 'd2', kind: 'bush', latitude: 48.8704, longitude: 2.3868 },
  { id: 'd3', kind: 'flower', latitude: 48.8698, longitude: 2.3849 },
  // Père Lachaise edges
  { id: 'd4', kind: 'tree', latitude: 48.8612, longitude: 2.3938 },
  { id: 'd5', kind: 'tree', latitude: 48.8598, longitude: 2.3955 },
  // Square de la Place Édith Piaf / Charonne
  { id: 'd6', kind: 'bush', latitude: 48.8642, longitude: 2.4031 },
  { id: 'd7', kind: 'flower', latitude: 48.8651, longitude: 2.4012 },
  // Jardin de la Gare de Charonne area
  { id: 'd8', kind: 'tree', latitude: 48.8558, longitude: 2.3982 },
  // Near Bagnolet / Ménilmontant green pocket
  { id: 'd9', kind: 'bush', latitude: 48.8675, longitude: 2.3892 },
  { id: 'd10', kind: 'flower', latitude: 48.8628, longitude: 2.4075 },
] as const;
