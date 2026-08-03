import type { CatAnalysis } from '@/types/cat';

/** Offline / API-down fallback — always passes isNoCatFound checks. */
export const OFFLINE_CAT_ANALYSIS: CatAnalysis = {
  color: 'Roux',
  breed: 'Européen',
  coat: 'Court',
  description:
    'Un chat roux au pelage doux, aux yeux curieux. Repéré lors d’une balade de quartier.',
  suggestedName: 'Caramel',
  gender: 'unknown',
  eyes: 'Verts',
  size: 'Moyenne',
  tags: ['Soleil', 'Curieux'],
};
