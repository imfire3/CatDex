import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { useSettingsPrefsStore } from '@/store/settingsPrefs';

/** Soft success / impact helpers gated by settings prefs. */
export async function playHapticSuccess(): Promise<void> {
  if (Platform.OS === 'web') return;
  if (!useSettingsPrefsStore.getState().prefs.haptics) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // ignore
  }
}

export async function playHapticImpact(
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium,
): Promise<void> {
  if (Platform.OS === 'web') return;
  if (!useSettingsPrefsStore.getState().prefs.haptics) return;
  try {
    await Haptics.impactAsync(style);
  } catch {
    // ignore
  }
}

export async function playHapticLight(): Promise<void> {
  return playHapticImpact(Haptics.ImpactFeedbackStyle.Light);
}

/**
 * Sound hooks — prefs-gated. Bundled wav assets can plug in later via expo-av.
 */
export async function playRewardPopSound(): Promise<void> {
  if (!useSettingsPrefsStore.getState().prefs.sounds) return;
}

export async function playRevealSound(): Promise<void> {
  return playRewardPopSound();
}
