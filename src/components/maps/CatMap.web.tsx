import { createElement, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { loadPaleIsometricStyle } from '@/components/maps/applyPaleIsometricStyle';
import {
  INITIAL_MAP_CAMERA,
  MAP_CAMERA_DURATION,
  MAP_FLY_TO_PIN_DURATION,
  MAP_FOLLOW_THRESHOLD_M,
  MAP_PITCH,
  MAP_ZOOM,
} from '@/components/maps/mapCamera';
import {
  CAT_PIN_SELECTED,
  CAT_PIN_SILHOUETTE,
  CAT_PIN_TIP_H,
  pinScaleForZoom,
} from '@/components/maps/CatPinVisual';
import { canShowPinPhoto } from '@/components/maps/CatPinVisual';
import { mapPalette } from '@/components/maps/mapPalette';
import { getCatDiscoveryState } from '@/lib/catDiscovery';
import { distanceMeters } from '@/lib/constants';
import {
  headingDeltaDegrees,
  MAP_HEADING_THRESHOLD_DEG,
} from '@/lib/mapHeading';
import { resolveCatPhotoUri } from '@/lib/photoStorage';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

type Props = {
  cats: Cat[];
  scheme: 'light' | 'dark';
  onSelectCat: (cat: Cat) => void;
  focusCoordinate?: { latitude: number; longitude: number } | null;
  focusNonce?: number;
  userCoordinate?: { latitude: number; longitude: number } | null;
  /** Device compass heading in degrees (0 = north) — rotates the map while following. */
  userHeading?: number | null;
  nearbyCatIds?: string[];
  capturedCatIds?: string[];
  /** Currently selected cat — larger pin + pulse rings. */
  selectedCatId?: string | null;
  /** When false, GPS follow is paused so the camera can stay on a selected cat. */
  followUser?: boolean;
  /** @deprecated Option-1 mock has no name callout on pins. */
  pinCallouts?: Record<string, string>;
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
  getBearing: () => number;
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

/** Purple pin for MapLibre HTML markers (tip = ground anchor). Photo when available. */
function makePinElement(opts: {
  label: string;
  brand: string;
  brandSoft: string;
  onBrand: string;
  surface: string;
  size: number;
  selected?: boolean;
  photoUrl?: string | null;
  /** owned = solid ring + ✓ ; discoverable = dashed ring + ? */
  discoveryState?: 'owned' | 'discoverable';
  isNearby?: boolean;
}): HTMLButtonElement {
  const size = opts.size;
  const tipH = CAT_PIN_TIP_H;
  const tipW = 16;
  const selected = Boolean(opts.selected);
  const owned = (opts.discoveryState ?? 'owned') === 'owned';
  const pulseMax = selected ? size * 2.4 : 0;
  const wrapW = selected ? pulseMax : size + 20;
  const wrapH = selected ? pulseMax / 2 + size + tipH : size + tipH + 4;
  const badgeSize = 16;

  const btn = document.createElement('button');
  btn.type = 'button';
  const a11ySuffix = owned ? 'dans ton CatDex' : 'à découvrir';
  btn.setAttribute('aria-label', `${opts.label}, ${a11ySuffix}`);
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
  ].join(';');

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

  if (selected) {
    const layer = document.createElement('span');
    const bottom = tipH + size / 2 - pulseMax / 2;
    layer.style.cssText = [
      'position:absolute',
      'left:50%',
      `bottom:${bottom}px`,
      `width:${pulseMax}px`,
      `height:${pulseMax}px`,
      'margin-left:' + `${-(pulseMax / 2)}px`,
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'pointer-events:none',
    ].join(';');
    const rings = [
      { size: pulseMax, fill: opts.brandSoft, opacity: '0.55', border: '0' },
      { size: pulseMax * 0.72, fill: 'transparent', opacity: '0.28', border: `2px solid ${opts.brand}` },
      { size: pulseMax * 0.48, fill: 'transparent', opacity: '0.4', border: `2px solid ${opts.brand}` },
    ];
    for (const ring of rings) {
      const el = document.createElement('span');
      el.style.cssText = [
        'position:absolute',
        `width:${ring.size}px`,
        `height:${ring.size}px`,
        'border-radius:999px',
        `background:${ring.fill}`,
        `border:${ring.border}`,
        `opacity:${ring.opacity}`,
        'box-sizing:border-box',
      ].join(';');
      layer.appendChild(el);
    }
    scaleRoot.appendChild(layer);
  } else if (opts.isNearby && !owned) {
    const halo = document.createElement('span');
    const haloSize = size * 1.7;
    halo.style.cssText = [
      'position:absolute',
      'left:50%',
      `bottom:${tipH + size / 2 - haloSize / 2}px`,
      `width:${haloSize}px`,
      `height:${haloSize}px`,
      `margin-left:${-(haloSize / 2)}px`,
      'border-radius:999px',
      `background:${opts.brandSoft}`,
      'opacity:0.35',
      'pointer-events:none',
    ].join(';');
    scaleRoot.appendChild(halo);
  }

  const column = document.createElement('span');
  column.style.cssText = [
    'display:flex',
    'flex-direction:column',
    'align-items:center',
    'position:relative',
    'z-index:2',
  ].join(';');

  const ringWrap = document.createElement('span');
  ringWrap.style.cssText = [
    'position:relative',
    `width:${size + 6}px`,
    `height:${size + 6}px`,
    'display:flex',
    'align-items:center',
    'justify-content:center',
  ].join(';');

  const ringSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const ringOuter = size + 6;
  ringSvg.setAttribute('width', String(ringOuter));
  ringSvg.setAttribute('height', String(ringOuter));
  ringSvg.style.cssText = 'position:absolute;inset:0;pointer-events:none';
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', String(ringOuter / 2));
  circle.setAttribute('cy', String(ringOuter / 2));
  circle.setAttribute('r', String((size + (owned ? 2.5 : 2)) / 2));
  circle.setAttribute('fill', 'none');
  circle.setAttribute('stroke', opts.brand);
  circle.setAttribute('stroke-width', owned ? '2.5' : '1.75');
  circle.setAttribute('stroke-opacity', owned ? '1' : '0.72');
  if (!owned) circle.setAttribute('stroke-dasharray', '3.5 2.75');
  ringSvg.appendChild(circle);
  ringWrap.appendChild(ringSvg);

  const avatar = document.createElement('span');
  avatar.style.cssText = [
    `width:${size}px`,
    `height:${size}px`,
    'border-radius:999px',
    `background:${opts.brand}`,
    'overflow:hidden',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'box-sizing:border-box',
    `border:2px solid ${opts.surface}`,
    `opacity:${owned ? '1' : '0.92'}`,
    'position:relative',
  ].join(';');
  if (opts.photoUrl) {
    const img = document.createElement('img');
    img.src = opts.photoUrl;
    img.alt = opts.label;
    img.draggable = false;
    img.style.cssText = [
      'width:100%',
      'height:100%',
      'object-fit:cover',
      'display:block',
      'pointer-events:none',
      `opacity:${owned ? '1' : '0.78'}`,
    ].join(';');
    img.addEventListener('error', () => {
      img.remove();
      if (!avatar.querySelector('svg')) {
        avatar.appendChild(silhouetteSvg(Math.round(size * 0.55), opts.onBrand));
      }
    });
    avatar.appendChild(img);
    if (!owned) {
      const veil = document.createElement('span');
      veil.style.cssText = [
        'position:absolute',
        'inset:0',
        `background:${opts.surface}`,
        'opacity:0.22',
        'pointer-events:none',
      ].join(';');
      avatar.appendChild(veil);
    }
  } else {
    avatar.appendChild(silhouetteSvg(Math.round(size * 0.55), opts.onBrand));
  }

  const badge = document.createElement('span');
  badge.setAttribute('aria-hidden', 'true');
  badge.textContent = owned ? '✓' : '?';
  badge.style.cssText = [
    'position:absolute',
    'top:-2px',
    'right:-2px',
    `width:${badgeSize}px`,
    `height:${badgeSize}px`,
    'border-radius:999px',
    `background:${owned ? opts.brand : opts.surface}`,
    `border:1.5px solid ${opts.brand}`,
    `color:${owned ? opts.onBrand : opts.brand}`,
    'font-size:10px',
    'font-weight:700',
    'line-height:12px',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'z-index:4',
    'box-sizing:border-box',
  ].join(';');

  ringWrap.appendChild(avatar);
  ringWrap.appendChild(badge);

  const tip = document.createElement('span');
  tip.style.cssText = [
    'width:0',
    'height:0',
    'margin-top:-4px',
    `border-left:${tipW / 2}px solid transparent`,
    `border-right:${tipW / 2}px solid transparent`,
    `border-top:${tipH}px solid ${opts.brand}`,
    `opacity:${owned ? '1' : '0.75'}`,
  ].join(';');

  column.appendChild(ringWrap);
  column.appendChild(tip);
  scaleRoot.appendChild(column);
  btn.appendChild(scaleRoot);
  return btn;
}

function silhouetteSvg(size: number, color: string): SVGSVGElement {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.style.cssText = 'display:block;pointer-events:none';
  svg.innerHTML = [
    `<path d="M7.2 10.2 5.5 6.2l3 1.7M16.8 10.2 18.5 6.2l-3 1.7" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" />`,
    `<path d="M6.4 11c0 3.6 2.4 6.2 5.6 6.2s5.6-2.6 5.6-6.2c0-2.2-1.7-4-5.6-4s-5.6 1.8-5.6 4Z" fill="${color}" />`,
    `<circle cx="10.2" cy="12" r="0.9" fill="#FFFFFF" />`,
    `<circle cx="13.8" cy="12" r="0.9" fill="#FFFFFF" />`,
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
  focusNonce,
  userCoordinate,
  userHeading = null,
  nearbyCatIds,
  capturedCatIds,
  selectedCatId,
  followUser = true,
}: Props) {
  const { colors, spacing } = useTheme();
  const hostRef = useRef<HTMLDivElement | null>(null);
  const maplibreRef = useRef<MapLibreNS | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const catMarkersRef = useRef<MapLibreMarker[]>([]);
  const playerMarkerRef = useRef<MapLibreMarker | null>(null);
  const onSelectRef = useRef(onSelectCat);
  const [mapReady, setMapReady] = useState(false);
  const followingRef = useRef(true);
  const lastFollowRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const didCenterOnUserRef = useRef(false);
  const headingRef = useRef(userHeading);
  headingRef.current = userHeading;
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

        map.on('load', () => {
          // Host may finish Flex layout after Map construct — force a redraw.
          const maybeResize = map as MapLibreMap & { resize?: () => void };
          maybeResize.resize?.();
          ensure3dBuildings(map);
          map.easeTo({ pitch: MAP_PITCH, bearing: -18, duration: 600 });
          if (!cancelled) setMapReady(true);
        });

        // User pans → stop auto-centering until recenter / focus.
        map.on('dragstart', () => {
          followingRef.current = false;
        });

        mapRef.current = map;

        if (typeof ResizeObserver !== 'undefined' && hostRef.current) {
          const ro = new ResizeObserver(() => {
            const maybeResize = mapRef.current as (MapLibreMap & { resize?: () => void }) | null;
            maybeResize?.resize?.();
          });
          ro.observe(hostRef.current);
          (map as MapLibreMap & { __catdexRo?: ResizeObserver }).__catdexRo = ro;
        }
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
      const map = mapRef.current as (MapLibreMap & { __catdexRo?: ResizeObserver }) | null;
      map?.__catdexRo?.disconnect();
      map?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    followingRef.current = followUser;
  }, [followUser]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map || !focusCoordinate) return;
    followingRef.current = followUser;
    lastFollowRef.current = focusCoordinate;
    didCenterOnUserRef.current = true;
    const maybeStop = map as MapLibreMap & { stop?: () => void };
    maybeStop.stop?.();
    map.easeTo({
      center: [focusCoordinate.longitude, focusCoordinate.latitude],
      zoom: Math.max(map.getZoom(), MAP_ZOOM),
      pitch: MAP_PITCH,
      bearing: followUser ? (headingRef.current ?? map.getBearing()) : map.getBearing(),
      duration: followUser ? MAP_CAMERA_DURATION : MAP_FLY_TO_PIN_DURATION,
      essential: true,
    });
  }, [focusCoordinate, focusNonce, followUser, mapReady]);

  // Soft follow — keep GPS point centered while following (Pokémon-style).
  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map || !userCoordinate || !followingRef.current) return;

    const prev = lastFollowRef.current;
    if (!prev || !didCenterOnUserRef.current) {
      lastFollowRef.current = userCoordinate;
      didCenterOnUserRef.current = true;
      map.easeTo({
        center: [userCoordinate.longitude, userCoordinate.latitude],
        zoom: Math.max(map.getZoom(), MAP_ZOOM),
        pitch: MAP_PITCH,
        bearing: headingRef.current ?? map.getBearing(),
        duration: MAP_CAMERA_DURATION,
      });
      return;
    }

    const moved = distanceMeters(
      prev.latitude,
      prev.longitude,
      userCoordinate.latitude,
      userCoordinate.longitude,
    );
    if (moved < MAP_FOLLOW_THRESHOLD_M) return;

    lastFollowRef.current = userCoordinate;
    map.easeTo({
      center: [userCoordinate.longitude, userCoordinate.latitude],
      bearing: headingRef.current ?? map.getBearing(),
      duration: MAP_CAMERA_DURATION,
    });
  }, [userCoordinate, mapReady]);

  // Standing still + turning: rotate map bearing to match compass.
  useEffect(() => {
    const map = mapRef.current;
    if (
      !mapReady ||
      !map ||
      userHeading == null ||
      !userCoordinate ||
      !followingRef.current ||
      !didCenterOnUserRef.current
    ) {
      return;
    }

    if (headingDeltaDegrees(map.getBearing(), userHeading) < MAP_HEADING_THRESHOLD_DEG) {
      return;
    }

    map.easeTo({
      center: [userCoordinate.longitude, userCoordinate.latitude],
      bearing: userHeading,
      duration: Math.min(MAP_CAMERA_DURATION, 160),
      essential: true,
    });
  }, [userHeading, userCoordinate, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    const maplibregl = maplibreRef.current;
    if (!mapReady || !map || !maplibregl) return;

    let cancelled = false;

    catMarkersRef.current.forEach((marker) => marker.remove());
    catMarkersRef.current = [];

    const blobUrls: string[] = [];

    const buildMarkers = async () => {
      const nextMarkers: MapLibreMarker[] = [];
      const ownedIds = new Set(capturedCatIds ?? []);

      for (const cat of cats) {
        if (cancelled) break;

        const selected = selectedCatId === cat.id;
        const discoveryState = capturedCatIds
          ? getCatDiscoveryState(cat, ownedIds)
          : 'owned';
        const isNearby = nearbyCatIds?.includes(cat.id) ?? false;
        let photoUrl: string | null = null;
        if (canShowPinPhoto(cat.photoUri)) {
          try {
            photoUrl = await resolveCatPhotoUri(cat.photoUri);
            if (photoUrl?.startsWith('blob:')) blobUrls.push(photoUrl);
          } catch {
            photoUrl = null;
          }
        }

        const el = makePinElement({
          label: cat.name,
          brand: colors.brand,
          brandSoft: colors.brandSoft,
          onBrand: colors.onBrand,
          surface: colors.surface,
          size: selected ? CAT_PIN_SELECTED : CAT_PIN_SILHOUETTE,
          selected,
          photoUrl,
          discoveryState,
          isNearby,
        });
        const openSheet = (event: Event) => {
          event.preventDefault();
          event.stopPropagation();
          onSelectRef.current(cat);
        };
        el.addEventListener('pointerdown', (event) => event.stopPropagation());
        el.addEventListener('mousedown', (event) => event.stopPropagation());
        el.addEventListener('touchstart', (event) => event.stopPropagation(), {
          passive: true,
        });
        el.addEventListener('click', openSheet);

        const marker = new maplibregl.Marker({
          element: el,
          anchor: 'bottom',
          pitchAlignment: 'viewport',
          rotationAlignment: 'viewport',
        })
          .setLngLat([cat.longitude, cat.latitude])
          .addTo(map);
        const suffix =
          discoveryState === 'owned' ? 'dans ton CatDex' : 'à découvrir';
        el.setAttribute('aria-label', `${cat.name}, ${suffix}`);
        nextMarkers.push(marker);
      }

      if (cancelled) {
        nextMarkers.forEach((marker) => marker.remove());
        return;
      }

      catMarkersRef.current = nextMarkers;
      applyMarkerZoomScale(map, catMarkersRef.current);
    };

    void buildMarkers();

    const syncScale = () => applyMarkerZoomScale(map, catMarkersRef.current);
    map.on('zoom', syncScale);
    map.on('zoomend', syncScale);
    return () => {
      cancelled = true;
      map.off('zoom', syncScale);
      map.off('zoomend', syncScale);
      catMarkersRef.current.forEach((marker) => marker.remove());
      catMarkersRef.current = [];
      blobUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [cats, selectedCatId, colors, spacing, mapReady, capturedCatIds, nearbyCatIds]);

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
