import { LEVEL_THRESHOLDS, LEVEL_REWARDS, XP_REWARDS } from '@catdex/shared';
import type { LevelReward, XPEvent } from '@catdex/shared';

export interface XPResult {
  newXp: number;
  events: XPEvent[];
  totalGained: number;
}

export function calculateLevel(xp: number): number {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }
  return level;
}

export function xpForNextLevel(currentXp: number): { current: number; required: number; progress: number } {
  const level = calculateLevel(currentXp);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const progress = nextThreshold > currentThreshold
    ? (currentXp - currentThreshold) / (nextThreshold - currentThreshold)
    : 1;
  return { current: currentXp, required: nextThreshold, progress: Math.min(progress, 1) };
}

export function getRewardsForLevel(level: number): LevelReward[] {
  return LEVEL_REWARDS.filter((r) => r.level === level);
}

export function applyXPEvents(currentXp: number, eventTypes: XPEvent['type'][]): XPResult {
  const events: XPEvent[] = eventTypes.map((type) => ({
    type,
    amount: XP_REWARDS[type],
    label: formatXPLabel(type),
  }));

  const totalGained = events.reduce((sum, e) => sum + e.amount, 0);
  return { newXp: currentXp + totalGained, events, totalGained };
}

function formatXPLabel(type: XPEvent['type']): string {
  const labels: Record<XPEvent['type'], string> = {
    discover_cat: 'Cat Discovered!',
    first_discoverer: 'First Discoverer Bonus!',
    daily_streak: 'Daily Streak Bonus!',
    new_district: 'New District Explored!',
    mission_complete: 'Mission Complete!',
  };
  return labels[type];
}

export function checkLevelUp(oldXp: number, newXp: number): { from: number; to: number; rewards: LevelReward[] } | null {
  const oldLevel = calculateLevel(oldXp);
  const newLevel = calculateLevel(newXp);
  if (newLevel <= oldLevel) return null;

  const rewards: LevelReward[] = [];
  for (let l = oldLevel + 1; l <= newLevel; l++) {
    rewards.push(...getRewardsForLevel(l));
  }

  return { from: oldLevel, to: newLevel, rewards };
}
