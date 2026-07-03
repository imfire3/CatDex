import * as Crypto from "expo-crypto";
import type { Zone } from "@/types/database";

const EARTH_RADIUS_M = 6371000;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function distanceInMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findNearestZone(
  zones: Zone[],
  latitude: number,
  longitude: number
): Zone | null {
  if (zones.length === 0) return null;

  let nearest = zones[0];
  let nearestDistance = distanceInMeters(
    latitude,
    longitude,
    nearest.center_lat,
    nearest.center_lng
  );

  for (const zone of zones.slice(1)) {
    const distance = distanceInMeters(
      latitude,
      longitude,
      zone.center_lat,
      zone.center_lng
    );
    if (distance < nearestDistance) {
      nearest = zone;
      nearestDistance = distance;
    }
  }

  return nearestDistance <= nearest.radius_meters * 1.5 ? nearest : nearest;
}

export function jitterCoordinates(
  zone: Zone,
  seed: string
): { lat: number; lng: number } {
  const hash = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const angle = (hash % 360) * (Math.PI / 180);
  const distance = ((hash % 100) / 100) * (zone.radius_meters * 0.35);
  const latOffset = (distance * Math.cos(angle)) / 111320;
  const lngOffset =
    (distance * Math.sin(angle)) /
    (111320 * Math.cos(toRadians(zone.center_lat)));

  return {
    lat: zone.center_lat + latOffset,
    lng: zone.center_lng + lngOffset,
  };
}

/** Décale légèrement le point de capture pour la vie privée (~80–120 m). */
export function jitterAroundCapture(
  latitude: number,
  longitude: number,
  seed: string,
  maxMeters = 100
): { lat: number; lng: number } {
  const hash = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const angle = (hash % 360) * (Math.PI / 180);
  const distance = 40 + (hash % 60);
  const clamped = Math.min(distance, maxMeters);
  const latOffset = (clamped * Math.cos(angle)) / 111320;
  const lngOffset =
    (clamped * Math.sin(angle)) / (111320 * Math.cos(toRadians(latitude)));

  return {
    lat: latitude + latOffset,
    lng: longitude + lngOffset,
  };
}

export async function buildDedupKey(
  zoneId: string,
  color: string,
  breed: string,
  pattern: string
) {
  const payload = `${zoneId}:${color.toLowerCase()}:${breed.toLowerCase()}:${pattern.toLowerCase()}`;
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    payload
  );
}

export function formatZoneLabel(zone: Zone) {
  return `${zone.name}, ${zone.city}`;
}
