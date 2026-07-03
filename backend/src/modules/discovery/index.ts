import { v4 as uuid } from 'uuid';
import { DiscoveryResult, XPEvent } from '@catdex/shared';
import { db } from '../../db/database';
import { photoAnalysisService } from '../photoAnalysis';
import { applyXPEvents, calculateLevel, checkLevelUp } from '../xp';
import { checkAndAwardBadges } from '../badges';
import { updateMissionProgress } from '../missions';
import { catRepository } from '../../repositories/catRepository';
import { userRepository } from '../../repositories/userRepository';

const DUPLICATE_RADIUS_KM = 0.05;
const POPULAR_THRESHOLD = 15;
const RECENT_HOURS = 24;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function inferDistrict(lat: number, lng: number): string {
  const districts = ['Downtown', 'Park District', 'Harbor', 'Old Town', 'University', 'Riverside', 'Market Square'];
  const index = Math.abs(Math.floor(lat * 1000 + lng * 1000)) % districts.length;
  return districts[index];
}

function isNightTime(): boolean {
  const hour = new Date().getHours();
  return hour >= 22 || hour < 5;
}

export interface DiscoverCatInput {
  userId: string;
  photoBuffer: Buffer;
  photoUrl: string;
  latitude: number;
  longitude: number;
  name?: string;
}

export async function discoverCat(input: DiscoverCatInput): Promise<DiscoveryResult> {
  const user = userRepository.getById(input.userId);
  if (!user) throw new Error('User not found');

  const analysis = await photoAnalysisService.analyze(input.photoBuffer, {
    latitude: input.latitude,
    longitude: input.longitude,
  });

  const district = inferDistrict(input.latitude, input.longitude);
  const nearbyCats = catRepository.findNearby(input.latitude, input.longitude, DUPLICATE_RADIUS_KM);

  let isNewDiscovery = true;
  let isFirstDiscoverer = true;
  let existingCat = nearbyCats[0];

  if (existingCat) {
    isNewDiscovery = false;
    isFirstDiscoverer = false;
    catRepository.addObservation({
      catId: existingCat.id,
      userId: input.userId,
      photoUrl: input.photoUrl,
      latitude: input.latitude,
      longitude: input.longitude,
    });
    existingCat = catRepository.getById(existingCat.id)!;
  } else {
    const catName = input.name ?? generateCatName(analysis.color);
    existingCat = catRepository.create({
      name: catName,
      color: analysis.color,
      breed: analysis.breed,
      estimatedAge: analysis.estimatedAge,
      furLength: analysis.furLength,
      confidence: analysis.confidence,
      modelId: analysis.modelId,
      photoUrl: input.photoUrl,
      latitude: input.latitude,
      longitude: input.longitude,
      district,
      discoveredBy: input.userId,
    });
  }

  const xpEventTypes: XPEvent['type'][] = [];
  if (isNewDiscovery) xpEventTypes.push('discover_cat');
  if (isFirstDiscoverer) xpEventTypes.push('first_discoverer');

  const districts: string[] = JSON.parse(user.districts_explored || '[]');
  const isNewDistrict = !districts.includes(district);
  if (isNewDistrict) {
    xpEventTypes.push('new_district');
    districts.push(district);
  }

  const today = new Date().toISOString().split('T')[0];
  const lastActive = user.last_active_date;
  let dailyStreak = user.daily_streak;
  if (lastActive !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    dailyStreak = lastActive === yesterdayStr ? dailyStreak + 1 : 1;
    if (dailyStreak > 1) xpEventTypes.push('daily_streak');
  }

  const xpResult = applyXPEvents(user.xp, xpEventTypes);
  const levelUp = checkLevelUp(user.xp, xpResult.newXp);
  const newLevel = calculateLevel(xpResult.newXp);

  let profileFrame = user.profile_frame;
  let background = user.background;
  if (levelUp) {
    for (const reward of levelUp.rewards) {
      if (reward.profileFrame) profileFrame = reward.profileFrame;
      if (reward.background) background = reward.background;
    }
  }

  userRepository.update(input.userId, {
    xp: xpResult.newXp,
    level: newLevel,
    total_discoveries: isNewDiscovery ? user.total_discoveries + 1 : user.total_discoveries,
    total_observations: user.total_observations + 1,
    daily_streak: dailyStreak,
    last_active_date: today,
    districts_explored: JSON.stringify(districts),
    photos_taken: user.photos_taken + 1,
    first_discoveries: isFirstDiscoverer ? user.first_discoveries + 1 : user.first_discoveries,
    profile_frame: profileFrame,
    background,
  });

  updateMissionProgress(input.userId, 'discover_cats');
  updateMissionProgress(input.userId, 'take_photos');
  if (isNewDistrict) updateMissionProgress(input.userId, 'new_neighborhood');
  updateMissionProgress(input.userId, 'observations');
  if (isFirstDiscoverer) updateMissionProgress(input.userId, 'first_discoveries');

  const updatedUser = userRepository.getById(input.userId)!;
  const newBadges = checkAndAwardBadges({
    userId: input.userId,
    totalDiscoveries: updatedUser.total_discoveries,
    photosTaken: updatedUser.photos_taken,
    firstDiscoveries: updatedUser.first_discoveries,
    level: newLevel,
    isNightDiscovery: isNightTime() && isNewDiscovery,
  });

  const cat = catRepository.toCat(existingCat, input.userId);
  cat.isRecentlyObserved = isRecentlyObserved(existingCat.last_observed_at);
  cat.isPopular = existingCat.observation_count >= POPULAR_THRESHOLD;

  return {
    cat,
    isNewDiscovery,
    isFirstDiscoverer,
    xpEvents: xpResult.events,
    newBadges,
    levelUp: levelUp ?? undefined,
  };
}

function isRecentlyObserved(lastObservedAt: string): boolean {
  const diff = Date.now() - new Date(lastObservedAt).getTime();
  return diff < RECENT_HOURS * 60 * 60 * 1000;
}

const NAME_PREFIXES: Record<string, string[]> = {
  black: ['Shadow', 'Midnight', 'Onyx', 'Coal'],
  white: ['Snowball', 'Cloud', 'Pearl', 'Ghost'],
  orange: ['Ginger', 'Pumpkin', 'Marmalade', 'Copper'],
  tabby: ['Tiger', 'Stripe', 'Whiskers', 'Bandit'],
  calico: ['Patches', 'Tricolor', 'Mosaic', 'Harlequin'],
  gray: ['Misty', 'Silver', 'Ash', 'Smokey'],
  tuxedo: ['Felix', 'Bowtie', 'Formal', 'Tux'],
};

function generateCatName(color: string): string {
  const names = NAME_PREFIXES[color] ?? ['Whiskers', 'Mittens', 'Luna', 'Oliver'];
  return names[Math.floor(Math.random() * names.length)];
}
