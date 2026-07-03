import { v4 as uuid } from 'uuid';
import {
  DAILY_MISSIONS_TEMPLATE,
  WEEKLY_MISSIONS_TEMPLATE,
  Mission,
  MissionGoal,
} from '@catdex/shared';
import { db } from '../../db/database';

function endOfDay(): string {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

function endOfWeek(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = 7 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

export function ensureMissions(userId: string): void {
  const now = new Date().toISOString();
  const dailyCount = db.prepare(
    "SELECT COUNT(*) as c FROM missions WHERE user_id = ? AND type = 'daily' AND expires_at > ?"
  ).get(userId, now) as { c: number };

  if (dailyCount.c === 0) {
    for (const template of DAILY_MISSIONS_TEMPLATE) {
      db.prepare(`
        INSERT INTO missions (id, user_id, type, goal, title, description, target, xp_reward, expires_at)
        VALUES (?, ?, 'daily', ?, ?, ?, ?, ?, ?)
      `).run(uuid(), userId, template.goal, template.title, template.description, template.target, template.xpReward, endOfDay());
    }
  }

  const weeklyCount = db.prepare(
    "SELECT COUNT(*) as c FROM missions WHERE user_id = ? AND type = 'weekly' AND expires_at > ?"
  ).get(userId, now) as { c: number };

  if (weeklyCount.c === 0) {
    for (const template of WEEKLY_MISSIONS_TEMPLATE) {
      db.prepare(`
        INSERT INTO missions (id, user_id, type, goal, title, description, target, xp_reward, expires_at)
        VALUES (?, ?, 'weekly', ?, ?, ?, ?, ?, ?)
      `).run(uuid(), userId, template.goal, template.title, template.description, template.target, template.xpReward, endOfWeek());
    }
  }
}

export function getMissions(userId: string): Mission[] {
  ensureMissions(userId);
  const now = new Date().toISOString();
  const rows = db.prepare(
    'SELECT * FROM missions WHERE user_id = ? AND expires_at > ? ORDER BY type, title'
  ).all(userId, now) as MissionRow[];

  return rows.map(rowToMission);
}

interface MissionRow {
  id: string;
  type: string;
  goal: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  xp_reward: number;
  completed: number;
}

function rowToMission(row: MissionRow): Mission {
  return {
    id: row.id,
    type: row.type as Mission['type'],
    title: row.title,
    description: row.description,
    goal: row.goal as MissionGoal,
    target: row.target,
    progress: row.progress,
    xpReward: row.xp_reward,
    completed: row.completed === 1,
  };
}

export function updateMissionProgress(userId: string, goal: MissionGoal, amount = 1): string[] {
  ensureMissions(userId);
  const now = new Date().toISOString();
  const missions = db.prepare(
    'SELECT * FROM missions WHERE user_id = ? AND goal = ? AND completed = 0 AND expires_at > ?'
  ).all(userId, goal, now) as MissionRow[];

  const completedIds: string[] = [];

  for (const mission of missions) {
    const newProgress = Math.min(mission.progress + amount, mission.target);
    const isComplete = newProgress >= mission.target;

    db.prepare('UPDATE missions SET progress = ?, completed = ? WHERE id = ?').run(
      newProgress, isComplete ? 1 : 0, mission.id
    );

    if (isComplete) completedIds.push(mission.id);
  }

  return completedIds;
}
