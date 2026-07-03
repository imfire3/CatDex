import { db } from '../db/database';

export interface UserRow {
  id: string;
  username: string;
  avatar_url: string | null;
  xp: number;
  level: number;
  total_discoveries: number;
  total_observations: number;
  daily_streak: number;
  last_active_date: string | null;
  profile_frame: string | null;
  background: string;
  districts_explored: string;
  photos_taken: number;
  first_discoveries: number;
  walk_distance_km: number;
}

export const userRepository = {
  getById(id: string): UserRow | undefined {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
  },

  update(id: string, fields: Partial<UserRow>): void {
    const keys = Object.keys(fields);
    if (keys.length === 0) return;
    const sets = keys.map((k) => `${k} = ?`).join(', ');
    const values = keys.map((k) => fields[k as keyof UserRow]);
    db.prepare(`UPDATE users SET ${sets} WHERE id = ?`).run(...values, id);
  },

  getLeaderboard(limit = 20) {
    return db.prepare(`
      SELECT id, username, avatar_url, xp, level, total_discoveries
      FROM users ORDER BY xp DESC LIMIT ?
    `).all(limit) as Pick<UserRow, 'id' | 'username' | 'avatar_url' | 'xp' | 'level' | 'total_discoveries'>[];
  },

  getFriends(userId: string) {
    return db.prepare(`
      SELECT u.id, u.username, u.avatar_url, u.xp, u.level
      FROM users u
      JOIN friends f ON f.friend_id = u.id
      WHERE f.user_id = ?
    `).all(userId) as Pick<UserRow, 'id' | 'username' | 'avatar_url' | 'xp' | 'level'>[];
  },
};
