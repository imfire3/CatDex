import Constants from 'expo-constants';
import { Platform } from 'react-native';

/** Approximate bounding box for Paris 20e (MVP geofence). */
export const PARIS_20E = {
  center: {
    latitude: 48.8635,
    longitude: 2.3985,
  },
  delta: {
    latitudeDelta: 0.035,
    longitudeDelta: 0.035,
  },
  bounds: {
    minLat: 48.848,
    maxLat: 48.875,
    minLng: 2.376,
    maxLng: 2.412,
  },
} as const;

export const SLOGAN = 'Explore ton quartier, capture les chats et construis ton CatDex.';

/** Product-defined CatDex completion target (ghost slots + progress). */
export const CATDEX_TARGET = 50;

const API_PORT = 8787;

/** LAN IP of the machine running Metro (Expo Go / device). */
function metroHostIp(): string | null {
  const candidates = [
    Constants.expoConfig?.hostUri,
    Constants.expoGoConfig?.debuggerHost,
    // Legacy manifest shapes
    (Constants as { manifest?: { debuggerHost?: string } }).manifest?.debuggerHost,
  ].filter(Boolean) as string[];

  for (const raw of candidates) {
    const host = raw
      .replace(/^[a-z]+:\/\//i, '')
      .split('/')[0]
      ?.split(':')[0]
      ?.trim();
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return host;
    }
  }
  return null;
}

/**
 * API base URL.
 * On native, prefer the Metro host IP so a physical phone can reach the Mac API
 * (localhost in .env only works on the same machine / web).
 */
export function resolveApiUrl(): string {
  if (Platform.OS !== 'web') {
    const ip = metroHostIp();
    if (ip) return `http://${ip}:${API_PORT}`;
  }
  return process.env.EXPO_PUBLIC_API_URL?.trim() || `http://localhost:${API_PORT}`;
}

export const API_URL = resolveApiUrl();

/** Soft gate: warn outside 20e but still allow capture in development. */
export function isInParis20e(latitude: number, longitude: number): boolean {
  const { bounds } = PARIS_20E;
  return (
    latitude >= bounds.minLat &&
    latitude <= bounds.maxLat &&
    longitude >= bounds.minLng &&
    longitude <= bounds.maxLng
  );
}

export function formatDexNumber(number: number): string {
  return `#${String(number).padStart(3, '0')}`;
}

export function formatCatDefaultName(number: number): string {
  return `Chat ${formatDexNumber(number)}`;
}

export function formatCaptureTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Haversine distance in meters between two WGS84 points. */
export function distanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earth = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * earth * Math.asin(Math.sqrt(a));
}

export function formatDistanceMeters(meters: number): string {
  if (meters < 1000) return `${Math.max(1, Math.round(meters))} m`;
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}
