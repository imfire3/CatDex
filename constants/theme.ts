/** Grille 8px — espacements, rayons et cibles tactiles cohérents */
export const SPACE = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
  xxl: 48,
} as const;

export const RADIUS = {
  sm: 8,
  md: 16,
  lg: 24,
  button: 24,
  full: 9999,
} as const;

export const BORDER = {
  hairline: 1,
  default: 2,
  thick: 3,
} as const;

export const TOUCH = {
  min: 48,
  button: 48,
  icon: 40,
} as const;

export const TYPE = {
  caption: 12,
  body: 16,
  subtitle: 20,
  title: 24,
  display: 32,
} as const;

export const POGO = {
  sky: "#41BCE2",
  skyDark: "#2A9CC4",
  navy: "#1B2A4A",
  panel: "#253248",
  panelLight: "#314463",
  gold: "#FFCB05",
  goldDark: "#E6B800",
  capture: "#E3350D",
  captureDark: "#C62828",
  white: "#FFFFFF",
  text: "#FFFFFF",
  textMuted: "#A8B8D8",
  xp: "#4FC3F7",
  xpBg: "#1E3A5F",
  success: "#66BB6A",
  mapZone: "rgba(65, 188, 226, 0.25)",
  mapZoneStroke: "rgba(65, 188, 226, 0.85)",
} as const;

/** Palette écrans auth — glass dark + glow (inspiré Floxy) */
export const AUTH = {
  bg: "#0A1020",
  card: "rgba(18, 28, 48, 0.72)",
  input: "rgba(255, 255, 255, 0.08)",
  inputBorder: "rgba(255, 255, 255, 0.14)",
  glass: "rgba(16, 24, 42, 0.68)",
  glassBorder: "rgba(65, 188, 226, 0.28)",
  overlay: "rgba(6, 10, 22, 0.52)",
  overlayBottom: "rgba(6, 10, 22, 0.82)",
  glowCyan: "rgba(65, 188, 226, 0.55)",
  glowBlue: "rgba(30, 80, 180, 0.45)",
  text: POGO.white,
  textMuted: "rgba(168, 184, 216, 0.85)",
  divider: "rgba(255, 255, 255, 0.12)",
  shadow: "rgba(0, 0, 0, 0.35)",
  gradientStart: POGO.sky,
  gradientEnd: "#2A6FD4",
} as const;

export const COLORS = POGO;

export function getTrainerLevel(captureCount: number) {
  return Math.max(1, Math.floor(captureCount / 3) + 1);
}

export function getTrainerXpProgress(captureCount: number) {
  const currentLevelXp = captureCount % 3;
  return currentLevelXp / 3;
}

export const ONBOARDING_SLIDES = [
  {
    title: "Respecte les chats",
    description:
      "Observe sans déranger. Ne les nourris pas sans autorisation et garde tes distances.",
    emoji: "🐱",
  },
  {
    title: "Zones, pas adresses",
    description:
      "Les chats apparaissent par quartier, jamais à l'adresse exacte, pour leur sécurité.",
    emoji: "📍",
  },
  {
    title: "Une fiche par chat",
    description:
      "Chaque chat n'a qu'une seule carte dans le ChatDex. Vérifie avant d'en créer une nouvelle.",
    emoji: "🃏",
  },
  {
    title: "Amuse-toi à collectionner",
    description:
      "Capture, complète ton ChatDex et découvre les chats repérés par la communauté.",
    emoji: "✨",
  },
] as const;
