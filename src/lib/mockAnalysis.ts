import type { CatAnalysis, CatGender } from '@/types/cat';

const COLORS = [
  'Noir',
  'Roux',
  'Roux et blanc',
  'Gris',
  'Gris tigré',
  'Blanc',
  'Écaille de tortue',
  'Crème',
  'Noir et blanc',
] as const;

const BREEDS = [
  'Européen',
  'Chat domestique à poil court',
  'Siamois',
  'Maine Coon',
  'British Shorthair',
  'Bengal',
  'Ragdoll',
  'Norvégien',
] as const;

const COATS = ['Court', 'Mi-long', 'Long'] as const;
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
  'Ambre',
] as const;

const PALE_NAMES = [
  'Neige',
  'Nuage',
  'Perle',
  'Luna',
  'Coton',
  'Iris',
  'Suki',
  'Nori',
] as const;

const GREY_NAMES = [
  'Brume',
  'Argent',
  'Cendre',
  'Grisou',
  'Mistral',
  'Storm',
  'Graphite',
  'Fumée',
] as const;

const WARM_NAME_SET = new Set(WARM_NAMES.map((n) => n.toLowerCase()));
const DARK_NAME_SET = new Set(DARK_NAMES.map((n) => n.toLowerCase()));

const DARK_TAGS = ['Ombre', 'Mystère', 'Nuit', 'Furtif'] as const;
const WARM_TAGS = ['Soleil', 'Flamme', 'Miel', 'Vif'] as const;
const PALE_TAGS = ['Velours', 'Doux', 'Câlin', 'Poète'] as const;
const GREY_TAGS = ['Brume', 'Discret', 'Observateur', 'Calme'] as const;

function colorFamily(color: string): 'dark' | 'warm' | 'pale' | 'grey' | 'neutral' {
  const c = color.toLowerCase();
  if (
    c.includes('noir') ||
    c.includes('charbon') ||
    c.includes('minuit') ||
    c.includes('ombre') ||
    c.includes('ébène')
  ) {
    return 'dark';
  }
  if (
    c.includes('roux') ||
    c.includes('orange') ||
    c.includes('caramel') ||
    c.includes('cannelle') ||
    c.includes('fauve') ||
    c.includes('ginger')
  ) {
    return 'warm';
  }
  if (
    c.includes('blanc') ||
    c.includes('crème') ||
    c.includes('ivoire') ||
    c.includes('neige') ||
    c.includes('siamois')
  ) {
    return 'pale';
  }
  if (c.includes('gris') || c.includes('argent') || c.includes('bleu') || c.includes('chartreux')) {
    return 'grey';
  }
  return 'neutral';
}

/** Names that fit the coat color — used for AI gaps and mock data. */
export function namesForColor(color: string): readonly string[] {
  switch (colorFamily(color)) {
    case 'dark':
      return DARK_NAMES;
    case 'warm':
      return WARM_NAMES;
    case 'pale':
      return PALE_NAMES;
    case 'grey':
      return GREY_NAMES;
    default:
      return NAMES;
  }
}

function tagsForColor(color: string): readonly string[] {
  switch (colorFamily(color)) {
    case 'dark':
      return DARK_TAGS;
    case 'warm':
      return WARM_TAGS;
    case 'pale':
      return PALE_TAGS;
    case 'grey':
      return GREY_TAGS;
    default:
      return TAG_SETS[0]!;
  }
}

/** True when a suggested name clashes with coat color (e.g. Caramel on a black cat). */
export function nameFitsColor(name: string, color: string): boolean {
  const n = name.trim().toLowerCase();
  if (!n) return false;
  const family = colorFamily(color);
  if (family === 'dark' && WARM_NAME_SET.has(n)) return false;
  if (family === 'warm' && DARK_NAME_SET.has(n)) return false;
  if (family === 'pale' && DARK_NAME_SET.has(n)) return false;
  return true;
}

/** Pick a poetic name consistent with color (and optionally breed). */
export function suggestNameForAppearance(
  color: string,
  breed = '',
  seedInput = color,
): string {
  const seed = hashSeed(`${seedInput}:${color}:${breed}`);
  const pool = [...namesForColor(color)];
  const b = breed.toLowerCase();
  if (b.includes('bengal')) pool.unshift('Pixel', 'Ziggy', 'Tigrou');
  if (b.includes('persan') || b.includes('ragdoll')) pool.unshift('Velours', 'Nuage', 'Perle');
  if (b.includes('siamois')) pool.unshift('Suki', 'Nori', 'Iris');
  if (b.includes('maine') || b.includes('norvégien')) pool.unshift('Mistral', 'Storm', 'Gus');
  const unique = [...new Set(pool)];
  return pick(unique, seed, 7);
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
  return `Ce chat ${color.toLowerCase()} t'observe avec un air ${vibe.toLowerCase()}. ${name} est prêt·e à rejoindre ton CatDex.`;
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
  const suggestedName = suggestNameForAppearance(color, breed, seedInput || String(seed));
  const tags = [...tagsForColor(color)].slice(0, 3);

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
 * Pass-through for Vision analysis identity fields.
 * Never invents name / breed / color / coat / traits — capture form stays empty when unknown.
 * Does not invent a cat when Vision reported none.
 */
export function ensureCatIdentity(
  analysis: CatAnalysis,
  _seedInput = '',
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
      color: analysis.color?.trim() || '',
      breed: analysis.breed?.trim() || 'Inconnu',
      coat: analysis.coat?.trim() || '',
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

  return {
    ...analysis,
    color: analysis.color?.trim() ?? '',
    breed: analysis.breed?.trim() ?? '',
    coat: analysis.coat?.trim() ?? '',
    description: analysis.description?.trim() ?? '',
    suggestedName: analysis.suggestedName?.trim() ?? '',
    tags: analysis.tags?.filter(Boolean) ?? [],
  };
}

/** @deprecated Prefer generateCatAnalysis(seed) — kept for existing imports. */
export const OFFLINE_CAT_ANALYSIS: CatAnalysis = generateCatAnalysis('offline-default');
