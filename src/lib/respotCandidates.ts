import { distanceMeters } from '@/lib/constants';
import type { Cat, CatAnalysis } from '@/types/cat';

export const RESPOT_MAX_DISTANCE_M = 250;
export const RESPOT_MIN_SCORE = 0.55;
export const RESPOT_MAX_CANDIDATES = 3;

export type RespotSighting = {
  latitude: number;
  longitude: number;
  analysis: Pick<CatAnalysis, 'color' | 'coatPattern' | 'coat' | 'breed'>;
};

export type RespotCandidate = {
  cat: Cat;
  score: number;
  distanceM: number;
};

function normalizeToken(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

/** 1 exact, 0.5 substring either way, 0 none. Empty either side → neutral 0.5 when `neutralIfMissing`. */
function textScore(
  a: string | undefined,
  b: string | undefined,
  neutralIfMissing = false,
): number {
  const left = normalizeToken(a);
  const right = normalizeToken(b);
  if (!left || !right) return neutralIfMissing ? 0.5 : 0;
  if (left === right) return 1;
  if (left.includes(right) || right.includes(left)) return 0.5;
  return 0;
}

export function findRespotCandidates(
  ownedCats: Cat[],
  sighting: RespotSighting,
  options?: Partial<{
    maxDistanceM: number;
    minScore: number;
    maxCandidates: number;
  }>,
): RespotCandidate[] {
  const maxDistanceM = options?.maxDistanceM ?? RESPOT_MAX_DISTANCE_M;
  const minScore = options?.minScore ?? RESPOT_MIN_SCORE;
  const maxCandidates = options?.maxCandidates ?? RESPOT_MAX_CANDIDATES;
  const sa = sighting.analysis;

  const scored: RespotCandidate[] = [];

  for (const cat of ownedCats) {
    const distanceM = distanceMeters(
      sighting.latitude,
      sighting.longitude,
      cat.latitude,
      cat.longitude,
    );
    if (distanceM > maxDistanceM) continue;

    const geoScore = 1 - distanceM / maxDistanceM;
    const colorScore = textScore(sa.color, cat.analysis.color, false);
    const patternScore = textScore(sa.coatPattern, cat.analysis.coatPattern, true);
    const coatScore = textScore(sa.coat, cat.analysis.coat, true);
    const breedScore = textScore(sa.breed, cat.analysis.breed, true);

    const score =
      0.45 * geoScore +
      0.3 * colorScore +
      0.15 * patternScore +
      0.05 * coatScore +
      0.05 * breedScore;

    if (score < minScore) continue;
    scored.push({ cat, score, distanceM });
  }

  return scored
    .sort((a, b) => b.score - a.score || a.distanceM - b.distanceM)
    .slice(0, maxCandidates);
}
