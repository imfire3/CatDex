import type { CatAnalysis, CatGender } from '@/types/cat';
import { ensureCatIdentity } from '@/lib/mockAnalysis';

const TAG_SETS = [
  ['Ombre', 'Mystère'],
  ['Soleil', 'Curieux'],
  ['Velours', 'Doux'],
  ['Éclair', 'Vif'],
  ['Nuit', 'Furtif'],
  ['Miel', 'Câlin'],
  ['Brume', 'Discret'],
  ['Flamme', 'Audacieux'],
] as const;

/**
 * Fills optional analysis traits so UI screens always have mockup-ready fields,
 * including breed, color, random traits and a suggested name when missing.
 */
export function enrichAnalysis(
  analysis: CatAnalysis | null | undefined,
  seed = 0,
): CatAnalysis {
  const base: CatAnalysis = analysis ?? {
    color: 'Inconnue',
    breed: 'Indéterminée',
    coat: 'Indéterminée',
    description: 'Chat repéré dans le quartier.',
  };
  const seeded = ensureCatIdentity(
    base,
    `${base.color ?? ''}:${base.breed ?? ''}:${seed}`,
  );
  const color = seeded.color || 'Inconnue';
  const coat = seeded.coat || 'Indéterminée';
  const lower = `${color} ${coat}`.toLowerCase();

  const gender: CatGender =
    seeded.gender ??
    (seed % 3 === 0 ? 'female' : seed % 3 === 1 ? 'male' : 'unknown');

  const eyes =
    seeded.eyes ??
    (lower.includes('noir')
      ? 'Ambre'
      : lower.includes('siamois') || lower.includes('blanc')
        ? 'Bleus'
        : lower.includes('roux')
          ? 'Verts'
          : 'Dorés');

  const size =
    seeded.size ??
    (lower.includes('chaton') || lower.includes('petit')
      ? 'Petite'
      : lower.includes('gros') || lower.includes('grand')
        ? 'Grande'
        : 'Moyenne');

  const tags =
    seeded.tags && seeded.tags.length > 0
      ? seeded.tags.slice(0, 8)
      : [...TAG_SETS[Math.abs(seed) % TAG_SETS.length], 'Gourmand'].slice(0, 3);

  return {
    ...seeded,
    color,
    coat,
    gender,
    eyes,
    size,
    tags,
    suggestedName: seeded.suggestedName,
  };
}

export function genderSymbol(gender?: CatGender): string {
  if (gender === 'male') return '♂';
  if (gender === 'female') return '♀';
  return '';
}

/** True when Vision says the photo has no clearly visible cat. */
export function isNoCatFound(analysis: CatAnalysis): boolean {
  if (analysis.notACat === true) return true;
  if (analysis.errorCode === 'NOT_A_CAT') return true;
  if (
    typeof analysis.confidence === 'number' &&
    Number.isFinite(analysis.confidence) &&
    analysis.confidence < 90 &&
    !(analysis.suggestedName ?? '').trim()
  ) {
    return true;
  }

  const description = (analysis.description ?? '').toLowerCase();
  const breed = (analysis.breed ?? '').toLowerCase();
  const color = (analysis.color ?? '').toLowerCase();
  const suggestedName = (analysis.suggestedName ?? '').trim();

  if (description.includes('aucun chat')) return true;
  if (breed === 'inconnu' && suggestedName === '') return true;
  if (breed === 'inconnu' && (color.includes('indétermin') || color.includes('indetermin'))) {
    return true;
  }
  return false;
}
