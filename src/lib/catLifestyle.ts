import type { Cat, CatLifestyle } from '@/types/cat';

export const CAT_LIFESTYLE_OPTIONS: Array<{
  value: CatLifestyle;
  label: string;
  hint: string;
}> = [
  {
    value: 'sauvage',
    label: 'Sauvage',
    hint: 'Chat de rue / libre — visible sur la carte',
  },
  {
    value: 'domestique',
    label: 'Domestique',
    hint: 'Animal de compagnie — uniquement dans ton CatDex',
  },
];

export function normalizeCatLifestyle(
  value: string | null | undefined,
): CatLifestyle {
  const raw = (value ?? '').trim().toLowerCase();
  if (raw === 'domestique' || raw === 'domestic' || raw === 'pet') {
    return 'domestique';
  }
  return 'sauvage';
}

/** Explorer map shows street cats only — pets stay private in CatDex. */
export function isCatVisibleOnMap(cat: Pick<Cat, 'lifestyle'>): boolean {
  return normalizeCatLifestyle(cat.lifestyle) === 'sauvage';
}
