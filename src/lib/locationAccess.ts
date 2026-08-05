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

/**
 * Real location status for native + web (no Platform.OS === 'web' shortcut).
 */
export async function getLocationAccessState(): Promise<LocationAccessState> {
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
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== Location.PermissionStatus.GRANTED) return false;
  try {
    const enabled = await Location.hasServicesEnabledAsync();
    return enabled;
  } catch {
    return true;
  }
}

export async function openSystemLocationSettings(): Promise<void> {
  if (Platform.OS === 'web') {
    // Browsers have no deep-link to site location settings; no-op.
    return;
  }
  await Linking.openSettings();
}
