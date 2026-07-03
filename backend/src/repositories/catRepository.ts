import { v4 as uuid } from 'uuid';
import { Cat, CatModelId, MapCatPin } from '@catdex/shared';
import { db } from '../db/database';

export interface CatRow {
  id: string;
  name: string;
  color: string;
  breed: string;
  estimated_age: string;
  fur_length: string;
  confidence: number;
  model_id: string;
  photo_url: string;
  latitude: number;
  longitude: number;
  district: string;
  discovered_by: string;
  discovered_at: string;
  last_observed_at: string;
  observation_count: number;
  likes: number;
  is_popular: number;
}

const RECENT_HOURS = 24;
const POPULAR_THRESHOLD = 15;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const catRepository = {
  getById(id: string): CatRow | undefined {
    return db.prepare('SELECT * FROM cats WHERE id = ?').get(id) as CatRow | undefined;
  },

  findNearby(lat: number, lng: number, radiusKm: number): CatRow[] {
    const all = db.prepare('SELECT * FROM cats').all() as CatRow[];
    return all.filter((c) => haversineKm(lat, lng, c.latitude, c.longitude) <= radiusKm);
  },

  findInBounds(minLat: number, maxLat: number, minLng: number, maxLng: number): CatRow[] {
    return db.prepare(`
      SELECT * FROM cats
      WHERE latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?
    `).all(minLat, maxLat, minLng, maxLng) as CatRow[];
  },

  create(data: {
    name: string;
    color: string;
    breed: string;
    estimatedAge: string;
    furLength: string;
    confidence: number;
    modelId: string;
    photoUrl: string;
    latitude: number;
    longitude: number;
    district: string;
    discoveredBy: string;
  }): CatRow {
    const id = uuid();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO cats (id, name, color, breed, estimated_age, fur_length, confidence, model_id,
        photo_url, latitude, longitude, district, discovered_by, discovered_at, last_observed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, data.name, data.color, data.breed, data.estimatedAge, data.furLength,
      data.confidence, data.modelId, data.photoUrl, data.latitude, data.longitude,
      data.district, data.discoveredBy, now, now
    );
    return this.getById(id)!;
  },

  addObservation(data: {
    catId: string;
    userId: string;
    photoUrl: string;
    latitude: number;
    longitude: number;
    notes?: string;
  }): void {
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO observations (id, cat_id, user_id, photo_url, latitude, longitude, observed_at, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(uuid(), data.catId, data.userId, data.photoUrl, data.latitude, data.longitude, now, data.notes ?? null);

    db.prepare(`
      UPDATE cats SET observation_count = observation_count + 1, last_observed_at = ?,
        is_popular = CASE WHEN observation_count + 1 >= ? THEN 1 ELSE is_popular END
      WHERE id = ?
    `).run(now, POPULAR_THRESHOLD, data.catId);
  },

  getObservations(catId: string) {
    return db.prepare(`
      SELECT o.*, u.username FROM observations o
      JOIN users u ON u.id = o.user_id
      WHERE o.cat_id = ? ORDER BY o.observed_at DESC
    `).all(catId);
  },

  getComments(catId: string) {
    return db.prepare(`
      SELECT c.*, u.username, u.avatar_url FROM comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.cat_id = ? ORDER BY c.created_at DESC
    `).all(catId);
  },

  addComment(catId: string, userId: string, text: string): void {
    db.prepare('INSERT INTO comments (id, cat_id, user_id, text, created_at) VALUES (?, ?, ?, ?, ?)').run(
      uuid(), catId, userId, text, new Date().toISOString()
    );
  },

  toggleLike(catId: string, userId: string): { liked: boolean; likes: number } {
    const existing = db.prepare('SELECT 1 FROM likes WHERE user_id = ? AND cat_id = ?').get(userId, catId);
    if (existing) {
      db.prepare('DELETE FROM likes WHERE user_id = ? AND cat_id = ?').run(userId, catId);
      const cat = this.getById(catId)!;
      const newLikes = Math.max(0, cat.likes - 1);
      db.prepare('UPDATE cats SET likes = ? WHERE id = ?').run(newLikes, catId);
      return { liked: false, likes: newLikes };
    }
    db.prepare('INSERT INTO likes (user_id, cat_id, created_at) VALUES (?, ?, ?)').run(
      userId, catId, new Date().toISOString()
    );
    db.prepare('UPDATE cats SET likes = likes + 1 WHERE id = ?').run(catId);
    const cat = this.getById(catId)!;
    return { liked: true, likes: cat.likes };
  },

  toggleFavorite(catId: string, userId: string): boolean {
    const existing = db.prepare('SELECT 1 FROM favorites WHERE user_id = ? AND cat_id = ?').get(userId, catId);
    if (existing) {
      db.prepare('DELETE FROM favorites WHERE user_id = ? AND cat_id = ?').run(userId, catId);
      return false;
    }
    db.prepare('INSERT INTO favorites (user_id, cat_id, created_at) VALUES (?, ?, ?)').run(
      userId, catId, new Date().toISOString()
    );
    return true;
  },

  isFavorite(catId: string, userId: string): boolean {
    return !!db.prepare('SELECT 1 FROM favorites WHERE user_id = ? AND cat_id = ?').get(userId, catId);
  },

  isLiked(catId: string, userId: string): boolean {
    return !!db.prepare('SELECT 1 FROM likes WHERE user_id = ? AND cat_id = ?').get(userId, catId);
  },

  toCat(row: CatRow, userId?: string): Cat {
    const isKnown = row.name !== '???';
    const isRecentlyObserved = Date.now() - new Date(row.last_observed_at).getTime() < RECENT_HOURS * 60 * 60 * 1000;
    return {
      id: row.id,
      name: row.name,
      color: row.color as Cat['color'],
      breed: row.breed as Cat['breed'],
      estimatedAge: row.estimated_age,
      furLength: row.fur_length as Cat['furLength'],
      confidence: row.confidence,
      modelId: row.model_id as CatModelId,
      photoUrl: row.photo_url,
      latitude: row.latitude,
      longitude: row.longitude,
      district: row.district,
      discoveredBy: row.discovered_by,
      discoveredAt: row.discovered_at,
      lastObservedAt: row.last_observed_at,
      observationCount: row.observation_count,
      isFirstDiscoverer: row.discovered_by === userId,
      isPopular: row.is_popular === 1 || row.observation_count >= POPULAR_THRESHOLD,
      isRecentlyObserved,
      isKnown,
      likes: row.likes,
      isFavorite: userId ? this.isFavorite(row.id, userId) : false,
    };
  },

  toMapPin(row: CatRow, userId?: string): MapCatPin {
    const isKnown = row.name !== '???';
    const isRecentlyObserved = Date.now() - new Date(row.last_observed_at).getTime() < RECENT_HOURS * 60 * 60 * 1000;
    return {
      id: row.id,
      latitude: row.latitude,
      longitude: row.longitude,
      modelId: row.model_id as CatModelId,
      isKnown,
      isPopular: row.is_popular === 1 || row.observation_count >= POPULAR_THRESHOLD,
      isRecentlyObserved,
      name: isKnown ? row.name : undefined,
    };
  },

  getFriendDiscoveries(userId: string, limit = 20) {
    return db.prepare(`
      SELECT c.id as cat_id, c.name as cat_name, c.model_id, c.discovered_at,
        u.id as user_id, u.username, u.avatar_url
      FROM cats c
      JOIN users u ON u.id = c.discovered_by
      JOIN friends f ON f.friend_id = u.id
      WHERE f.user_id = ? AND c.discovered_by != ?
      ORDER BY c.discovered_at DESC LIMIT ?
    `).all(userId, userId, limit);
  },
};
