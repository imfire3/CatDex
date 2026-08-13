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
  ].map((value) => value.toLowerCase()),
);

const COLOR_NAMES: Array<{ match: RegExp; names: string[] }> = [
  { match: /roux|orange|ginger|cannelle|auburn/, names: ['Paprika', 'Carotte', 'Flamby', 'Tikka', 'Curry'] },
  { match: /noir et blanc|black and white|bicolor/, names: ['Oreo', 'Domino', 'Yin', 'Piano', 'Cookie'] },
  { match: /calico|écaille|tricolore|calico/, names: ['Confetti', 'Arlequin', 'Patch', 'Harlequin', 'Mosaïque'] },
  { match: /noir|black|ébène|charbon/, names: ['Réglisse', 'Nuit', 'Pixel', 'Charbon', 'Eclipse'] },
  { match: /blanc|white|neige|crème|cream/, names: ['Meringue', 'Nuage', 'Mochi', 'Lait', 'Neige'] },
  { match: /gris|grey|gray|bleu|blue|cendre/, names: ['Brume', 'Grisou', 'Cendre', 'Souris', 'Nuageau'] },
  { match: /brun|brown|chocolat|noisette|fauve/, names: ['Choco', 'Noisette', 'Cookie', 'Moka', 'Biscuit'] },
  { match: /écaille de tortue|tortie/, names: ['Tortue', 'Marbre', 'Tache'] },
];

const PATTERN_NAMES: Array<{ match: RegExp; names: string[] }> = [
  { match: /tigr|tabby|rayure|striped/, names: ['Tigrou', 'Rayure', 'Zébrito', 'Moustache'] },
  { match: /tacheté|spotted|points|moucheté/, names: ['Confetti', 'Pois', 'Moustique'] },
  { match: /colourpoint|colorpoint|siamois/, names: ['Noodle', 'Siam', 'Masque'] },
  { match: /smoke|silver|argent/, names: ['Argent', 'Mirage', 'Chrome'] },
];

const BREED_NAMES: Array<{ match: RegExp; names: string[] }> = [
  { match: /persan/, names: ['Coussin', 'Soufflé', 'Shah'] },
  { match: /siamois|siamese/, names: ['Siam', 'Noodle', 'Banane'] },
  { match: /maine coon|mainecoon/, names: ['Boule', 'Lionceau', 'Mammouth'] },
  { match: /british|chartreux/, names: ['Lord', 'Pudding', 'Tweed'] },
  { match: /sacré de birmanie|birman/, names: ['Temple', 'Moka'] },
  { match: /bengal/, names: ['Léopard', 'Safari'] },
  { match: /ragdoll/, names: ['Peluche', 'Doudou'] },
  { match: /sphynx/, names: ['Velours', 'Nugget'] },
  { match: /abyssin/, names: ['Fennec', 'Safari'] },
  { match: /norvégien/, names: ['Fjord', 'Neigeux'] },
];

const POSE_NAMES: Array<{ match: RegExp; names: string[] }> = [
  { match: /assis|s'assoit|\bsit\b|calme|zen|pose/, names: ['Zen', 'Buddha', 'Pause'] },
  { match: /couch|allong|sleep|sieste|dodo|loaf|pain/, names: ['Sieste', 'Dodo', 'Canapé'] },
  { match: /curieux|espion|guette|sentinelle/, names: ['Radar', 'Espion', 'Sentinelle'] },
  { match: /joueur|play|bond|saute|turbo|chasse/, names: ['Turbo', 'Zigzag', 'Fusée'] },
  { match: /cache|hide|boite|box/, names: ['Ninja', 'Planqué', 'Boîte'] },
  { match: /toilett|leche|groom/, names: ['Glamour', 'Lèche'] },
  { match: /marche|walk|debout|stand|patrouille/, names: ['Patrouille', 'Flâneur'] },
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

function namesFor(haystack: string, table: Array<{ match: RegExp; names: string[] }>): string[] {
  const found: string[] = [];
  for (const row of table) {
    if (row.match.test(haystack)) found.push(...row.names);
  }
  return found;
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

export function isGenericCatName(name: string | undefined): boolean {
  const trimmed = name?.trim() ?? '';
  if (trimmed.length < 3 || trimmed.length > 22) return true;
  if (GENERIC_NAMES.has(trimmed.toLowerCase())) return true;
  return /^(chat|minou|kitty)\b/i.test(trimmed);
}

/** Funny 1–2 word CatDex nickname from coat, breed and pose. */
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
  const posePool = namesFor(pose, POSE_NAMES);

  const first =
    pick(coatPool, seed) ||
    pick(breedPool, seed + 3) ||
    pick(['Moustache', 'Patoune', 'Croquette', 'Miaouki', 'Boubou'], seed);

  const secondPool = [...posePool, ...breedPool.filter((name) => name !== first)];
  const second = pick(secondPool, seed + 11);

  if (second && second !== first) {
    const combo = `${first} ${second}`;
    if (combo.length <= 22) return combo;
  }
  return first;
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
