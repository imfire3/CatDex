import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'catdex.db');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      avatar_url TEXT,
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      total_discoveries INTEGER DEFAULT 0,
      total_observations INTEGER DEFAULT 0,
      daily_streak INTEGER DEFAULT 0,
      last_active_date TEXT,
      profile_frame TEXT,
      background TEXT DEFAULT 'default',
      districts_explored TEXT DEFAULT '[]',
      photos_taken INTEGER DEFAULT 0,
      first_discoveries INTEGER DEFAULT 0,
      walk_distance_km REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cats (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      breed TEXT NOT NULL,
      estimated_age TEXT NOT NULL,
      fur_length TEXT NOT NULL,
      confidence REAL NOT NULL,
      model_id TEXT NOT NULL,
      photo_url TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      district TEXT NOT NULL,
      discovered_by TEXT NOT NULL,
      discovered_at TEXT NOT NULL,
      last_observed_at TEXT NOT NULL,
      observation_count INTEGER DEFAULT 1,
      likes INTEGER DEFAULT 0,
      is_popular INTEGER DEFAULT 0,
      FOREIGN KEY (discovered_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS observations (
      id TEXT PRIMARY KEY,
      cat_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      photo_url TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      observed_at TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY (cat_id) REFERENCES cats(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      cat_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (cat_id) REFERENCES cats(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS user_badges (
      user_id TEXT NOT NULL,
      badge_id TEXT NOT NULL,
      earned_at TEXT NOT NULL,
      PRIMARY KEY (user_id, badge_id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS favorites (
      user_id TEXT NOT NULL,
      cat_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, cat_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (cat_id) REFERENCES cats(id)
    );

    CREATE TABLE IF NOT EXISTS likes (
      user_id TEXT NOT NULL,
      cat_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, cat_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (cat_id) REFERENCES cats(id)
    );

    CREATE TABLE IF NOT EXISTS missions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      goal TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      target INTEGER NOT NULL,
      progress INTEGER DEFAULT 0,
      xp_reward INTEGER NOT NULL,
      completed INTEGER DEFAULT 0,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS friends (
      user_id TEXT NOT NULL,
      friend_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, friend_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (friend_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_cats_location ON cats(latitude, longitude);
    CREATE INDEX IF NOT EXISTS idx_cats_district ON cats(district);
    CREATE INDEX IF NOT EXISTS idx_observations_cat ON observations(cat_id);
    CREATE INDEX IF NOT EXISTS idx_observations_user ON observations(user_id);
  `);

  seedDefaultUser();
  seedSampleCats();
}

function seedDefaultUser(): void {
  const existing = db.prepare('SELECT id FROM users WHERE id = ?').get('user-1');
  if (existing) return;

  db.prepare(`
    INSERT INTO users (id, username, avatar_url, xp, level, total_discoveries, districts_explored)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('user-1', 'CatExplorer', null, 450, 3, 8, JSON.stringify(['Downtown', 'Park District']));

  const friends = [
    { id: 'user-2', username: 'WhiskerHunter' },
    { id: 'user-3', username: 'PawPrintPro' },
    { id: 'user-4', username: 'MeowMaster' },
  ];

  for (const friend of friends) {
    db.prepare(`
      INSERT INTO users (id, username, xp, level, total_discoveries)
      VALUES (?, ?, ?, ?, ?)
    `).run(friend.id, friend.username, Math.floor(Math.random() * 5000) + 500, Math.floor(Math.random() * 10) + 2, Math.floor(Math.random() * 50) + 5);

    db.prepare('INSERT INTO friends (user_id, friend_id, created_at) VALUES (?, ?, ?)').run(
      'user-1', friend.id, new Date().toISOString()
    );
  }
}

function seedSampleCats(): void {
  const count = db.prepare('SELECT COUNT(*) as c FROM cats').get() as { c: number };
  if (count.c > 0) return;

  const samples = [
    { name: 'Shadow', color: 'black', breed: 'domestic_shorthair', model: 'black_short', lat: 37.7749, lng: -122.4194, district: 'Downtown' },
    { name: 'Snowflake', color: 'white', breed: 'persian', model: 'white_long', lat: 37.7849, lng: -122.4094, district: 'Park District' },
    { name: 'Ginger', color: 'orange', breed: 'domestic_shorthair', model: 'orange_short', lat: 37.7649, lng: -122.4294, district: 'Downtown' },
    { name: 'Tiger', color: 'tabby', breed: 'maine_coon', model: 'tabby_long', lat: 37.7949, lng: -122.3994, district: 'Harbor' },
    { name: 'Patches', color: 'calico', breed: 'domestic_shorthair', model: 'calico_short', lat: 37.7549, lng: -122.4394, district: 'Old Town' },
    { name: 'Felix', color: 'tuxedo', breed: 'british_shorthair', model: 'tuxedo_short', lat: 37.7699, lng: -122.4144, district: 'Park District' },
    { name: 'Misty', color: 'gray', breed: 'russian_blue', model: 'gray_short', lat: 37.7799, lng: -122.4244, district: 'Downtown' },
    { name: 'Unknown', color: 'tabby', breed: 'unknown', model: 'tabby_short', lat: 37.7599, lng: -122.4044, district: 'Harbor' },
  ];

  const { v4: uuid } = require('uuid');
  const now = new Date().toISOString();

  for (const s of samples) {
    const isKnown = s.name !== 'Unknown';
    db.prepare(`
      INSERT INTO cats (id, name, color, breed, estimated_age, fur_length, confidence, model_id, photo_url,
        latitude, longitude, district, discovered_by, discovered_at, last_observed_at, observation_count, is_popular)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      uuid(), isKnown ? s.name : '???', s.color, s.breed, '2-4 years', s.model.includes('long') ? 'long' : 'short',
      0.85 + Math.random() * 0.14, s.model, `/uploads/sample-${s.color}.jpg`,
      s.lat, s.lng, s.district, 'user-2', now, now,
      Math.floor(Math.random() * 20) + 1, s.name === 'Ginger' ? 1 : 0
    );
  }
}
