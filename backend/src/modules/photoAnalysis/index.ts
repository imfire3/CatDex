import {
  CatBreed,
  CatColor,
  CatModelId,
  FurLength,
  PhotoAnalysisResult,
  selectModelFromAnalysis,
} from '@catdex/shared';

const COLORS: CatColor[] = ['black', 'white', 'orange', 'tabby', 'calico', 'gray', 'tuxedo'];
const BREEDS: CatBreed[] = [
  'domestic_shorthair', 'domestic_longhair', 'siamese', 'persian',
  'maine_coon', 'bengal', 'ragdoll', 'british_shorthair',
];
const AGES = ['kitten (0-1 year)', 'young (1-3 years)', 'adult (3-7 years)', 'senior (7+ years)'];
const FUR_LENGTHS: FurLength[] = ['short', 'long', 'medium'];

/**
 * Simulated photo analysis module.
 * Replace this implementation with a real AI service later.
 */
export interface PhotoAnalysisService {
  analyze(photoBuffer: Buffer, metadata?: { latitude?: number; longitude?: number }): Promise<PhotoAnalysisResult>;
}

function hashBuffer(buffer: Buffer): number {
  let hash = 0;
  for (let i = 0; i < Math.min(buffer.length, 1024); i++) {
    hash = ((hash << 5) - hash + buffer[i]) | 0;
  }
  return Math.abs(hash);
}

function pickFromHash<T>(arr: T[], hash: number, offset: number): T {
  return arr[(hash + offset) % arr.length];
}

export class SimulatedPhotoAnalysisService implements PhotoAnalysisService {
  async analyze(photoBuffer: Buffer): Promise<PhotoAnalysisResult> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700));

    const hash = hashBuffer(photoBuffer);
    const color = pickFromHash(COLORS, hash, 0);
    const breed = pickFromHash(BREEDS, hash, 3);
    const estimatedAge = pickFromHash(AGES, hash, 7);
    const furLength = pickFromHash(FUR_LENGTHS, hash, 11);
    const confidence = 0.72 + ((hash % 28) / 100);

    const modelId = selectModelFromAnalysis({ color, furLength });

    return { color, breed, estimatedAge, furLength, confidence, modelId };
  }
}

export const photoAnalysisService: PhotoAnalysisService = new SimulatedPhotoAnalysisService();
