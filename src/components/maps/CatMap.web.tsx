import maplibregl, { type Map as MapLibreMap, type Marker } from 'maplibre-gl';
import { createElement, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  INITIAL_MAP_CAMERA,
  MAP_PITCH,
  MAP_ZOOM,
} from '@/components/maps/mapCamera';
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

/** Free style with building footprints — extruded for 3D when pitched. */
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

const BUILDINGS_LAYER_ID = 'catdex-3d-buildings';

function ensureCss() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('maplibre-css')) return;
  const link = document.createElement('link');
  link.id = 'maplibre-css';
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css';
  document.head.appendChild(link);
}

function add3dBuildings(map: MapLibreMap) {
  if (map.getLayer(BUILDINGS_LAYER_ID)) return;

  const layers = map.getStyle()?.layers ?? [];
  const labelLayerId = layers.find(
    (layer) => layer.type === 'symbol' && (layer.layout as { 'text-field'?: unknown })?.['text-field'],
  )?.id;

  // Prefer a vector source that already has building data.
  const style = map.getStyle();
  const sourceId =
    Object.keys(style?.sources ?? {}).find((id) => {
      const source = style?.sources?.[id];
      return source && 'type' in source && source.type === 'vector';
    }) ?? 'openmaptiles';

  try {
    map.addLayer(
      {
        id: BUILDINGS_LAYER_ID,
        source: sourceId,
        'source-layer': 'building',
        type: 'fill-extrusion',
        minzoom: 14,
        filter: ['!=', ['get', 'hide_3d'], true],
        paint: {
          'fill-extrusion-color': '#E8EAF0',
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
          'fill-extrusion-opacity': 0.88,
        },
      },
      labelLayerId,
    );
  } catch {
    // Style may already include extrusions or lack a building layer — pitch alone still reads 3D.
  }
}

function makePinElement(opts: {
  label: string;
  color: string;
  border: string;
  size: number;
  dimmed?: boolean;
}): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.setAttribute('aria-label', opts.label);
  btn.style.cssText = [
    'border:0',
    'padding:0',
    'cursor:pointer',
    'background:transparent',
    `width:${opts.size}px`,
    `height:${opts.size}px`,
    'display:flex',
    'align-items:flex-end',
    'justify-content:center',
    opts.dimmed ? 'opacity:0.72' : 'opacity:1',
  ].join(';');

  const bubble = document.createElement('span');
  bubble.style.cssText = [
    `width:${opts.size - 8}px`,
    `height:${opts.size - 8}px`,
    'border-radius:999px',
    `background:${opts.color}`,
    `border:2px solid ${opts.border}`,
    'box-shadow:0 4px 12px rgba(17,20,90,0.18)',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'font:700 11px/1 system-ui,sans-serif',
    'color:#fff',
  ].join(';');
  bubble.textContent = '🐱';
  btn.appendChild(bubble);
  return btn;
}

/**
 * Web Explorer map — MapLibre with pitch + extruded buildings (native uses Apple/Google 3D).
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
  const mapRef = useRef<MapLibreMap | null>(null);
  const catMarkersRef = useRef<Marker[]>([]);
  const playerMarkerRef = useRef<Marker | null>(null);
  const onSelectRef = useRef(onSelectCat);
  onSelectRef.current = onSelectCat;

  // Init map once.
  useEffect(() => {
    ensureCss();
    const host = hostRef.current;
    if (!host || mapRef.current) return;

    const center = INITIAL_MAP_CAMERA.center;
    const map = new maplibregl.Map({
      container: host,
      style: MAP_STYLE,
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
      add3dBuildings(map);
      // Keep a clear 3D framing after style settles.
      map.easeTo({
        pitch: MAP_PITCH,
        bearing: -18,
        duration: 600,
      });
    });

    mapRef.current = map;

    return () => {
      catMarkersRef.current.forEach((marker) => marker.remove());
      catMarkersRef.current = [];
      playerMarkerRef.current?.remove();
      playerMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Camera focus (locate / go there).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusCoordinate) return;
    map.easeTo({
      center: [focusCoordinate.longitude, focusCoordinate.latitude],
      zoom: Math.max(map.getZoom(), MAP_ZOOM),
      pitch: MAP_PITCH,
      duration: 450,
    });
  }, [focusCoordinate]);

  // Soft follow player.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userCoordinate) return;
    map.easeTo({
      center: [userCoordinate.longitude, userCoordinate.latitude],
      pitch: MAP_PITCH,
      duration: 280,
    });
  }, [userCoordinate]);

  // Cat markers.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    catMarkersRef.current.forEach((marker) => marker.remove());
    catMarkersRef.current = [];

    cats.forEach((cat) => {
      const nearby = nearbyCatIds?.includes(cat.id) ?? false;
      const captured = capturedCatIds?.includes(cat.id) ?? true;
      const el = makePinElement({
        label: cat.name,
        color: nearby ? colors.accent : colors.brand,
        border: colors.surfaceElevated ?? colors.surface,
        size: nearby ? spacing[56] : spacing[48],
        dimmed: !captured,
      });
      el.addEventListener('click', (event) => {
        event.stopPropagation();
        onSelectRef.current(cat);
      });

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([cat.longitude, cat.latitude])
        .addTo(map);
      catMarkersRef.current.push(marker);
    });
  }, [cats, nearbyCatIds, capturedCatIds, colors, spacing]);

  // Player marker.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

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
        `background:${colors.mapPlayer ?? colors.accent}`,
        `border:3px solid ${colors.mapPlayerRing ?? '#fff'}`,
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
  }, [userCoordinate, colors, spacing]);

  return (
    <View style={[styles.root, { backgroundColor: colors.surfaceSecondary }]}>
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
    ensureCss();
    const host = hostRef.current;
    if (!host) return;

    const map = new maplibregl.Map({
      container: host,
      style: MAP_STYLE,
      center: [longitude, latitude],
      zoom: 15,
      pitch: 48,
      bearing: -12,
      interactive: false,
      attributionControl: false,
    });
    map.on('load', () => add3dBuildings(map));
    new maplibregl.Marker({ color: colors.brand })
      .setLngLat([longitude, latitude])
      .addTo(map);

    return () => map.remove();
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
  miniWrap: {
    overflow: 'hidden',
  },
});
