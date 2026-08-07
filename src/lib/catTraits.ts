import type { CatAnalysis, CatGender } from '@/types/cat';

/**
 * Pass-through for Vision analysis.
 * Does NOT invent name / breed / color / coat / traits / description.
 * Used by capture form and CatDex display alike.
 */
export function enrichAnalysis(
  analysis: CatAnalysis | null | undefined,
  _seed = 0,
): CatAnalysis {
  if (!analysis) {
    return {
      color: '',
      breed: '',
      coat: '',
      description: '',
      suggestedName: '',
      tags: [],
    };
  }

  return {
    ...analysis,
    color: analysis.color?.trim() ?? '',
    breed: analysis.breed?.trim() ?? '',
    coat: analysis.coat?.trim() ?? '',
    description: analysis.description?.trim() ?? '',
    suggestedName: analysis.suggestedName?.trim() ?? '',
    tags: analysis.tags?.filter(Boolean) ?? [],
    distinctiveFeatures: analysis.distinctiveFeatures?.filter(Boolean),
  };
}

export function genderSymbol(gender?: CatGender): string {
  if (gender === 'male') return '♂';
  if (gender === 'female') return '♀';
  return '';
}

/** True when Vision says the photo has no clearly visible / usable cat. */
export function isNoCatFound(analysis: CatAnalysis): boolean {
  if (analysis.notACat === true) return true;

  const code = (analysis.errorCode ?? '').toUpperCase();
  if (
    code === 'NOT_A_CAT' ||
    code === 'MULTIPLE_CATS' ||
    code === 'LOW_QUALITY' ||
    code === 'BLURRY' ||
    code === 'PARTIAL_CAT' ||
    code === 'PHOTO_INVALID'
  ) {
    return true;
  }

  const description = (analysis.description ?? '').toLowerCase();
  if (description.includes('aucun chat')) return true;
  return false;
}
