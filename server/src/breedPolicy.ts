/**
 * Server-side breed policy: observe → validate → deduce.
 * Low confidence (< 60%) or unknown → "Race inconnue" — never invent Européen/Roux/etc.
 */

export type BreedKey =
  | 'european'
  | 'domestic_shorthair'
  | 'domestic_longhair'
  | 'maine_coon'
  | 'siamese'
  | 'persian'
  | 'british_shorthair'
  | 'bengal'
  | 'sphynx'
  | 'ragdoll'
  | 'norwegian_forest'
  | 'unknown';

export type MorphologySnapshot = {
  face_profile?: string | null;
  muzzle?: string | null;
  ear_size?: string | null;
  ear_shape?: string | null;
  confidence?: number | null;
};

export type CoatLengthKey = 'hairless' | 'short' | 'medium' | 'long' | 'unknown';

/** Precise breeds require ≥ 60% confidence + morphology where applicable. */
export const BREED_CONFIDENCE_MIN = 0.6;

const PRECISE_BREEDS = new Set<BreedKey>([
  'maine_coon',
  'siamese',
  'persian',
  'british_shorthair',
  'bengal',
  'sphynx',
  'ragdoll',
  'norwegian_forest',
]);

const BREED_LABEL_FR: Record<BreedKey, string> = {
  european: 'Européen',
  domestic_shorthair: 'Chat domestique à poil court',
  domestic_longhair: 'Chat domestique à poil long',
  maine_coon: 'Maine Coon',
  siamese: 'Siamois',
  persian: 'Persan',
  british_shorthair: 'British Shorthair',
  bengal: 'Bengal',
  sphynx: 'Sphynx',
  ragdoll: 'Ragdoll',
  norwegian_forest: 'Norvégien',
  unknown: 'Race inconnue',
};

export const RACE_INCONNUE = 'Race inconnue';

/** Map free-form / legacy labels to breed keys. */
export function parseBreedKey(raw?: string | null): BreedKey | null {
  if (!raw) return null;
  const v = raw.trim().toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
  if (
    !v ||
    v === 'unknown' ||
    v === 'indetermine' ||
    v === 'indeterminee' ||
    v.includes('inconnue') ||
    v === 'race inconnue'
  ) {
    return 'unknown';
  }
  if (v === 'european' || v.includes('europeen') || v.includes('european')) {
    return 'european';
  }
  if (
    v === 'domestic_shorthair' ||
    (v.includes('domestique') && v.includes('court')) ||
    v.includes('shorthair') ||
    v.includes('dsh')
  ) {
    return 'domestic_shorthair';
  }
  if (
    v === 'domestic_longhair' ||
    (v.includes('domestique') && v.includes('long')) ||
    v.includes('longhair') ||
    v.includes('dlh')
  ) {
    return 'domestic_longhair';
  }
  if (v.includes('maine') || v.includes('coon')) return 'maine_coon';
  if (v.includes('siamo') || v.includes('siamese')) return 'siamese';
  if (v.includes('persan') || v.includes('persian')) return 'persian';
  if (v.includes('british') || v.includes('chartreux')) return 'british_shorthair';
  if (v.includes('bengal')) return 'bengal';
  if (v.includes('sphynx') || v.includes('sphinx')) return 'sphynx';
  if (v.includes('ragdoll')) return 'ragdoll';
  if (v.includes('norveg') || v.includes('norwegian')) return 'norwegian_forest';
  if (v.includes('croise') || v.includes('mix')) return 'unknown';
  return null;
}

export function labelForBreedKey(key: BreedKey): string {
  return BREED_LABEL_FR[key];
}

function isFlat(value?: string | null): boolean {
  return (value ?? '').toLowerCase() === 'flat';
}

function persianMorphologyOk(morphology?: MorphologySnapshot | null): boolean {
  if (!morphology) return false;
  return isFlat(morphology.face_profile) && isFlat(morphology.muzzle);
}

function normalizeConfidence(raw?: number | null): number {
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return 0;
  return raw <= 1 ? raw : raw / 100;
}

/**
 * Resolve a player-facing breed.
 * Confidence < 60% or unknown → "Race inconnue" (never invent Européen).
 */
export function resolveBreed(input: {
  breedKey?: string | null;
  label?: string | null;
  confidence?: number | null;
  coatLength?: string | null;
  morphology?: MorphologySnapshot | null;
  visibleEvidence?: string[] | null;
}): { key: BreedKey; label: string; demoted: boolean; confidencePercent: number } {
  const fromKey = parseBreedKey(input.breedKey);
  const fromLabel = parseBreedKey(input.label);
  let key: BreedKey = fromKey ?? fromLabel ?? 'unknown';
  const confidence = normalizeConfidence(input.confidence);
  const confidencePercent = Math.round(confidence * 100);
  let demoted = false;

  if (confidence < BREED_CONFIDENCE_MIN) {
    return {
      key: 'unknown',
      label: RACE_INCONNUE,
      demoted: true,
      confidencePercent,
    };
  }

  if (PRECISE_BREEDS.has(key) && confidence < 0.8) {
    key = 'unknown';
    demoted = true;
  }

  if (key === 'persian' && !persianMorphologyOk(input.morphology)) {
    key = 'unknown';
    demoted = true;
  }

  if (key === 'sphynx' && (input.coatLength ?? '').toLowerCase() !== 'hairless') {
    key = 'unknown';
    demoted = true;
  }

  if (key === 'unknown') {
    return {
      key: 'unknown',
      label: RACE_INCONNUE,
      demoted: true,
      confidencePercent,
    };
  }

  return {
    key,
    label: labelForBreedKey(key),
    demoted,
    confidencePercent,
  };
}

/**
 * Keep Vision length when present; never invent "short" when unknown.
 */
export function resolveCoatLength(
  length?: string | null,
  _confidence?: number | null,
): CoatLengthKey {
  const raw = (length ?? 'unknown').toLowerCase().trim();
  const allowed: CoatLengthKey[] = ['hairless', 'short', 'medium', 'long', 'unknown'];
  if (allowed.includes(raw as CoatLengthKey)) return raw as CoatLengthKey;
  return 'unknown';
}
