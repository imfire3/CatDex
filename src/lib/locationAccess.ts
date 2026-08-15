import * as Location from 'expo-location';
import { Linking, Platform } from 'react-native';

import { classifyGeolocationErrorCode } from './locationAccessResult';

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

/** Result of asking the browser / OS for location (Safari-safe). */
export type LocationRequestResult = {
  /** User allowed location (or we already had access). */
  granted: boolean;
  /** User explicitly blocked location in the system prompt. */
  denied: boolean;
  coordinate: LocationCoordinate | null;
};

type WebGeoOutcome =
  | { kind: 'ok'; coordinate: LocationCoordinate }
  | { kind: 'denied' }
  | { kind: 'unavailable' };

/** Cursor / localhost preview — geolocation prompts often hang with no callback. */
export function isLocalWebPreview(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.endsWith('.local') ||
    Boolean(typeof __DEV__ !== 'undefined' && __DEV__)
  );
}

function readWebPosition(
  options: PositionOptions,
): Promise<WebGeoOutcome> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.resolve({ kind: 'unavailable' });
  }

  const hardMs = Math.max(1_500, Number(options.timeout) || 5_000) + 500;

  return new Promise((resolve) => {
    let settled = false;
    const finish = (outcome: WebGeoOutcome) => {
      if (settled) return;
      settled = true;
      resolve(outcome);
    };

    const timer = setTimeout(() => {
      // Some embedded browsers never call success/error — never hang the UI.
      finish({ kind: 'unavailable' });
    }, hardMs);

    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timer);
          finish({
            kind: 'ok',
            coordinate: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          });
        },
        (error) => {
          clearTimeout(timer);
          finish({ kind: classifyGeolocationErrorCode(error?.code) });
        },
        options,
      );
    } catch {
      clearTimeout(timer);
      finish({ kind: 'unavailable' });
    }
  });
}

/**
 * Safari often grants the OS prompt then fails the first high-accuracy fix.
 * Retry with a cached / low-accuracy read before treating access as failed.
 */
async function requestWebGeolocation(): Promise<LocationRequestResult> {
  // Cursor / local preview: don't wait on a broken geolocation bridge.
  if (isLocalWebPreview()) {
    const quick = await readWebPosition({
      enableHighAccuracy: false,
      timeout: 1_800,
      maximumAge: 60_000,
    });
    if (quick.kind === 'ok') {
      return { granted: true, denied: false, coordinate: quick.coordinate };
    }
    if (quick.kind === 'denied') {
      return { granted: false, denied: true, coordinate: null };
    }
    // Soft-pass so onboarding isn't stuck in the IDE browser.
    return { granted: true, denied: false, coordinate: null };
  }

  const attempts: PositionOptions[] = [
    { enableHighAccuracy: false, timeout: 5_000, maximumAge: 60_000 },
    { enableHighAccuracy: true, timeout: 6_000, maximumAge: 5_000 },
  ];

  let sawUnavailable = false;
  for (const options of attempts) {
    const outcome = await readWebPosition(options);
    if (outcome.kind === 'ok') {
      return { granted: true, denied: false, coordinate: outcome.coordinate };
    }
    if (outcome.kind === 'denied') {
      return { granted: false, denied: true, coordinate: null };
    }
    sawUnavailable = true;
  }

  // No coordinate yet, but the system prompt was accepted (or permission already on).
  // Start watching anyway — do not keep the in-app modal stuck.
  if (sawUnavailable) {
    return { granted: true, denied: false, coordinate: null };
  }

  return { granted: false, denied: false, coordinate: null };
}

function getWebPosition(timeout = 10_000): Promise<LocationCoordinate | null> {
  return readWebPosition({
    enableHighAccuracy: timeout > 4_000,
    timeout,
    maximumAge: 30_000,
  }).then((outcome) => (outcome.kind === 'ok' ? outcome.coordinate : null));
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

/**
 * Ask for location. Prefer `requestLocationAccessResult` when you need deny vs grant.
 * Boolean form stays true only when access is usable (granted).
 */
export async function requestLocationAccess(): Promise<boolean> {
  const result = await requestLocationAccessResult();
  return result.granted;
}

export async function requestLocationAccessResult(): Promise<LocationRequestResult> {
  if (Platform.OS === 'web') {
    return requestWebGeolocation();
  }

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status === Location.PermissionStatus.DENIED) {
    return { granted: false, denied: true, coordinate: null };
  }
  if (status !== Location.PermissionStatus.GRANTED) {
    return { granted: false, denied: false, coordinate: null };
  }

  try {
    const enabled = await Location.hasServicesEnabledAsync();
    if (!enabled) {
      return { granted: false, denied: false, coordinate: null };
    }
  } catch {
    // treat as enabled
  }

  try {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      granted: true,
      denied: false,
      coordinate: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
    };
  } catch {
    return { granted: true, denied: false, coordinate: null };
  }
}

/**
 * Fast GPS warm-up right after signup (short timeout to avoid long hangs / errors).
 * Safe to call from a user-gesture handler (required on iOS Safari).
 */
export async function requestQuickLocationFix(
  timeoutMs = 2_500,
): Promise<LocationCoordinate | null> {
  if (Platform.OS === 'web') {
    return getWebPosition(timeoutMs);
  }

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== Location.PermissionStatus.GRANTED) return null;

  try {
    const position = await Promise.race([
      Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }),
      new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), timeoutMs);
      }),
    ]);
    if (!position) return null;
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch {
    return null;
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
