/**
 * Build CatDex pale flat MapLibre style from OpenFreeMap liberty JSON.
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
  sources?: Record<string, unknown>;
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
  'building-3d', // flat footprints only — extrusions hurt pin readability
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
 * Deep-clone + restyle liberty JSON into CatDex pale flat world.
 */
export function buildPaleIsometricStyle(base: MapStyle): MapStyle {
  const style: MapStyle = JSON.parse(JSON.stringify(base));
  const layers = style.layers ?? [];

  for (const layer of layers) {
    const id = layer.id;
    const paint = (layer.paint ??= {});
    const layout = (layer.layout ??= {});

    // Hide all text / icons / shields
    if (layer.type === 'symbol') {
      layout.visibility = 'none';
      continue;
    }

    // No extruded buildings — keep the map top-down and readable.
    if (layer.type === 'fill-extrusion' || HIDDEN_LAYER_IDS.has(id)) {
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
        paint['fill-opacity'] = 1;
        break;
      case 'park_outline':
        paint['line-color'] = p.parkDeep;
        paint['line-width'] = 0.55;
        paint['line-opacity'] = 0.5;
        break;
      case 'landcover_wood':
        paint['fill-color'] = p.forest;
        paint['fill-opacity'] = 1;
        break;
      case 'landcover_grass':
        paint['fill-color'] = p.park;
        paint['fill-opacity'] = 1;
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
        paint['fill-opacity'] = 1;
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
      case 'building':
        layout.visibility = 'visible';
        paint['fill-color'] = p.building;
        paint['fill-opacity'] = 1;
        break;
      default:
        break;
    }

    // Roads / tunnels / bridges — gray fills, quiet casings
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
        paint['line-opacity'] = 1;
        paint['line-width'] = thinRoadWidth(paint['line-width']);
      }
    }
  }

  return style;
}

/** Liberty style URL used as the pale-isometric base. */
export const LIBERTY_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

/** OpenFreeMap planet TileJSON — required to resolve the dated PBF path + maxzoom. */
export const OPENFREEMAP_PLANET_TILEJSON = 'https://tiles.openfreemap.org/planet';

type VectorTileJson = {
  tiles?: string[];
  minzoom?: number;
  maxzoom?: number;
};

type StyleSource = {
  type?: string;
  url?: string;
  tiles?: string[];
  minzoom?: number;
  maxzoom?: number;
  [key: string]: unknown;
};

/**
 * OpenFreeMap planet tops out at z14 and returns HTTP 200 + empty PBF above that.
 * MapLibre will not overzoom empty 200s — so we must pin maxzoom from TileJSON
 * (or MapLibre keeps requesting blank z15–19 tiles at MAP_ZOOM 16.6).
 *
 * Also: `/planet/{z}/{x}/{y}.pbf` (without the dated folder) returns empty tiles.
 * Always inline the TileJSON `tiles` URLs before `new Map()`.
 */
async function resolveVectorSources(style: MapStyle): Promise<MapStyle> {
  const sources = (style.sources ?? {}) as Record<string, StyleSource>;
  const next: Record<string, StyleSource> = { ...sources };

  await Promise.all(
    Object.entries(sources).map(async ([id, source]) => {
      if (source.type !== 'vector') return;
      if (source.tiles?.length && typeof source.maxzoom === 'number') return;

      const tileJsonUrl = source.url ?? (id === 'openmaptiles' ? OPENFREEMAP_PLANET_TILEJSON : null);
      if (!tileJsonUrl && source.tiles?.length) {
        next[id] = { ...source, maxzoom: source.maxzoom ?? 14, minzoom: source.minzoom ?? 0 };
        return;
      }
      if (!tileJsonUrl) return;

      try {
        const res = await fetch(tileJsonUrl);
        if (!res.ok) return;
        const tileJson = (await res.json()) as VectorTileJson;
        if (!tileJson.tiles?.length) return;
        const { url: _url, ...rest } = source;
        next[id] = {
          ...rest,
          tiles: tileJson.tiles,
          minzoom: tileJson.minzoom ?? 0,
          maxzoom: tileJson.maxzoom ?? 14,
        };
      } catch {
        // Keep original — caller may fall back to raster for local testing.
      }
    }),
  );

  return { ...style, sources: next };
}

/** Light raster basemap — local/Cursor fallback when vector tiles cannot be resolved. */
export function buildLocalTestRasterStyle(): MapStyle {
  return {
    version: 8,
    name: 'catdex-local-raster',
    sources: {
      carto: {
        type: 'raster',
        tiles: ['https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png'],
        tileSize: 256,
        attribution: '© OpenStreetMap © CARTO',
        maxzoom: 20,
      },
    },
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: { 'background-color': '#F9F9FB' },
      },
      { id: 'carto', type: 'raster', source: 'carto' },
    ],
  };
}

function hasInlineVectorTiles(style: MapStyle): boolean {
  const sources = (style.sources ?? {}) as Record<string, StyleSource>;
  return Object.values(sources).some(
    (source) => source.type === 'vector' && Array.isArray(source.tiles) && source.tiles.length > 0,
  );
}

export async function loadPaleIsometricStyle(): Promise<MapStyle> {
  try {
    const res = await fetch(LIBERTY_STYLE_URL);
    if (!res.ok) {
      throw new Error(`Failed to load map style (${res.status})`);
    }
    const base = (await res.json()) as MapStyle;
    const withTiles = await resolveVectorSources(base);
    if (!hasInlineVectorTiles(withTiles)) {
      console.warn(
        '[map] OpenFreeMap vector tiles unresolved — using raster basemap for local testing',
      );
      return buildLocalTestRasterStyle();
    }
    return buildPaleIsometricStyle(withTiles);
  } catch (error) {
    console.warn('[map] Liberty style failed — using raster basemap for local testing', error);
    return buildLocalTestRasterStyle();
  }
}
