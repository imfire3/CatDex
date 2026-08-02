import type { CatAnalysis, CatGender } from '@/types/cat';

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
 * Fills optional analysis traits so UI screens always have mockup-ready fields.
 */
export function enrichAnalysis(analysis: CatAnalysis, seed = 0): CatAnalysis {
  const color = analysis.color || 'Inconnue';
  const coat = analysis.coat || 'Indéterminée';
  const lower = `${color} ${coat}`.toLowerCase();

  const gender: CatGender =
    analysis.gender ??
    (seed % 3 === 0 ? 'female' : seed % 3 === 1 ? 'male' : 'unknown');

  const eyes =
    analysis.eyes ??
    (lower.includes('noir')
      ? 'Ambre'
      : lower.includes('siamois') || lower.includes('blanc')
        ? 'Bleus'
        : lower.includes('roux')
          ? 'Verts'
          : 'Dorés');

  const size =
    analysis.size ??
    (lower.includes('chaton') || lower.includes('petit')
      ? 'Petite'
      : lower.includes('gros') || lower.includes('grand')
        ? 'Grande'
        : 'Moyenne');

  const tags =
    analysis.tags && analysis.tags.length > 0
      ? analysis.tags.slice(0, 2)
      : [...TAG_SETS[Math.abs(seed) % TAG_SETS.length]];

  return {
    ...analysis,
    color,
    coat,
    gender,
    eyes,
    size,
    tags,
  };
}

export function genderSymbol(gender?: CatGender): string {
  if (gender === 'male') return '♂';
  if (gender === 'female') return '♀';
  return '';
}

/** True when Vision says the photo has no clearly visible cat. */
export function isNoCatFound(analysis: CatAnalysis): boolean {
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
