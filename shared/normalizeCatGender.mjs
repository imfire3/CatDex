/**
 * Map Vision / UI gender labels to Supabase cats.gender CHECK values:
 * CHECK (gender IN ('male', 'female', 'unknown'))
 *
 * Check female before male — "female".includes("male") is true.
 */
export function normalizeCatGender(value) {
  const v = String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');

  if (!v) return 'unknown';
  if (
    v === 'f' ||
    v === 'female' ||
    v === 'femelle' ||
    v.includes('femelle') ||
    v.includes('female')
  ) {
    return 'female';
  }
  if (v === 'm' || v === 'male' || v.includes('male')) {
    return 'male';
  }
  return 'unknown';
}
