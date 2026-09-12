import { resolveRevealRarity } from '@/lib/catTheme';
import { distanceMeters } from '@/lib/constants';
import { neighborhoodLabel } from '@/lib/geoLabels';
import type { SettingsPrefs } from '@/store/settingsPrefs';
import { useNotificationsStore } from '@/store/notifications';
import type { Cat } from '@/types/cat';

const STALE_MS = 4 * 24 * 60 * 60 * 1000;
const RARE_RADIUS_M = 200;

function lastSeenMs(cat: Cat): number {
  const raw = cat.lastSeenAt ?? cat.discoveredAt;
  const ts = Date.parse(raw);
  return Number.isFinite(ts) ? ts : 0;
}

/** Fire at most one missed-cat and one rare-nearby ping (store-level dedupe). */
export function emitUsefulNotifications(input: {
  owned: Cat[];
  discoverable: Cat[];
  user: { latitude: number; longitude: number } | null;
  prefs: SettingsPrefs;
}): void {
  const { owned, discoverable, user, prefs } = input;
  const store = useNotificationsStore.getState();

  if (prefs.notifMissions || prefs.notifDailyStreak) {
    const stale = [...owned]
      .filter((cat) => lastSeenMs(cat) > 0 && Date.now() - lastSeenMs(cat) >= STALE_MS)
      .sort((a, b) => lastSeenMs(a) - lastSeenMs(b))[0];
    if (stale) {
      store.pushMissedCat({
        catId: stale.id,
        catName: stale.name,
        neighborhood: neighborhoodLabel(stale.latitude, stale.longitude),
        latitude: stale.latitude,
        longitude: stale.longitude,
      });
    }
  }

  if (!prefs.notifRareCats || !user) return;

  const rareNearby = discoverable
    .map((cat) => {
      const rarity = resolveRevealRarity(cat.analysis, cat.number);
      const dist = distanceMeters(
        user.latitude,
        user.longitude,
        cat.latitude,
        cat.longitude,
      );
      return { cat, rarity, dist };
    })
    .filter(
      (row) =>
        (row.rarity === 'rare' || row.rarity === 'exceptional') &&
        row.dist <= RARE_RADIUS_M,
    )
    .sort((a, b) => a.dist - b.dist)[0];

  if (!rareNearby) return;

  store.pushRareNearby({
    catId: rareNearby.cat.id,
    catName: rareNearby.cat.name,
    distanceM: rareNearby.dist,
    latitude: rareNearby.cat.latitude,
    longitude: rareNearby.cat.longitude,
  });
}
