import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const DISMISS_KEY = 'catdex.pwa.install.dismissed';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let listening = false;

function getWindow(): (Window & typeof globalThis) | null {
  if (typeof window === 'undefined') return null;
  return window;
}

/** True when already launched from home-screen / installed PWA. */
export function isRunningAsInstalledPwa(): boolean {
  const win = getWindow();
  if (!win) return false;
  const nav = win.navigator as Navigator & { standalone?: boolean };
  if (nav.standalone === true) return true;
  return win.matchMedia?.('(display-mode: standalone)')?.matches === true;
}

export function isIosWeb(): boolean {
  if (Platform.OS !== 'web') return false;
  const win = getWindow();
  if (!win) return false;
  const ua = win.navigator.userAgent || '';
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const iPadOs = win.navigator.platform === 'MacIntel' && win.navigator.maxTouchPoints > 1;
  return iOS || iPadOs;
}

export function isAndroidWeb(): boolean {
  if (Platform.OS !== 'web') return false;
  const win = getWindow();
  if (!win) return false;
  return /Android/i.test(win.navigator.userAgent || '');
}

/** Capture Chrome/Android install event as early as possible (web only). */
export function armPwaInstallListener(): void {
  if (Platform.OS !== 'web' || listening) return;
  const win = getWindow();
  if (!win) return;
  listening = true;
  win.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
  });
  win.addEventListener('appinstalled', () => {
    deferredPrompt = null;
  });
}

export function canNativeInstallPrompt(): boolean {
  return Platform.OS === 'web' && deferredPrompt != null;
}

export async function promptNativePwaInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferredPrompt) return 'unavailable';
  const promptEvent = deferredPrompt;
  deferredPrompt = null;
  try {
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    return choice.outcome;
  } catch {
    return 'dismissed';
  }
}

export async function wasInstallPromptDismissed(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(DISMISS_KEY);
    return value === '1';
  } catch {
    return false;
  }
}

export async function markInstallPromptDismissed(): Promise<void> {
  try {
    await AsyncStorage.setItem(DISMISS_KEY, '1');
  } catch {
    // ignore
  }
}

export type HomeScreenOfferKind = 'android-prompt' | 'ios-guide' | 'none';

/**
 * Decide whether to offer “add to home screen” after registration.
 * Native apps already live on the home screen — skip.
 */
export async function getHomeScreenOfferKind(): Promise<HomeScreenOfferKind> {
  if (Platform.OS !== 'web') return 'none';
  if (isRunningAsInstalledPwa()) return 'none';
  if (await wasInstallPromptDismissed()) return 'none';
  if (isIosWeb()) return 'ios-guide';
  if (canNativeInstallPrompt() || isAndroidWeb()) return 'android-prompt';
  // Desktop Chrome may still expose beforeinstallprompt.
  if (canNativeInstallPrompt()) return 'android-prompt';
  return 'none';
}
