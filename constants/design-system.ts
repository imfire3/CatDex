/**
 * CatDex Design System — source unique de vérité pour tokens UI.
 * Inspiré iOS Human Interface + game feel Niantic.
 */

export const DS = {
  colors: {
    sky: "#5AC8FA",
    skyDark: "#007AFF",
    indigo: "#5856D6",
    purple: "#AF52DE",
    pink: "#FF2D55",
    gold: "#FFCC00",
    goldDark: "#FF9500",
    green: "#34C759",
    red: "#FF3B30",
    navy: "#0D1B2A",
    navyLight: "#1B2838",
    panel: "rgba(255,255,255,0.08)",
    glass: "rgba(255,255,255,0.12)",
    glassStrong: "rgba(255,255,255,0.18)",
    glassBorder: "rgba(255,255,255,0.22)",
    surface: "rgba(13,27,42,0.88)",
    surfaceOverlay: "rgba(13,27,42,0.72)",
    text: "#FFFFFF",
    textMuted: "rgba(255,255,255,0.65)",
    textDim: "rgba(255,255,255,0.4)",
    shadow: "rgba(0,0,0,0.35)",
    capture: "#FF3B30",
    captureGlow: "rgba(255,59,48,0.45)",
    mapOverlay: "rgba(13,27,42,0.15)",
    success: "#34C759",
    warning: "#FF9500",
    error: "#FF3B30",
    info: "#5AC8FA",
  },
  space: {
    xxs: 8,
    xs: 8,
    sm: 16,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  radius: {
    xs: 8,
    sm: 12,
    md: 20,
    lg: 28,
    xl: 36,
    full: 9999,
  },
  type: {
    micro: 11,
    caption: 13,
    body: 16,
    subtitle: 20,
    title: 28,
    hero: 40,
    display: 52,
  },
  weight: {
    regular: "400" as const,
    medium: "600" as const,
    semibold: "700" as const,
    bold: "800" as const,
    black: "900" as const,
  },
  letterSpacing: {
    tight: -0.3,
    normal: 0,
    wide: 0.6,
    caps: 1.2,
  },
  touch: {
    min: 44,
    button: 48,
    icon: 44,
  },
  opacity: {
    disabled: 0.45,
    muted: 0.65,
    subtle: 0.12,
    overlay: 0.72,
  },
  border: {
    hairline: 1,
    default: 2,
    thick: 3,
  },
  layout: {
    tabBarHeight: 92,
    tabScrollPadding: 108,
    sheetBottomOffset: 88,
    maxContentWidth: 420,
  },
  surface: {
    light: "#F7F9FC",
    lightMuted: "#E8EDF5",
    lightText: "#1A202C",
    lightTextMuted: "#4A5568",
    card: "#FFFFFF",
  },
  glass: {
    subtle: "rgba(255,255,255,0.08)",
    default: "rgba(255,255,255,0.12)",
    strong: "rgba(255,255,255,0.18)",
    premium: "rgba(13,27,42,0.78)",
  },
  icon: {
    sm: 16,
    md: 24,
    lg: 32,
  },
} as const;

export const MOTION = {
  instant: 0,
  fast: 150,
  normal: 280,
  slow: 420,
  spring: { damping: 14, stiffness: 160 },
  springBouncy: { damping: 10, stiffness: 120 },
} as const;

export const ELEVATION = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.38,
    shadowRadius: 24,
    elevation: 12,
  },
  glow: {
    shadowColor: DS.colors.sky,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

export const GRADIENTS = {
  splash: ["#5AC8FA", "#5856D6", "#0D1B2A"] as const,
  welcome: ["#1B2838", "#0D1B2A", "#000000"] as const,
  celebration: ["#FFCC00", "#FF9500", "#FF2D55"] as const,
  profile: ["#5856D6", "#AF52DE", "#0D1B2A"] as const,
  map: ["transparent", "rgba(13,27,42,0.6)"] as const,
  capture: ["#0D1B2A", "#0a1628"] as const,
  screen: ["#0D1B2A", "#1B2838"] as const,
  primary: ["#5AC8FA", "#007AFF"] as const,
  gold: ["#FFCC00", "#FF9500"] as const,
  captureAction: ["#FF3B30", "#FF6B5A"] as const,
  rare: ["#5AC8FA", "#5856D6"] as const,
  legendary: ["#FFCC00", "#FF9500", "#FF2D55"] as const,
};

export const RARITY_COLORS = {
  commun: "#8E8E93",
  rare: "#5AC8FA",
  légendaire: "#FFCC00",
} as const;

/** Alias rétrocompatible — préférer DS dans le nouveau code */
export const GAME = {
  ...DS.colors,
  space: DS.space,
  radius: DS.radius,
  type: DS.type,
  weight: DS.weight,
  letterSpacing: DS.letterSpacing,
  layout: DS.layout,
  surface: DS.surface,
  border: DS.border,
  touch: DS.touch,
  opacity: DS.opacity,
  glassToken: DS.glass,
  icon: DS.icon,
} as const;

/** Styles texte réutilisables — une seule source typographique */
export const TEXT = {
  display: {
    fontSize: DS.type.display,
    fontWeight: DS.weight.black,
    color: DS.colors.text,
    letterSpacing: DS.letterSpacing.tight,
  },
  hero: {
    fontSize: DS.type.hero,
    fontWeight: DS.weight.black,
    color: DS.colors.text,
  },
  title: {
    fontSize: DS.type.title,
    fontWeight: DS.weight.black,
    color: DS.colors.text,
  },
  subtitle: {
    fontSize: DS.type.subtitle,
    fontWeight: DS.weight.bold,
    color: DS.colors.text,
  },
  body: {
    fontSize: DS.type.body,
    fontWeight: DS.weight.medium,
    color: DS.colors.text,
    lineHeight: 22,
  },
  bodyStrong: {
    fontSize: DS.type.body,
    fontWeight: DS.weight.bold,
    color: DS.colors.text,
  },
  caption: {
    fontSize: DS.type.caption,
    fontWeight: DS.weight.semibold,
    color: DS.colors.textMuted,
    lineHeight: 18,
  },
  label: {
    fontSize: DS.type.caption,
    fontWeight: DS.weight.bold,
    color: DS.colors.textMuted,
    textTransform: "uppercase" as const,
    letterSpacing: DS.letterSpacing.caps,
  },
  micro: {
    fontSize: DS.type.micro,
    fontWeight: DS.weight.bold,
    color: DS.colors.textDim,
  },
} as const;
