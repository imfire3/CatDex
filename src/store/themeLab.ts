import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'

import {
  DEFAULT_THEME_LAB,
  type ShapePreset,
  type ThemeLabOverrides,
} from '@/theme/themeOverrides'

const STORAGE_KEY = 'catdex-theme-lab'

type ThemeLabState = {
  overrides: ThemeLabOverrides
  hydrated: boolean
  hydrate: () => Promise<void>
  setBrandId: (brandId: string) => void
  setShape: (shape: ShapePreset) => void
  reset: () => void
}

const persist = (overrides: ThemeLabOverrides) => {
  void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
}

const normalize = (raw: Partial<ThemeLabOverrides>): ThemeLabOverrides => {
  const shape =
    raw.shape === 'squared' || raw.shape === 'rounded' || raw.shape === 'standard'
      ? raw.shape
      : DEFAULT_THEME_LAB.shape
  const brandId =
    typeof raw.brandId === 'string' && raw.brandId.trim()
      ? raw.brandId.trim()
      : DEFAULT_THEME_LAB.brandId
  return { brandId, shape }
}

export const useThemeLabStore = create<ThemeLabState>((set, get) => ({
  overrides: DEFAULT_THEME_LAB,
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      if (!raw) {
        set({ hydrated: true })
        return
      }
      const parsed = JSON.parse(raw) as Partial<ThemeLabOverrides>
      set({ overrides: normalize(parsed), hydrated: true })
    } catch {
      set({ hydrated: true })
    }
  },

  setBrandId: (brandId) => {
    const overrides = { ...get().overrides, brandId }
    set({ overrides })
    persist(overrides)
  },

  setShape: (shape) => {
    const overrides = { ...get().overrides, shape }
    set({ overrides })
    persist(overrides)
  },

  reset: () => {
    set({ overrides: DEFAULT_THEME_LAB })
    persist(DEFAULT_THEME_LAB)
  },
}))
