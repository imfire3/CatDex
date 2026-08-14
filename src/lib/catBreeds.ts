/** Player-facing cat breed labels — aligned with server/src/breedPolicy.ts */
export const CAT_BREED_OPTIONS = [
  'Européen',
  'Chat domestique à poil court',
  'Chat domestique à poil long',
  'Maine Coon',
  'Siamois',
  'Persan',
  'British Shorthair',
  'Bengal',
  'Sphynx',
  'Ragdoll',
  'Norvégien',
  'Race inconnue',
] as const;

export type CatBreedLabel = (typeof CAT_BREED_OPTIONS)[number];

/** Keep a Vision/custom value in the list if it is not one of the canonical labels. */
export function catBreedOptionsForValue(current?: string | null): string[] {
  const trimmed = (current ?? '').trim();
  if (!trimmed) return [...CAT_BREED_OPTIONS];
  const known = CAT_BREED_OPTIONS.some(
    (label) => label.toLowerCase() === trimmed.toLowerCase(),
  );
  if (known) return [...CAT_BREED_OPTIONS];
  return [trimmed, ...CAT_BREED_OPTIONS];
}
