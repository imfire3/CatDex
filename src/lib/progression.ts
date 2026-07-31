/** Shared XP / level derivation from collection + mission progress. */

const CATS_PER_LEVEL = 3;
const XP_PER_CAT_STEP = 40;
const XP_PER_MISSION = 20;
export const XP_MAX = 120;

export function levelFromCatsCount(catsCount: number): number {
  return Math.max(1, Math.floor(catsCount / CATS_PER_LEVEL) + 1);
}

export function xpFromProgress(catsCount: number, missionsCompleted = 0): number {
  return (catsCount % CATS_PER_LEVEL) * XP_PER_CAT_STEP + missionsCompleted * XP_PER_MISSION;
}
