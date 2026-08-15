import type { CatAnalysis } from '@/types/cat';

import type { ClaimTarget } from '@/store/claimTarget';

/**
 * Build the CatDex analysis for a claimed community sighting.
 * MVP: trust the pin — no Vision re-check; keep the same traits + name.
 */
export function analysisForClaimedCat(target: ClaimTarget): CatAnalysis {
  const suggested =
    target.analysis.suggestedName?.trim() || target.name.trim() || undefined;
  return {
    ...target.analysis,
    suggestedName: suggested,
    description:
      target.analysis.description?.trim() ||
      `Tu as retrouvé ${target.name.trim() || 'ce chat'} dans le quartier.`,
  };
}

export function displayNameForClaim(target: ClaimTarget): string {
  return (
    target.analysis.suggestedName?.trim() ||
    target.name.trim() ||
    'Chat mystère'
  );
}
