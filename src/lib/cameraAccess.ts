import { Camera } from 'expo-camera';
import { Linking, Platform } from 'react-native';

/**
 * Real camera permission helpers (native + web).
 * Prefer these over Platform.OS shortcuts so Authorize actually requests access.
 */
export async function getCameraAccessGranted(): Promise<boolean> {
  const { status } = await Camera.getCameraPermissionsAsync();
  return status === 'granted';
}

export async function requestCameraAccess(): Promise<boolean> {
  const { status } = await Camera.requestCameraPermissionsAsync();
  return status === 'granted';
}

export async function openSystemCameraSettings(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Linking.openSettings();
}
