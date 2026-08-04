/**
 * Build CatDex pale isometric MapLibre style from OpenFreeMap liberty JSON.
 * Prefers transforming the style object before `new Map()` so labels/roads
 * are correct on first paint (runtime setPaintProperty can miss expression layers).
 */
import { mapPalette as p } from './mapPalette';

type StyleLayer = {
  id: string;
  type?: string;
  layout?: Record<string, unknown>;
  paint?: Record<string, unknown>;
  [key: string]: unknown;
};

type MapStyle = {
  layers?: StyleLayer[];
  [key: string]: unknown;
};

const HIDDEN_LAYER_IDS = new Set([
  'natural_earth',
  'aeroway_fill',
  'aeroway_runway',
  'aeroway_taxiway',
  'road_area_pattern',
  'road_one_way_arrow',
  'road_one_way_arrow_opposite',
  'road_major_rail',
  'road_major_rail_hatching',
  'road_transit_rail',
  'road_transit_rail_hatching',
  'tunnel_major_rail',
  'tunnel_major_rail_hatching',
  'tunnel_transit_rail',
  'tunnel_transit_rail_hatching',
  'bridge_major_rail',
  'bridge_major_rail_hatching',
  'building', // extrusion-only look when building-3d exists
]);

function isRoadLine(id: string) {
  return (
    id.startsWith('road_') ||
    id.startsWith('tunnel_') ||
    id.startsWith('bridge_')
  );
}

function roadFillColor(id: string) {
  if (id.includes('motorway') || id.includes('trunk') || id.includes('primary')) {
    return p.roadHighway;
  }
  if (id.includes('secondary') || id.includes('tertiary') || id.includes('link')) {
    return p.roadArterial;
  }
  return p.roadLocal;
}

function thinRoadWidth(existing: unknown): unknown {
  // Keep zoom curve shape but scale down so roads read as delicate lines.
  if (!Array.isArray(existing)) return 1.2;
  try {
    return [
      'interpolate',
      ['exponential', 1.15],
      ['zoom'],
      12,
      0,
      14,
      0.8,
      16,
      1.6,
      18,
      3.2,
      20,
      5,
    ];
  } catch {
    return existing;
  }
}

/**
 * Deep-clone + restyle liberty JSON into CatDex pale isometric world.
 */
export function buildPaleIsometricStyle(base: MapStyle): MapStyle {
  const style: MapStyle = JSON.parse(JSON.stringify(base));
  const layers = style.layers ?? [];
  const hasBuilding3d = layers.some((l) => l.id === 'building-3d');

  for (const layer of layers) {
    const id = layer.id;
    const paint = (layer.paint ??= {});
    const layout = (layer.layout ??= {});

    // Hide all text / icons / shields
    if (layer.type === 'symbol') {
      layout.visibility = 'none';
      continue;
    }

    if (HIDDEN_LAYER_IDS.has(id) || (id === 'building' && hasBuilding3d)) {
      layout.visibility = 'none';
      continue;
    }

    if (id.includes('rail')) {
      layout.visibility = 'none';
      continue;
    }

    switch (id) {
      case 'background':
        paint['background-color'] = p.land;
        break;
      case 'park':
        paint['fill-color'] = p.park;
        paint['fill-opacity'] = 0.92;
        paint['fill-outline-color'] = p.parkDeep;
        break;
      case 'park_outline':
        paint['line-color'] = p.parkDeep;
        paint['line-width'] = 0.55;
        paint['line-opacity'] = 0.5;
        break;
      case 'landcover_wood':
        paint['fill-color'] = p.forest;
        paint['fill-opacity'] = 0.7;
        break;
      case 'landcover_grass':
        paint['fill-color'] = p.park;
        paint['fill-opacity'] = 0.75;
        break;
      case 'landcover_sand':
        paint['fill-color'] = p.landSoft;
        break;
      case 'landcover_ice':
        paint['fill-color'] = p.water;
        break;
      case 'landcover_wetland':
        paint['fill-color'] = p.park;
        break;
      case 'landuse_residential':
        paint['fill-color'] = p.landSoft;
        paint['fill-opacity'] = 0.3;
        break;
      case 'landuse_pitch':
      case 'landuse_track':
        paint['fill-color'] = p.park;
        break;
      case 'landuse_cemetery':
        paint['fill-color'] = p.forest;
        break;
      case 'landuse_hospital':
      case 'landuse_school':
        paint['fill-color'] = p.landSoft;
        break;
      case 'water':
        paint['fill-color'] = p.water;
        break;
      case 'waterway_river':
      case 'waterway_other':
      case 'waterway_tunnel':
        paint['line-color'] = p.water;
        break;
      case 'building-3d':
        paint['fill-extrusion-color'] = p.building;
        paint['fill-extrusion-opacity'] = 0.96;
        paint['fill-extrusion-vertical-gradient'] = true;
        break;
      default:
        break;
    }

    // Roads / tunnels / bridges — lavender fills, quiet casings
    if (layer.type === 'line' && isRoadLine(id) && !id.includes('rail')) {
      if (id.includes('casing') || id.includes('path_pedestrian')) {
        if (id.includes('path_pedestrian') && !id.includes('casing')) {
          paint['line-color'] = p.roadLocal;
          paint['line-opacity'] = 0.55;
          paint['line-width'] = thinRoadWidth(paint['line-width']);
        } else {
          paint['line-color'] = p.land;
          paint['line-opacity'] = 0.25;
          paint['line-width'] = 0.6;
        }
      } else {
        paint['line-color'] = roadFillColor(id);
        paint['line-opacity'] = 0.95;
        paint['line-width'] = thinRoadWidth(paint['line-width']);
      }
    }
  }

  return style;
}

/** Liberty style URL used as the pale-isometric base. */
export const LIBERTY_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

export async function loadPaleIsometricStyle(): Promise<MapStyle> {
  const res = await fetch(LIBERTY_STYLE_URL);
  if (!res.ok) {
    throw new Error(`Failed to load map style (${res.status})`);
  }
  const base = (await res.json()) as MapStyle;
  return buildPaleIsometricStyle(base);
}
