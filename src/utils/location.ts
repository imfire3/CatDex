import * as Location from 'expo-location';
import { approximateCoordinates } from '@/lib/constants';

export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

export async function getCurrentLocation(): Promise<LocationCoords> {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) {
    throw new Error('Location permission denied');
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    accuracy: location.coords.accuracy,
  };
}

export async function getApproximateLocation(): Promise<LocationCoords> {
  const coords = await getCurrentLocation();
  const approx = approximateCoordinates(coords.latitude, coords.longitude);
  return {
    latitude: approx.lat,
    longitude: approx.lng,
    accuracy: coords.accuracy,
  };
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    if (results.length === 0) return null;
    const place = results[0];
    const parts = [place.name, place.city, place.region].filter(Boolean);
    return parts.join(', ') || null;
  } catch {
    return null;
  }
}

export async function watchLocation(
  callback: (coords: LocationCoords) => void
): Promise<Location.LocationSubscription> {
  return Location.watchPositionAsync(
    { accuracy: Location.Accuracy.Balanced, distanceInterval: 50 },
    (location) => {
      callback({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      });
    }
  );
}
