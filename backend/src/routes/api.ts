import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import { catRepository } from '../repositories/catRepository';
import { userRepository } from '../repositories/userRepository';
import { discoverCat } from '../modules/discovery';
import { getMissions } from '../modules/missions';
import { getAllBadges, getUserBadges } from '../modules/badges';
import { seasonService } from '../modules/seasons';
import { xpForNextLevel } from '../modules/xp';
import { photoAnalysisService } from '../modules/photoAnalysis';

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (_req, file, cb) => cb(null, `${uuid()}${path.extname(file.originalname) || '.jpg'}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const DEFAULT_USER_ID = 'user-1';

function getUserId(req: Request): string {
  return (req.headers['x-user-id'] as string) || DEFAULT_USER_ID;
}

export const apiRouter = Router();

// User profile
apiRouter.get('/users/me', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const user = userRepository.getById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const xpInfo = xpForNextLevel(user.xp);
  res.json({
    id: user.id,
    username: user.username,
    avatarUrl: user.avatar_url,
    xp: user.xp,
    level: user.level,
    totalDiscoveries: user.total_discoveries,
    totalObservations: user.total_observations,
    dailyStreak: user.daily_streak,
    badges: getUserBadges(userId),
    profileFrame: user.profile_frame,
    background: user.background,
    districtsExplored: JSON.parse(user.districts_explored || '[]'),
    xpProgress: xpInfo,
  });
});

// Photo analysis (preview without saving)
apiRouter.post('/analyze', upload.single('photo'), async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'Photo required' });
  const buffer = fs.readFileSync(req.file.path);
  const result = await photoAnalysisService.analyze(buffer);
  res.json(result);
});

// Discover cat (full flow)
apiRouter.post('/discover', upload.single('photo'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Photo required' });
    const { latitude, longitude, name } = req.body;
    if (!latitude || !longitude) return res.status(400).json({ error: 'Location required' });

    const buffer = fs.readFileSync(req.file.path);
    const photoUrl = `/uploads/${req.file.filename}`;

    const result = await discoverCat({
      userId: getUserId(req),
      photoBuffer: buffer,
      photoUrl,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      name: name || undefined,
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Discovery failed' });
  }
});

// Map pins
apiRouter.get('/map/cats', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { minLat, maxLat, minLng, maxLng } = req.query;

  let cats;
  if (minLat && maxLat && minLng && maxLng) {
    cats = catRepository.findInBounds(
      parseFloat(minLat as string),
      parseFloat(maxLat as string),
      parseFloat(minLng as string),
      parseFloat(maxLng as string)
    );
  } else {
    cats = dbAllCats();
  }

  res.json(cats.map((c: import('../repositories/catRepository').CatRow) => catRepository.toMapPin(c, userId)));
});

function dbAllCats() {
  const { db } = require('../db/database');
  return db.prepare('SELECT * FROM cats').all();
}

// Cat profile
apiRouter.get('/cats/:id', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const cat = catRepository.getById(req.params.id);
  if (!cat) return res.status(404).json({ error: 'Cat not found' });

  const observations = catRepository.getObservations(cat.id);
  const comments = catRepository.getComments(cat.id);
  const isLiked = catRepository.isLiked(cat.id, userId);

  res.json({
    ...catRepository.toCat(cat, userId),
    observations,
    comments,
    isLiked,
  });
});

// Social: like
apiRouter.post('/cats/:id/like', (req: Request, res: Response) => {
  const result = catRepository.toggleLike(req.params.id, getUserId(req));
  res.json(result);
});

// Social: favorite
apiRouter.post('/cats/:id/favorite', (req: Request, res: Response) => {
  const favorited = catRepository.toggleFavorite(req.params.id, getUserId(req));
  res.json({ favorited });
});

// Social: comment
apiRouter.post('/cats/:id/comments', (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text required' });
  catRepository.addComment(req.params.id, getUserId(req), text);
  res.json({ success: true });
});

// Leaderboard
apiRouter.get('/leaderboard', (_req: Request, res: Response) => {
  const entries = userRepository.getLeaderboard(50).map((u, i) => ({
    rank: i + 1,
    userId: u.id,
    username: u.username,
    avatarUrl: u.avatar_url,
    xp: u.xp,
    discoveries: u.total_discoveries,
    level: u.level,
  }));
  res.json(entries);
});

// Friends discoveries
apiRouter.get('/friends/discoveries', (req: Request, res: Response) => {
  const discoveries = catRepository.getFriendDiscoveries(getUserId(req));
  res.json(discoveries.map((d) => {
    const row = d as Record<string, string>;
    return {
      id: row.cat_id,
      userId: row.user_id,
      username: row.username,
      avatarUrl: row.avatar_url,
      catId: row.cat_id,
      catName: row.cat_name,
      modelId: row.model_id,
      discoveredAt: row.discovered_at,
    };
  }));
});

// Missions
apiRouter.get('/missions', (req: Request, res: Response) => {
  res.json(getMissions(getUserId(req)));
});

// Badges
apiRouter.get('/badges', (_req: Request, res: Response) => {
  res.json(getAllBadges());
});

// Season
apiRouter.get('/season', (_req: Request, res: Response) => {
  res.json(seasonService.getCurrentSeason());
});

// ChatDex - cat collection summary for chat
apiRouter.get('/chatdex', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { db } = require('../db/database');
  const cats = db.prepare(`
    SELECT c.* FROM cats c
    JOIN observations o ON o.cat_id = c.id
    WHERE o.user_id = ?
    GROUP BY c.id ORDER BY MAX(o.observed_at) DESC LIMIT 50
  `).all(userId);

  res.json({
    recentCats: cats.map((c: Parameters<typeof catRepository.toCat>[0]) => catRepository.toCat(c, userId)),
    totalSeen: cats.length,
  });
});
