import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const STORAGE_KEY = 'catdex-settings-prefs';
const LEGACY_NOTIFICATIONS_KEY = 'catdex-notification-prefs';

export type ThemePreference = 'clair' | 'sombre' | 'automatique';

export type SettingsPrefs = {
  notifRareCats: boolean;
  notifMissions: boolean;
  notifBadges: boolean;
  notifDailyStreak: boolean;
  theme: ThemePreference;
  sounds: boolean;
  haptics: boolean;
  animations: boolean;
  /** Show already-captured cats on the map */
  mapShowDiscovered: boolean;
  mapShowRare: boolean;
  syncEnabled: boolean;
};

export const DEFAULT_SETTINGS_PREFS: SettingsPrefs = {
  notifRareCats: true,
  notifMissions: true,
  notifBadges: true,
  notifDailyStreak: true,
  theme: 'clair',
  sounds: true,
  haptics: true,
  animations: true,
  mapShowDiscovered: true,
  mapShowRare: true,
  syncEnabled: true,
};

type SettingsPrefsState = {
  prefs: SettingsPrefs;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setPref: <K extends keyof SettingsPrefs>(key: K, value: SettingsPrefs[K]) => void;
  setTheme: (theme: ThemePreference) => void;
};

function persist(prefs: SettingsPrefs) {
  void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

function normalizePrefs(
  parsed: Partial<SettingsPrefs> & Record<string, unknown>,
): SettingsPrefs {
  const base = { ...DEFAULT_SETTINGS_PREFS, ...parsed };

  // Migrate old inverted filter if present.
  if (
    typeof parsed.mapShowDiscovered !== 'boolean' &&
    typeof parsed.mapUndiscoveredOnly === 'boolean'
  ) {
    base.mapShowDiscovered = !parsed.mapUndiscoveredOnly;
  }

  // Migrate old theme keys stored before clair/sombre/automatique.
  const rawTheme = String(parsed.theme ?? '');
  if (rawTheme === 'système' || rawTheme === 'systeme' || rawTheme === 'system') {
    base.theme = 'automatique';
  }

  return {
    notifRareCats: Boolean(base.notifRareCats),
    notifMissions: Boolean(base.notifMissions),
    notifBadges: Boolean(base.notifBadges),
    notifDailyStreak: Boolean(base.notifDailyStreak),
    theme:
      base.theme === 'sombre' || base.theme === 'automatique' || base.theme === 'clair'
        ? base.theme
        : 'clair',
    sounds: Boolean(base.sounds),
    haptics: Boolean(base.haptics),
    animations: Boolean(base.animations),
    mapShowDiscovered: Boolean(base.mapShowDiscovered),
    mapShowRare: Boolean(base.mapShowRare),
    syncEnabled: Boolean(base.syncEnabled),
  };
}

export function formatTheme(theme: ThemePreference): string {
  if (theme === 'sombre') return 'Sombre';
  if (theme === 'automatique') return 'Automatique';
  return 'Clair';
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
        } catch {
          // ignore
        }
      }

      if (raw) {
        next = normalizePrefs(JSON.parse(raw) as Partial<SettingsPrefs> & Record<string, unknown>);
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

  setTheme: (theme) => {
    get().setPref('theme', theme);
  },
}));
