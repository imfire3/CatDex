import type { XpEventType } from "@/gameplay/types";

export const XP_RULES: Record<XpEventType, { amount: number; label: string }> = {
  discover_cat: { amount: 100, label: "Découverte" },
  first_discoverer: { amount: 500, label: "Premier découvreur" },
  daily_streak: { amount: 200, label: "Série quotidienne" },
  new_district: { amount: 300, label: "Nouveau quartier" },
  mission_complete: { amount: 150, label: "Mission accomplie" },
  season_challenge: { amount: 400, label: "Défi saisonnier" },
};

export const LEVEL_THRESHOLDS = [
  0, 250, 600, 1100, 1800, 2700, 3800, 5200, 7000, 9200,
  11800, 15000, 18800, 23400, 29000, 36000, 45000, 56000, 70000,
];

export function xpForLevel(level: number) {
  return LEVEL_THRESHOLDS[Math.min(level, LEVEL_THRESHOLDS.length - 1)] ?? 70000;
}

export function levelFromXp(xp: number) {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return level;
}

export function xpToNextLevel(xp: number) {
  const level = levelFromXp(xp);
  const next = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  return next;
}
