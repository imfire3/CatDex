import type { CatAnalysis } from '../types/cat';

const GENERIC_NAMES = new Set(
  [
    '',
    'chat',
    'minou',
    'minet',
    'chaton',
    'felix',
    'félix',
    'garfield',
    'ombre',
    'roux',
    'noir',
    'blanc',
    'gris',
    'miaou',
    'cat',
    'kitty',
    'unknown',
    'inconnu',
    'grisou',
    'tigrou',
    'neige',
    'cendre',
    'mistigri',
    'minette',
    'ronron',
    'patoune',
    'moustache',
  ].map((value) => value.toLowerCase()),
);

const PLAIN_COLOR = /^(roux|noir|blanc|gris|ombre|neige|cendre|tigré|tigre)$/i;

/** "Noir Escalade", "Roux Balcon", "Brume Radar" — color/plain + literal noun. */
const BORING_TWO_WORD =
  /^(roux|noir|blanc|gris|ombre|neige|cendre|brume|oreo|tigrou|grisou|meringue|velours|nuit|pixel)\s+\S+/i;

/** Coined creature-style first halves (Pokémon vibes). */
const COLOR_NAMES: Array<{ match: RegExp; names: string[] }> = [
  {
    match: /roux|orange|ginger|cannelle|auburn|flamme/,
    names: ['Flambyx', 'Papriko', 'Tikkax', 'Curryon', 'Braizor'],
  },
  {
    match: /noir et blanc|black and white|bicolor|tuxedo/,
    names: ['Oreon', 'Domix', 'Pianor', 'Yinette', 'Cookix'],
  },
  {
    match: /calico|écaille|tricolore|tortie|tortue/,
    names: ['Patchou', 'Confetix', 'Marblor', 'Harleki', 'Mosai'],
  },
  {
    match: /noir|black|ébène|charbon/,
    names: ['Noctix', 'Obsidu', 'Éclipsor', 'Charbox', 'Nyxor'],
  },
  {
    match: /blanc|white|neige|crème|cream/,
    names: ['Mochix', 'Nubis', 'Merinja', 'Laitor', 'Crémix'],
  },
  {
    match: /gris|grey|gray|bleu|blue|argent|silver/,
    names: ['Brumix', 'Cendrax', 'Miragor', 'Chromix', 'Nimbou'],
  },
  {
    match: /brun|brown|chocolat|noisette|fauve|café/,
    names: ['Mokax', 'Biscuiton', 'Chocoro', 'Noisetix', 'Caféki'],
  },
];

const PATTERN_NAMES: Array<{ match: RegExp; names: string[] }> = [
  {
    match: /tigr|tabby|rayure|striped/,
    names: ['Stripion', 'Zigrou', 'Rayurix', 'Tigrax', 'Bandor'],
  },
  {
    match: /tacheté|spotted|points|moucheté/,
    names: ['Poixon', 'Confetix', 'Spotix'],
  },
  {
    match: /colourpoint|colorpoint|siamois/,
    names: ['Noodlix', 'Siamor', 'Masquix'],
  },
  {
    match: /smoke|silver|argent/,
    names: ['Argentor', 'Miragor', 'Chromix'],
  },
];

const BREED_NAMES: Array<{ match: RegExp; names: string[] }> = [
  { match: /persan/, names: ['Soufflix', 'Peluchor', 'Shahki'] },
  { match: /siamois|siamese/, names: ['Noodlix', 'Siamor', 'Banari'] },
  { match: /maine coon|mainecoon/, names: ['Coonax', 'Mammor', 'Lionix'] },
  { match: /british|chartreux/, names: ['Puddix', 'Tweedor', 'Lordix'] },
  { match: /sacré de birmanie|birman/, names: ['Templor', 'Birmix'] },
  { match: /bengal/, names: ['Safaror', 'Léopor'] },
  { match: /ragdoll/, names: ['Doudor', 'Peluchix'] },
  { match: /sphynx/, names: ['Nuggix', 'Velurix'] },
  { match: /abyssin/, names: ['Fennix', 'Safaror'] },
  { match: /norvégien/, names: ['Fjordix', 'Nordor'] },
];

const VIBE_SUFFIXES = ['ix', 'or', 'chu', 'ette', 'ax', 'ou', 'ki', 'on'];

const VIBE_ROOTS = [
  'Spar',
  'Volt',
  'Mist',
  'Puff',
  'Zap',
  'Glow',
  'Prowl',
  'Dash',
  'Soft',
  'Bold',
];

function normalize(value: string | undefined): string {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function pick(list: string[], seed: number): string {
  if (list.length === 0) return '';
  return list[Math.abs(seed) % list.length] ?? list[0]!;
}

function hashSeed(parts: string[]): number {
  const text = parts.join('|');
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

function firstNamesFor(
  haystack: string,
  table: Array<{ match: RegExp; names: string[] }>,
): string[] {
  for (const row of table) {
    if (row.match.test(haystack)) return row.names;
  }
  return [];
}

function namesFor(haystack: string, table: Array<{ match: RegExp; names: string[] }>): string[] {
  const found: string[] = [];
  for (const row of table) {
    if (row.match.test(haystack)) found.push(...row.names);
  }
  return found;
}

function coinedFallback(seed: number): string {
  const root = pick(VIBE_ROOTS, seed);
  const suffix = pick(VIBE_SUFFIXES, seed + 7);
  return `${root}${suffix}`;
}

export function isGenericCatName(name: string | undefined): boolean {
  const trimmed = name?.trim() ?? '';
  if (trimmed.length < 3 || trimmed.length > 18) return true;
  const lower = trimmed.toLowerCase();
  if (GENERIC_NAMES.has(lower)) return true;
  if (PLAIN_COLOR.test(trimmed)) return true;
  if (BORING_TWO_WORD.test(trimmed)) return true;
  if (/\s/.test(trimmed)) return true;
  return /^(chat|minou|kitty|noir|roux|blanc|gris)\b/i.test(trimmed);
}

/** Pokémon-style coined CatDex nickname from coat, breed and vibe. */
export function funnyCatName(analysis: Pick<
  CatAnalysis,
  'color' | 'breed' | 'coat' | 'coatPattern' | 'tags' | 'distinctiveFeatures' | 'description' | 'habitat'
>): string {
  const color = normalize(analysis.color);
  const breed = normalize(analysis.breed);
  const pattern = normalize(analysis.coatPattern);
  const pose = normalize(
    [
      ...(analysis.tags ?? []),
      ...(analysis.distinctiveFeatures ?? []),
      analysis.description ?? '',
      analysis.habitat ?? '',
    ].join(' '),
  );
  const seed = hashSeed([color, breed, pattern, pose.slice(0, 120)]);

  const coatPool = [
    ...firstNamesFor(color, COLOR_NAMES),
    ...firstNamesFor(`${color} ${pattern}`, COLOR_NAMES),
    ...firstNamesFor(pattern, PATTERN_NAMES),
  ];
  const breedPool = namesFor(breed, BREED_NAMES);
  const name =
    pick(coatPool, seed) ||
    pick(breedPool, seed + 3) ||
    coinedFallback(seed);

  return name.slice(0, 14);
}

export function withFunnyCatName(analysis: CatAnalysis): CatAnalysis {
  if (analysis.notACat) return analysis;
  const current = analysis.suggestedName?.trim() ?? '';
  const sameAsColor =
    Boolean(current) && normalize(current) === normalize(analysis.color);
  if (!isGenericCatName(current) && !sameAsColor) {
    return analysis;
  }
  return {
    ...analysis,
    suggestedName: funnyCatName(analysis),
  };
}
