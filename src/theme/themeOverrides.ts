import type { ThemeColors } from './colors'
import { radius as defaultRadius } from './radius'

export type ShapePreset = 'squared' | 'standard' | 'rounded'

export type BrandPreset = {
  id: string
  label: string
  brand: string
  brandPressed: string
}

export type ThemeLabOverrides = {
  brandId: string
  shape: ShapePreset
}

export const DEFAULT_THEME_LAB: ThemeLabOverrides = {
  brandId: 'indigo',
  shape: 'standard',
}

/** Curated brand swatches — quick palette swaps without hex typing. */
export const BRAND_PRESETS: BrandPreset[] = [
  {
    id: 'indigo',
    label: 'Indigo',
    brand: '#6A69F8',
    brandPressed: '#5554E0',
  },
  {
    id: 'mint',
    label: 'Menthe',
    brand: '#12B76A',
    brandPressed: '#0E9F5A',
  },
  {
    id: 'ocean',
    label: 'Océan',
    brand: '#4285F4',
    brandPressed: '#3367D6',
  },
  {
    id: 'amber',
    label: 'Ambre',
    brand: '#F79009',
    brandPressed: '#DC6803',
  },
  {
    id: 'coral',
    label: 'Corail',
    brand: '#E5484D',
    brandPressed: '#C9373B',
  },
  {
    id: 'plum',
    label: 'Prune',
    brand: '#7C3AED',
    brandPressed: '#6D28D9',
  },
]

export const SHAPE_PRESETS: {
  id: ShapePreset
  label: string
  hint: string
}[] = [
  { id: 'squared', label: 'Carré', hint: 'Coins nets · 8' },
  { id: 'standard', label: 'Standard', hint: 'Surfaces 8 · CTA 16' },
  { id: 'rounded', label: 'Rond', hint: 'Surfaces 16 · CTA 24' },
]

const softAlpha = (hex: string, alpha: number) => {
  const normalized = hex.replace('#', '')
  if (normalized.length !== 6) return `rgba(106,105,248,${alpha})`
  const r = Number.parseInt(normalized.slice(0, 2), 16)
  const g = Number.parseInt(normalized.slice(2, 4), 16)
  const b = Number.parseInt(normalized.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export const resolveBrandPreset = (brandId: string): BrandPreset => {
  return BRAND_PRESETS.find((p) => p.id === brandId) ?? BRAND_PRESETS[0]!
}

/** Re-tint brand aliases while keeping neutrals / semantic colors intact. */
export const applyBrandToColors = (
  colors: ThemeColors,
  brandId: string,
): ThemeColors => {
  const preset = resolveBrandPreset(brandId)
  if (preset.id === 'indigo') return colors

  const { brand, brandPressed } = preset
  const brandSoft = softAlpha(brand, 0.12)
  const halo = softAlpha(brand, 0.28)

  return {
    ...colors,
    brand,
    brandPressed,
    brandSoft,
    captureFabHalo: halo,
    accent: brand,
    accentPressed: brandPressed,
    accentSoft: brandSoft,
    accentStrong: brandPressed,
    primary: brand,
    primarySoft: brandSoft,
    violet: brand,
    violetSoft: brandSoft,
    textBrand: brand,
    focusRing: brand,
    sky: brand,
    skySoft: brandSoft,
    info: brand,
    infoSoft: brandSoft,
    ctaSecondaryLabel: brand,
    overlay: softAlpha(brand, 0.4),
    shadowColor: brand,
    gradientStart: brand,
    gradientEnd: brandPressed,
  }
}

export type ThemeRadius = {
  8: number
  12: number
  16: number
  20: number
  24: number
  28: number
  32: number
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  sheet: number
  '2xl': number
  cta: number
  pill: number
  full: number
}

export const applyShapeToRadius = (shape: ShapePreset): ThemeRadius => {
  if (shape === 'squared') {
    return {
      8: 8,
      12: 8,
      16: 8,
      20: 8,
      24: 8,
      28: 8,
      32: 8,
      xs: 8,
      sm: 8,
      md: 8,
      lg: 8,
      xl: 8,
      sheet: 8,
      '2xl': 8,
      cta: 8,
      pill: 9999,
      full: 9999,
    }
  }

  if (shape === 'rounded') {
    return {
      8: 16,
      12: 16,
      16: 16,
      20: 16,
      24: 24,
      28: 24,
      32: 24,
      xs: 16,
      sm: 16,
      md: 16,
      lg: 16,
      xl: 24,
      sheet: 16,
      '2xl': 24,
      cta: 24,
      pill: 9999,
      full: 9999,
    }
  }

  return { ...defaultRadius }
}
