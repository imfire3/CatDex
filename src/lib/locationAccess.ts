import * as Location from 'expo-location';
import { Linking, Platform } from 'react-native';

export type LocationAccessState = {
  /** OS permission for foreground location. */
  permission: Location.PermissionStatus;
  /** Device location services / GPS switch (native); true on web when permission allows. */
  servicesEnabled: boolean;
  /** Ready to use for map centering. */
  active: boolean;
};

export type LocationCoordinate = {
  latitude: number;
  longitude: number;
};

function getWebPosition(timeout = 10_000): Promise<LocationCoordinate | null> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => resolve(null),
      { enableHighAccuracy: true, timeout, maximumAge: 10_000 },
    );
  });
}

/**
 * Real location status for native + web (no Platform.OS === 'web' shortcut).
 */
export async function getLocationAccessState(): Promise<LocationAccessState> {
  if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
    try {
      const permission = await navigator.permissions?.query({ name: 'geolocation' });
      if (permission) {
        if (permission.state === 'granted') {
          return {
            permission: Location.PermissionStatus.GRANTED,
            servicesEnabled: true,
            active: true,
          };
        }
        if (permission.state === 'denied') {
          return {
            permission: Location.PermissionStatus.DENIED,
            servicesEnabled: false,
            active: false,
          };
        }
        // Safari iOS often reports "prompt" after the user already allowed GPS
        // in this tab. Don't treat that as denied — parent hides the banner
        // once a live coordinate exists.
        return {
          permission: Location.PermissionStatus.UNDETERMINED,
          servicesEnabled: true,
          active: false,
        };
      }
    } catch {
      // Safari may not expose the Permissions API; fall through to Expo.
    }
  }

  const { status } = await Location.getForegroundPermissionsAsync();
  let servicesEnabled = true;
  try {
    servicesEnabled = await Location.hasServicesEnabledAsync();
  } catch {
    // Some web environments may not expose this; treat as enabled if permission says so.
    servicesEnabled = status === Location.PermissionStatus.GRANTED;
  }

  // On web, "services" often mirrors permission; still require granted.
  const active =
    status === Location.PermissionStatus.GRANTED && servicesEnabled;

  return { permission: status, servicesEnabled, active };
}

export async function isLocationActive(): Promise<boolean> {
  const state = await getLocationAccessState();
  return state.active;
}

export async function requestLocationAccess(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Boolean(await getWebPosition());
  }

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== Location.PermissionStatus.GRANTED) return false;
  try {
    const enabled = await Location.hasServicesEnabledAsync();
    return enabled;
  } catch {
    return true;
  }
}

export async function getCurrentLocationCoordinate(): Promise<LocationCoordinate | null> {
  if (Platform.OS === 'web') {
    return getWebPosition();
  }

  try {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch {
    return null;
  }
}

export async function openSystemLocationSettings(): Promise<void> {
  if (Platform.OS === 'web') {
    // Browsers have no deep-link to site location settings; no-op.
    return;
  }
  await Linking.openSettings();
}

/**
 * iOS Safari requires a user gesture to unlock DeviceOrientation (compass).
 * Call from authorize / recenter taps — no-op on native and unsupported browsers.
 */
export async function requestWebCompassPermission(): Promise<boolean> {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return true;

  type OrientationCtor = {
    requestPermission?: () => Promise<'granted' | 'denied'>;
  };

  const OrientationEvent = (
    window as Window & { DeviceOrientationEvent?: OrientationCtor }
  ).DeviceOrientationEvent;

  if (typeof OrientationEvent?.requestPermission !== 'function') {
    return true;
  }

  try {
    const permission = await OrientationEvent.requestPermission();
    return permission === 'granted';
  } catch {
    return false;
  }
}
