/**
 * Server-side breed policy: observe → validate → deduce.
 * Demotes invented / low-confidence breeds to a credible domestic label.
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
  unknown: 'Européen',
};

/** Map free-form / legacy labels to breed keys. */
export function parseBreedKey(raw?: string | null): BreedKey | null {
  if (!raw) return null;
  const v = raw.trim().toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
  if (!v || v === 'unknown' || v === 'indetermine' || v === 'indéterminée') {
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
  if (v.includes('croise') || v.includes('mix')) return 'european';
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

function domesticFromLength(length?: CoatLengthKey | string | null): BreedKey {
  const len = (length ?? 'unknown').toLowerCase();
  if (len === 'long' || len === 'medium') return 'domestic_longhair';
  if (len === 'hairless') return 'sphynx';
  return 'domestic_shorthair';
}

/**
 * Resolve a player-facing breed after confidence + morphology gates.
 */
export function resolveBreed(input: {
  breedKey?: string | null;
  label?: string | null;
  confidence?: number | null;
  coatLength?: string | null;
  morphology?: MorphologySnapshot | null;
  visibleEvidence?: string[] | null;
}): { key: BreedKey; label: string; demoted: boolean } {
  const fromKey = parseBreedKey(input.breedKey);
  const fromLabel = parseBreedKey(input.label);
  let key: BreedKey = fromKey ?? fromLabel ?? 'european';

  const confidence =
    typeof input.confidence === 'number' && Number.isFinite(input.confidence)
      ? input.confidence <= 1
        ? input.confidence
        : input.confidence / 100
      : 0;

  let demoted = false;

  // Low confidence → never keep a precise breed.
  if (PRECISE_BREEDS.has(key) && confidence < 0.8) {
    key = domesticFromLength(input.coatLength);
    if (key === 'domestic_shorthair' || key === 'domestic_longhair') {
      // Prefer Européen for MVP readability when short coat.
      key = key === 'domestic_longhair' ? 'domestic_longhair' : 'european';
    }
    demoted = true;
  }

  // Persian without flat face/muzzle → domestic.
  if (key === 'persian' && !persianMorphologyOk(input.morphology)) {
    key = (input.coatLength ?? '').toLowerCase() === 'long'
      ? 'domestic_longhair'
      : 'european';
    demoted = true;
  }

  // Sphynx without hairless coat → demote.
  if (key === 'sphynx' && (input.coatLength ?? '').toLowerCase() !== 'hairless') {
    key = 'european';
    demoted = true;
  }

  // Unknown / empty → european (MVP default).
  if (key === 'unknown') {
    key = (input.coatLength ?? '').toLowerCase() === 'long'
      ? 'domestic_longhair'
      : 'european';
    demoted = true;
  }

  return { key, label: labelForBreedKey(key), demoted };
}

/**
 * Prefer short coat when uncertain — medium is over-used by Vision models.
 */
export function resolveCoatLength(
  length?: string | null,
  confidence?: number | null,
): CoatLengthKey {
  const raw = (length ?? 'unknown').toLowerCase().trim();
  const allowed: CoatLengthKey[] = ['hairless', 'short', 'medium', 'long', 'unknown'];
  const key = (allowed.includes(raw as CoatLengthKey) ? raw : 'unknown') as CoatLengthKey;

  const conf =
    typeof confidence === 'number' && Number.isFinite(confidence)
      ? confidence <= 1
        ? confidence
        : confidence / 100
      : 0.5;

  if (key === 'unknown') return 'short';
  if (key === 'medium' && conf < 0.75) return 'short';
  return key;
}
