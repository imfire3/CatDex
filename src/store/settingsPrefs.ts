import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const STORAGE_KEY = 'catdex-settings-prefs';

/** Legacy notification keys from /settings/notifications */
const LEGACY_NOTIFICATIONS_KEY = 'catdex-notification-prefs';

export type SearchDistance = 200 | 500 | 1000 | 2000;
export type ImageQuality = 'économie' | 'standard' | 'haute';
export type ThemePreference = 'clair' | 'système';

export type SettingsPrefs = {
  // Notifications
  notifRareCats: boolean;
  notifMissions: boolean;
  notifBadges: boolean;
  notifDailyStreak: boolean;
  notifMarketing: boolean;
  // Preferences
  theme: ThemePreference;
  sounds: boolean;
  haptics: boolean;
  animations: boolean;
  imageQuality: ImageQuality;
  // Map
  searchDistance: SearchDistance;
  mapUndiscoveredOnly: boolean;
  mapShowRare: boolean;
  // Privacy display (system deep-links for real perms)
  // Storage
  syncEnabled: boolean;
};

export const DEFAULT_SETTINGS_PREFS: SettingsPrefs = {
  notifRareCats: true,
  notifMissions: true,
  notifBadges: true,
  notifDailyStreak: true,
  notifMarketing: false,
  theme: 'clair',
  sounds: true,
  haptics: true,
  animations: true,
  imageQuality: 'standard',
  searchDistance: 500,
  mapUndiscoveredOnly: false,
  mapShowRare: true,
  syncEnabled: true,
};

type SettingsPrefsState = {
  prefs: SettingsPrefs;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setPref: <K extends keyof SettingsPrefs>(key: K, value: SettingsPrefs[K]) => void;
  resetMapFilters: () => void;
  cycleSearchDistance: () => void;
  cycleImageQuality: () => void;
  cycleTheme: () => void;
};

const DISTANCES: SearchDistance[] = [200, 500, 1000, 2000];
const QUALITIES: ImageQuality[] = ['économie', 'standard', 'haute'];
const THEMES: ThemePreference[] = ['clair', 'système'];

function persist(prefs: SettingsPrefs) {
  void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function formatSearchDistance(meters: SearchDistance): string {
  return meters >= 1000 ? `${meters / 1000} km` : `${meters} m`;
}

export function formatImageQuality(quality: ImageQuality): string {
  if (quality === 'économie') return 'Économie';
  if (quality === 'haute') return 'Haute';
  return 'Standard';
}

export function formatTheme(theme: ThemePreference): string {
  return theme === 'système' ? 'Système' : 'Clair';
}

export const useSettingsPrefsStore = create<SettingsPrefsState>((set, get) => ({
  prefs: DEFAULT_SETTINGS_PREFS,
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const [raw, legacyRaw] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(LEGACY_NOTIFICATIONS_KEY),
      ]);

      let next = { ...DEFAULT_SETTINGS_PREFS };

      if (legacyRaw) {
        try {
          const legacy = JSON.parse(legacyRaw) as {
            nearbyCats?: boolean;
            missions?: boolean;
            weeklyDigest?: boolean;
          };
          if (typeof legacy.nearbyCats === 'boolean') {
            next = { ...next, notifRareCats: legacy.nearbyCats };
          }
          if (typeof legacy.missions === 'boolean') {
            next = {
              ...next,
              notifMissions: legacy.missions,
              notifDailyStreak: legacy.missions,
            };
          }
          if (typeof legacy.weeklyDigest === 'boolean') {
            next = { ...next, notifMarketing: legacy.weeklyDigest };
          }
        } catch {
          // ignore legacy parse
        }
      }

      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SettingsPrefs>;
        next = { ...next, ...parsed };
      }

      set({ prefs: next, hydrated: true });
      persist(next);
    } catch {
      set({ hydrated: true });
    }
  },

  setPref: (key, value) => {
    const prefs = { ...get().prefs, [key]: value };
    set({ prefs });
    persist(prefs);
  },

  resetMapFilters: () => {
    const prefs = {
      ...get().prefs,
      searchDistance: DEFAULT_SETTINGS_PREFS.searchDistance,
      mapUndiscoveredOnly: DEFAULT_SETTINGS_PREFS.mapUndiscoveredOnly,
      mapShowRare: DEFAULT_SETTINGS_PREFS.mapShowRare,
    };
    set({ prefs });
    persist(prefs);
  },

  cycleSearchDistance: () => {
    const current = get().prefs.searchDistance;
    const index = DISTANCES.indexOf(current);
    const next = DISTANCES[(index + 1) % DISTANCES.length] ?? 500;
    get().setPref('searchDistance', next);
  },

  cycleImageQuality: () => {
    const current = get().prefs.imageQuality;
    const index = QUALITIES.indexOf(current);
    const next = QUALITIES[(index + 1) % QUALITIES.length] ?? 'standard';
    get().setPref('imageQuality', next);
  },

  cycleTheme: () => {
    const current = get().prefs.theme;
    const index = THEMES.indexOf(current);
    const next = THEMES[(index + 1) % THEMES.length] ?? 'clair';
    get().setPref('theme', next);
  },
}));
