import * as Location from 'expo-location';

import { PARIS_20E } from '@/lib/constants';

/** Request location or fall back to Paris 20e center (MVP geofence). */
export async function getCaptureLocation(): Promise<{
  latitude: number;
  longitude: number;
}> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const position = await Location.getCurrentPositionAsync({});
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    }
  } catch {
    // fallback below
  }
  return { ...PARIS_20E.center };
}
