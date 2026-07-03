import { BADGES, BadgeId } from '@catdex/shared';
import { db } from '../../db/database';

export interface BadgeCheckContext {
  userId: string;
  totalDiscoveries: number;
  photosTaken: number;
  firstDiscoveries: number;
  level: number;
  isNightDiscovery?: boolean;
}

export function getUserBadges(userId: string): BadgeId[] {
  const rows = db.prepare('SELECT badge_id FROM user_badges WHERE user_id = ?').all(userId) as { badge_id: BadgeId }[];
  return rows.map((r) => r.badge_id);
}

export function awardBadge(userId: string, badgeId: BadgeId): boolean {
  const existing = db.prepare('SELECT 1 FROM user_badges WHERE user_id = ? AND badge_id = ?').get(userId, badgeId);
  if (existing) return false;

  db.prepare('INSERT INTO user_badges (user_id, badge_id, earned_at) VALUES (?, ?, ?)').run(
    userId, badgeId, new Date().toISOString()
  );
  return true;
}

export function checkAndAwardBadges(ctx: BadgeCheckContext): BadgeId[] {
  const current = new Set(getUserBadges(ctx.userId));
  const newlyEarned: BadgeId[] = [];

  const checks: { id: BadgeId; condition: boolean }[] = [
    { id: 'explorer', condition: ctx.level >= 3 },
    { id: 'photographer', condition: ctx.photosTaken >= 50 },
    { id: 'collector', condition: ctx.level >= 12 },
    { id: 'night_explorer', condition: !!ctx.isNightDiscovery },
    { id: 'cats_100', condition: ctx.totalDiscoveries >= 100 },
    { id: 'cats_500', condition: ctx.totalDiscoveries >= 500 },
    { id: 'cats_1000', condition: ctx.totalDiscoveries >= 1000 },
    { id: 'first_discoverer', condition: ctx.firstDiscoveries >= 10 },
  ];

  for (const check of checks) {
    if (check.condition && !current.has(check.id)) {
      if (awardBadge(ctx.userId, check.id)) {
        newlyEarned.push(check.id);
      }
    }
  }

  return newlyEarned;
}

export function getAllBadges() {
  return BADGES;
}

export function getBadgeDetails(badgeId: BadgeId) {
  return BADGES.find((b) => b.id === badgeId);
}
