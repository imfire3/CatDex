import type { CatAnalysis, CatGender } from '@/types/cat';

const COLORS = [
  'Noir',
  'Roux',
  'Roux tigré',
  'Gris',
  'Gris tigré',
  'Blanc',
  'Écaille de tortue',
  'Bicolore',
  'Crème',
  'Siamois',
] as const;

const BREEDS = [
  'Européen',
  'Chartreux',
  'Siamois',
  'Maine Coon',
  'Persan',
  'British Shorthair',
  'Bengal',
  'Ragdoll',
  'Norvégien',
  'Sphynx',
] as const;

const COATS = ['Court', 'Mi-long', 'Long', 'Bouclé'] as const;
const EYES = ['Ambre', 'Verts', 'Bleus', 'Dorés', 'Noisette', 'Cuivre'] as const;
const SIZES = ['Petite', 'Moyenne', 'Grande'] as const;
const GENDERS: CatGender[] = ['male', 'female', 'unknown'];

const NAMES = [
  'Nori',
  'Caramel',
  'Mistral',
  'Suki',
  'Olive',
  'Pixel',
  'Moka',
  'Luna',
  'Tigrou',
  'Cendre',
  'Wasabi',
  'Praline',
  'Ziggy',
  'Félix',
  'Mina',
  'Gus',
  'Nala',
  'Biscuit',
  'Shadow',
  'Pêche',
] as const;

const DARK_NAMES = [
  'Nox',
  'Ombre',
  'Encre',
  'Shadow',
  'Jais',
  'Minuit',
  'Panthère',
  'Cendre',
] as const;

const WARM_NAMES = [
  'Moka',
  'Caramel',
  'Flamme',
  'Praline',
  'Biscuit',
  'Pêche',
  'Miel',
  'Roux',
] as const;

function namesForColor(color: string): readonly string[] {
  const c = color.toLowerCase();
  if (
    c.includes('noir') ||
    c.includes('charbon') ||
    c.includes('minuit') ||
    c.includes('ombre')
  ) {
    return DARK_NAMES;
  }
  if (c.includes('roux') || c.includes('orange') || c.includes('caramel')) {
    return WARM_NAMES;
  }
  return NAMES;
}

const TAG_SETS = [
  ['Ombre', 'Mystère', 'Discret'],
  ['Soleil', 'Curieux', 'Vif'],
  ['Velours', 'Doux', 'Câlin'],
  ['Éclair', 'Audacieux', 'Joueur'],
  ['Nuit', 'Furtif', 'Calme'],
  ['Miel', 'Gourmand', 'Affectueux'],
  ['Brume', 'Poète', 'Observateur'],
  ['Flamme', 'Têtu', 'Explorateur'],
] as const;

/** Stable positive int from any string (photo base64, color, etc.). */
export function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function pick<T>(items: readonly T[], seed: number, salt: number): T {
  return items[(seed + salt * 97) % items.length]!;
}

function buildDescription(
  name: string,
  color: string,
  breed: string,
  tags: string[],
): string {
  const vibe = tags[0]?.toLowerCase() ?? 'curieux';
  return `Un chat ${color.toLowerCase()} de type ${breed}, air ${vibe}. ${name} a été repéré dans le quartier — prêt à rejoindre ton CatDex.`;
}

/**
 * Varied mock analysis — always fills breed, color, traits and a cat name.
 * Same seed ⇒ same cat (stable for a given photo).
 */
export function generateCatAnalysis(seedInput: string): CatAnalysis {
  const seed = hashSeed(seedInput || String(Date.now()));
  const color = pick(COLORS, seed, 1);
  const breed = pick(BREEDS, seed, 2);
  const coat = pick(COATS, seed, 3);
  const eyes = pick(EYES, seed, 4);
  const size = pick(SIZES, seed, 5);
  const gender = pick(GENDERS, seed, 6);
  const suggestedName = pick(namesForColor(color), seed, 7);
  const tags = [...pick(TAG_SETS, seed, 8)];

  return {
    color,
    breed,
    coat,
    eyes,
    size,
    gender,
    tags,
    suggestedName,
    description: buildDescription(suggestedName, color, breed, tags),
  };
}

/**
 * Ensure analysis always has breed, color, random-feeling traits and a name.
 * Keeps AI-detected color/breed when present; fills gaps from the seed pool.
 * Does not invent a cat when Vision reported none.
 */
export function ensureCatIdentity(
  analysis: CatAnalysis,
  seedInput: string,
): CatAnalysis {
  const description = (analysis.description ?? '').toLowerCase();
  const breedRaw = (analysis.breed ?? '').toLowerCase();
  const noCat =
    analysis.notACat === true ||
    analysis.errorCode === 'NOT_A_CAT' ||
    description.includes('aucun chat') ||
    (breedRaw === 'inconnu' && !(analysis.suggestedName ?? '').trim());

  if (noCat) {
    return {
      ...analysis,
      color: analysis.color?.trim() || 'Indéterminée',
      breed: analysis.breed?.trim() || 'Inconnu',
      coat: analysis.coat?.trim() || 'Indéterminée',
      description:
        analysis.errorMessage?.trim() ||
        analysis.description?.trim() ||
        'Aucun chat clairement visible sur cette photo.',
      suggestedName: '',
      tags: [],
      notACat: true,
      errorCode: analysis.errorCode || 'NOT_A_CAT',
      errorTitle: analysis.errorTitle || 'Aucun chat détecté 🐾',
      errorMessage:
        analysis.errorMessage?.trim() ||
        analysis.description?.trim() ||
        'Cette photo ne semble pas contenir un chat. Essaie de prendre une photo plus nette d’un chat.',
    };
  }

  const generated = generateCatAnalysis(seedInput);
  const color =
    analysis.color?.trim() &&
    !/indétermin|inconnu|unknown|n\/a/i.test(analysis.color)
      ? analysis.color.trim()
      : generated.color;
  const breed =
    analysis.breed?.trim() &&
    !/indétermin|inconnu|unknown|n\/a/i.test(analysis.breed)
      ? analysis.breed.trim()
      : generated.breed;
  const coat =
    analysis.coat?.trim() && !/indétermin|inconnu/i.test(analysis.coat)
      ? analysis.coat.trim()
      : generated.coat;
  const suggestedName =
    analysis.suggestedName?.trim() ||
    pick(namesForColor(color), hashSeed(seedInput || color), 7);
  const tags =
    analysis.tags && analysis.tags.length > 0
      ? analysis.tags.slice(0, 8)
      : generated.tags;
  const gender = analysis.gender ?? generated.gender;
  const eyes = analysis.eyes?.trim() || generated.eyes;
  const size = analysis.size?.trim() || generated.size;
  const nextDescription =
    analysis.description?.trim() &&
    !/aucun chat clairement visible/i.test(analysis.description)
      ? analysis.description.trim()
      : buildDescription(suggestedName!, color, breed, tags ?? []);

  return {
    ...analysis,
    color,
    breed,
    coat,
    eyes,
    size,
    gender,
    tags,
    suggestedName,
    description: nextDescription,
  };
}

/** @deprecated Prefer generateCatAnalysis(seed) — kept for existing imports. */
export const OFFLINE_CAT_ANALYSIS: CatAnalysis = generateCatAnalysis('offline-default');
