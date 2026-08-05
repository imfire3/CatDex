import { createElement, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { loadPaleIsometricStyle } from '@/components/maps/applyPaleIsometricStyle';
import {
  INITIAL_MAP_CAMERA,
  MAP_PITCH,
  MAP_ZOOM,
} from '@/components/maps/mapCamera';
import {
  CAT_PIN_AVATAR,
  CAT_PIN_TIP_H,
  pinScaleForZoom,
} from '@/components/maps/CatPinVisual';
import { mapPalette } from '@/components/maps/mapPalette';
import { themeFromColorLabel } from '@/lib/catTheme';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

type Props = {
  cats: Cat[];
  scheme: 'light' | 'dark';
  onSelectCat: (cat: Cat) => void;
  focusCoordinate?: { latitude: number; longitude: number } | null;
  userCoordinate?: { latitude: number; longitude: number } | null;
  nearbyCatIds?: string[];
  capturedCatIds?: string[];
};

/** OpenFreeMap liberty — fetched + restyled to pale isometric before Map init. */
const BUILDINGS_LAYER_ID = 'catdex-3d-buildings';
const MAPLIBRE_JS = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js';
const MAPLIBRE_CSS = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css';

type LngLatLike = [number, number];

type MapLibreMap = {
  addControl: (control: unknown, position?: string) => void;
  addLayer: (layer: Record<string, unknown>, beforeId?: string) => void;
  easeTo: (opts: Record<string, unknown>) => void;
  getLayer: (id: string) => unknown;
  getStyle: () => { layers?: Array<Record<string, unknown>>; sources?: Record<string, unknown> } | undefined;
  getZoom: () => number;
  on: (event: string, cb: () => void) => void;
  off: (event: string, cb: () => void) => void;
  remove: () => void;
  setLayoutProperty: (id: string, name: string, value: unknown) => void;
  setPaintProperty: (id: string, name: string, value: unknown) => void;
};

type MapLibreMarker = {
  addTo: (map: MapLibreMap) => MapLibreMarker;
  remove: () => void;
  setLngLat: (lngLat: LngLatLike) => MapLibreMarker;
  getElement: () => HTMLElement;
};

type MapLibreNS = {
  Map: new (opts: Record<string, unknown>) => MapLibreMap;
  Marker: new (opts?: Record<string, unknown>) => MapLibreMarker & {
    setLngLat: (lngLat: LngLatLike) => MapLibreMarker;
    addTo: (map: MapLibreMap) => MapLibreMarker;
  };
  NavigationControl: new (opts?: Record<string, unknown>) => unknown;
};

declare global {
  interface Window {
    maplibregl?: MapLibreNS;
  }
}

function ensureCss() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('maplibre-css')) return;
  const link = document.createElement('link');
  link.id = 'maplibre-css';
  link.rel = 'stylesheet';
  link.href = MAPLIBRE_CSS;
  document.head.appendChild(link);
}

function loadMapLibre(): Promise<MapLibreNS> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('MapLibre requires a browser'));
  }
  if (window.maplibregl?.Map) return Promise.resolve(window.maplibregl);

  ensureCss();

  const existing = document.getElementById('maplibre-js') as HTMLScriptElement | null;
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => {
        if (window.maplibregl?.Map) resolve(window.maplibregl);
        else reject(new Error('MapLibre failed to load'));
      });
      existing.addEventListener('error', () => reject(new Error('MapLibre script error')));
      if (window.maplibregl?.Map) resolve(window.maplibregl);
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = 'maplibre-js';
    script.src = MAPLIBRE_JS;
    script.async = true;
    script.onload = () => {
      if (window.maplibregl?.Map) resolve(window.maplibregl);
      else reject(new Error('MapLibre global missing after load'));
    };
    script.onerror = () => reject(new Error('Failed to load MapLibre'));
    document.head.appendChild(script);
  });
}

function ensure3dBuildings(map: MapLibreMap) {
  // Liberty already ships `building-3d` after pale transform — restyle only.
  if (map.getLayer('building-3d') || map.getLayer(BUILDINGS_LAYER_ID)) return;

  const style = map.getStyle();
  const sourceId =
    Object.keys(style?.sources ?? {}).find((id) => {
      const source = style?.sources?.[id] as { type?: string } | undefined;
      return source?.type === 'vector';
    }) ?? 'openmaptiles';

  try {
    map.addLayer({
      id: BUILDINGS_LAYER_ID,
      source: sourceId,
      'source-layer': 'building',
      type: 'fill-extrusion',
      minzoom: 14,
      filter: ['!=', ['get', 'hide_3d'], true],
      paint: {
        'fill-extrusion-color': mapPalette.building,
        'fill-extrusion-height': [
          'interpolate',
          ['linear'],
          ['zoom'],
          14,
          0,
          15,
          ['coalesce', ['get', 'render_height'], ['get', 'height'], 12],
        ],
        'fill-extrusion-base': [
          'coalesce',
          ['get', 'render_min_height'],
          ['get', 'min_height'],
          0,
        ],
        'fill-extrusion-opacity': 0.96,
        'fill-extrusion-vertical-gradient': true,
      },
    });
  } catch {
    // Style may already include extrusions — pitch alone still reads 3D.
  }
}

function shadeHex(hex: string, amount: number): string {
  const raw = hex.replace('#', '');
  if (raw.length !== 6) return hex;
  const num = Number.parseInt(raw, 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + Math.round(255 * amount)));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + Math.round(255 * amount)));
  const b = Math.min(255, Math.max(0, (num & 0xff) + Math.round(255 * amount)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/** Flat circular face pin for MapLibre HTML markers (tip = ground anchor). */
function makePinElement(opts: {
  label: string;
  brand: string;
  brandSoft: string;
  accent: string;
  size: number;
  coatColor: string;
  seed: number;
  photoUri?: string;
  dimmed?: boolean;
  nearby?: boolean;
}): HTMLButtonElement {
  const size = opts.size;
  const tipH = CAT_PIN_TIP_H;
  const tipW = 16;
  const ring = 4;
  const wrapW = size + 16;
  const wrapH = size + tipH;
  const ringColor = opts.nearby ? opts.accent : opts.brand;
  const theme = themeFromColorLabel(opts.coatColor, opts.seed);
  const fill = theme.hex;
  const dark = shadeHex(fill, -0.22);
  const light = shadeHex(fill, 0.28);
  const face = size - ring * 2;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.setAttribute('aria-label', opts.label);
  // Outer box is what MapLibre positions — never transform this node.
  btn.style.cssText = [
    'border:0',
    'padding:0',
    'cursor:pointer',
    'background:transparent',
    `width:${wrapW}px`,
    `height:${wrapH}px`,
    'display:flex',
    'align-items:flex-end',
    'justify-content:center',
    'overflow:visible',
    opts.dimmed ? 'opacity:0.82' : 'opacity:1',
  ].join(';');

  // Inner scales with zoom from the tip (bottom center).
  const scaleRoot = document.createElement('span');
  scaleRoot.setAttribute('data-pin-scale', '1');
  scaleRoot.style.cssText = [
    'position:relative',
    'display:flex',
    'flex-direction:column',
    'align-items:center',
    'justify-content:flex-end',
    `width:${wrapW}px`,
    `height:${wrapH}px`,
    'transform-origin:bottom center',
    'will-change:transform',
  ].join(';');

  const ground = document.createElement('span');
  ground.style.cssText = [
    'position:absolute',
    `width:${size + 8}px`,
    'height:8px',
    'border-radius:999px',
    `background:${opts.brandSoft}`,
    'bottom:2px',
    'left:50%',
    'margin-left:' + `${-((size + 8) / 2)}px`,
    opts.nearby ? 'opacity:0.9' : 'opacity:0.55',
    'pointer-events:none',
  ].join(';');

  const column = document.createElement('span');
  column.style.cssText = [
    'display:flex',
    'flex-direction:column',
    'align-items:center',
    'position:relative',
    'z-index:1',
  ].join(';');

  const avatar = document.createElement('span');
  avatar.style.cssText = [
    `width:${size}px`,
    `height:${size}px`,
    'border-radius:999px',
    `border:${ring}px solid ${ringColor}`,
    'background:#fff',
    'overflow:hidden',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'box-sizing:border-box',
  ].join(';');

  const showPhoto =
    Boolean(opts.photoUri) &&
    !opts.photoUri!.startsWith('blob:') &&
    !opts.dimmed;

  if (showPhoto) {
    const img = document.createElement('img');
    img.alt = opts.label;
    img.draggable = false;
    img.src = opts.photoUri!;
    img.style.cssText =
      'width:100%;height:100%;object-fit:cover;display:block;pointer-events:none';
    img.onerror = () => {
      img.remove();
      avatar.appendChild(faceSvg(face, fill, dark, light));
    };
    avatar.appendChild(img);
  } else {
    avatar.appendChild(faceSvg(face, fill, dark, light));
  }

  const tip = document.createElement('span');
  tip.style.cssText = [
    'width:0',
    'height:0',
    'margin-top:-4px',
    `border-left:${tipW / 2}px solid transparent`,
    `border-right:${tipW / 2}px solid transparent`,
    `border-top:${tipH}px solid ${ringColor}`,
  ].join(';');

  column.appendChild(avatar);
  column.appendChild(tip);
  scaleRoot.appendChild(ground);
  scaleRoot.appendChild(column);
  btn.appendChild(scaleRoot);
  return btn;
}

function faceSvg(size: number, fill: string, dark: string, light: string): SVGSVGElement {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('viewBox', '0 0 64 64');
  svg.style.cssText = 'display:block;pointer-events:none';
  svg.innerHTML = [
    `<circle cx="32" cy="34" r="22" fill="${fill}" />`,
    `<path d="M14 22 8 6l14 10Z" fill="${fill}" />`,
    `<path d="M50 22 56 6 42 16Z" fill="${fill}" />`,
    `<path d="M14 22 8 6l14 10Z" fill="${light}" opacity="0.45" />`,
    `<path d="M50 22 56 6 42 16Z" fill="${light}" opacity="0.45" />`,
    `<ellipse cx="24" cy="34" rx="3.2" ry="4" fill="${dark}" />`,
    `<ellipse cx="40" cy="34" rx="3.2" ry="4" fill="${dark}" />`,
    `<path d="M32 38c1.6 1.4 3.2 1.4 4.8 0" stroke="${dark}" stroke-width="1.6" stroke-linecap="round" fill="none" />`,
    `<circle cx="32" cy="36" r="1.4" fill="${dark}" />`,
  ].join('');
  return svg;
}

function applyMarkerZoomScale(map: MapLibreMap, markers: MapLibreMarker[]) {
  const scale = pinScaleForZoom(map.getZoom());
  markers.forEach((marker) => {
    const inner = marker.getElement().querySelector('[data-pin-scale]') as HTMLElement | null;
    if (!inner) return;
    inner.style.transform = `scale(${scale})`;
  });
}

/**
 * Web Explorer map — MapLibre (CDN) with pitch + extruded buildings.
 * Loaded from CDN to avoid Metro ESM/CJS interop issues with maplibre-gl.
 */
export function CatMap({
  cats,
  onSelectCat,
  focusCoordinate,
  userCoordinate,
  nearbyCatIds,
  capturedCatIds,
}: Props) {
  const { colors, spacing } = useTheme();
  const hostRef = useRef<HTMLDivElement | null>(null);
  const maplibreRef = useRef<MapLibreNS | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const catMarkersRef = useRef<MapLibreMarker[]>([]);
  const playerMarkerRef = useRef<MapLibreMarker | null>(null);
  const onSelectRef = useRef(onSelectCat);
  const [mapReady, setMapReady] = useState(false);
  onSelectRef.current = onSelectCat;

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const host = hostRef.current;
      if (!host || mapRef.current) return;

      try {
        const maplibregl = await loadMapLibre();
        if (cancelled || !hostRef.current) return;
        maplibreRef.current = maplibregl;

        const paleStyle = await loadPaleIsometricStyle();
        if (cancelled || !hostRef.current) return;

        const center = INITIAL_MAP_CAMERA.center;
        const map = new maplibregl.Map({
          container: hostRef.current,
          style: paleStyle,
          center: [center.longitude, center.latitude],
          zoom: MAP_ZOOM,
          pitch: MAP_PITCH,
          bearing: -18,
          maxPitch: 75,
          minZoom: 13,
          maxZoom: 19,
          attributionControl: { compact: true },
        });

        map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');
        map.on('load', () => {
          ensure3dBuildings(map);
          map.easeTo({ pitch: MAP_PITCH, bearing: -18, duration: 600 });
          if (!cancelled) setMapReady(true);
        });

        mapRef.current = map;
      } catch (error) {
        console.error('[CatMap.web] MapLibre init failed', error);
      }
    })();

    return () => {
      cancelled = true;
      setMapReady(false);
      catMarkersRef.current.forEach((marker) => marker.remove());
      catMarkersRef.current = [];
      playerMarkerRef.current?.remove();
      playerMarkerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map || !focusCoordinate) return;
    map.easeTo({
      center: [focusCoordinate.longitude, focusCoordinate.latitude],
      zoom: Math.max(map.getZoom(), MAP_ZOOM),
      pitch: MAP_PITCH,
      duration: 450,
    });
  }, [focusCoordinate, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map || !userCoordinate) return;
    map.easeTo({
      center: [userCoordinate.longitude, userCoordinate.latitude],
      pitch: MAP_PITCH,
      duration: 280,
    });
  }, [userCoordinate, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    const maplibregl = maplibreRef.current;
    if (!mapReady || !map || !maplibregl) return;

    catMarkersRef.current.forEach((marker) => marker.remove());
    catMarkersRef.current = [];

    cats.forEach((cat) => {
      const nearby = nearbyCatIds?.includes(cat.id) ?? false;
      const captured = capturedCatIds?.includes(cat.id) ?? true;
      const el = makePinElement({
        label: cat.name,
        brand: colors.brand,
        brandSoft: colors.brandSoft,
        accent: colors.accent,
        size: nearby ? spacing[48] : CAT_PIN_AVATAR,
        coatColor: cat.analysis?.color ?? 'Roux',
        seed: cat.number,
        photoUri: captured ? cat.photoUri : undefined,
        dimmed: !captured,
        nearby,
      });
      el.addEventListener('click', (event) => {
        event.stopPropagation();
        onSelectRef.current(cat);
      });

      const marker = new maplibregl.Marker({
        element: el,
        anchor: 'bottom',
        pitchAlignment: 'viewport',
        rotationAlignment: 'viewport',
      })
        .setLngLat([cat.longitude, cat.latitude])
        .addTo(map);
      catMarkersRef.current.push(marker);
    });

    const syncScale = () => applyMarkerZoomScale(map, catMarkersRef.current);
    syncScale();
    map.on('zoom', syncScale);
    map.on('zoomend', syncScale);
    return () => {
      map.off('zoom', syncScale);
      map.off('zoomend', syncScale);
    };
  }, [cats, nearbyCatIds, capturedCatIds, colors, spacing, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    const maplibregl = maplibreRef.current;
    if (!mapReady || !map || !maplibregl) return;

    if (!userCoordinate) {
      playerMarkerRef.current?.remove();
      playerMarkerRef.current = null;
      return;
    }

    if (!playerMarkerRef.current) {
      const el = document.createElement('div');
      el.style.cssText = [
        `width:${spacing[24]}px`,
        `height:${spacing[24]}px`,
        'border-radius:999px',
        `background:${colors.mapPlayer}`,
        `border:3px solid ${colors.mapPlayerRing}`,
        'box-shadow:0 0 0 8px rgba(46,201,195,0.25)',
      ].join(';');
      playerMarkerRef.current = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([userCoordinate.longitude, userCoordinate.latitude])
        .addTo(map);
    } else {
      playerMarkerRef.current.setLngLat([
        userCoordinate.longitude,
        userCoordinate.latitude,
      ]);
    }
  }, [userCoordinate, colors, spacing, mapReady]);

  return (
    <View style={[styles.root, { backgroundColor: mapPalette.land }]}>
      {createElement('div', {
        ref: (node: HTMLDivElement | null) => {
          hostRef.current = node;
        },
        style: {
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        },
      })}
      {/* High-key veil matching the pale isometric reference */}
      <View pointerEvents="none" style={styles.veil} />
    </View>
  );
}

export function MiniMap({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const { colors, spacing } = useTheme();
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    let map: MapLibreMap | null = null;

    void (async () => {
      const host = hostRef.current;
      if (!host) return;
      try {
        const maplibregl = await loadMapLibre();
        if (cancelled || !hostRef.current) return;
        const paleStyle = await loadPaleIsometricStyle();
        if (cancelled || !hostRef.current) return;
        map = new maplibregl.Map({
          container: hostRef.current,
          style: paleStyle,
          center: [longitude, latitude],
          zoom: 15,
          pitch: 48,
          bearing: -12,
          interactive: false,
          attributionControl: false,
        });
        map.on('load', () => {
          if (map) ensure3dBuildings(map);
        });
        new maplibregl.Marker({ color: colors.brand })
          .setLngLat([longitude, latitude])
          .addTo(map);
      } catch (error) {
        console.error('[MiniMap.web] MapLibre init failed', error);
      }
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [latitude, longitude, colors.brand]);

  return (
    <View style={[styles.miniWrap, { height: 180 }]}>
      {createElement('div', {
        ref: (node: HTMLDivElement | null) => {
          hostRef.current = node;
        },
        style: {
          width: '100%',
          height: 150,
          borderRadius: spacing[8],
          overflow: 'hidden',
        },
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  veil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(244, 243, 248, 0.08)',
  },
  miniWrap: {
    overflow: 'hidden',
  },
});
