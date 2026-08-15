import type { Cat, CatLifestyle } from '@/types/cat';

export const CAT_LIFESTYLE_OPTIONS: Array<{
  value: CatLifestyle;
  label: string;
  hint: string;
}> = [
  {
    value: 'sauvage',
    label: 'Chat de rue',
    hint: 'Croisé dehors (rue, bar, square…) — visible sur la carte pour les autres',
  },
  {
    value: 'domestique',
    label: 'Chat domestique',
    hint: 'Animal de compagnie — caché de la carte pour éviter vol ou harcèlement',
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
