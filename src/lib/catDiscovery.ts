import type { Cat } from '@/types/cat';

/** Whether a map pin belongs to the current user's CatDex or is still to discover. */
export type CatDiscoveryState = 'owned' | 'discoverable';

/**
 * Build the set of ids that identify cats already in the player's collection.
 * Includes local id, Supabase remoteId, and sourceWorldId (community sighting link).
 */
export function buildOwnedCatIdSet(ownedCats: readonly Cat[]): Set<string> {
  const ids = new Set<string>();
  for (const cat of ownedCats) {
    ids.add(cat.id);
    if (cat.remoteId) ids.add(cat.remoteId);
    if (cat.sourceWorldId) ids.add(cat.sourceWorldId);
  }
  return ids;
}

/**
 * Central discovery state for map markers / sheets.
 * Prefer this over scattering `owner_id` / id comparisons in UI components.
 *
 * Ownership = presence in the local CatDex (synced from `cats.owner_id = auth.uid`),
 * not a per-marker Supabase `owner_id` read. Community pins are already filtered
 * to other owners; once the player captures that sighting, its id lands in ownedIds.
 */
export function getCatDiscoveryState(
  cat: Pick<Cat, 'id' | 'remoteId'>,
  ownedIds: ReadonlySet<string>,
): CatDiscoveryState {
  if (ownedIds.has(cat.id)) return 'owned';
  if (cat.remoteId && ownedIds.has(cat.remoteId)) return 'owned';
  return 'discoverable';
}

export function isOwnedByCurrentUser(
  cat: Pick<Cat, 'id' | 'remoteId'>,
  ownedIds: ReadonlySet<string>,
): boolean {
  return getCatDiscoveryState(cat, ownedIds) === 'owned';
}
