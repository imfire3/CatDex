import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { CatMap } from '@/components/maps/CatMap';
import { LocationInactiveBanner } from '@/components/maps/LocationInactiveBanner';
import { MapCatModal } from '@/components/maps/MapCatModal';
import { MapExplorerHud } from '@/components/maps/MapExplorerHud';
import { PARIS_20E } from '@/lib/constants';
import { pullCommunityCatsForMap } from '@/lib/catSync';
import { isLocationActive, requestLocationAccess } from '@/lib/locationAccess';
import { PROXIMITY_ALERT_M, sortCatsByDistance } from '@/lib/mapExplore';
import { useCatsStore } from '@/store/cats';
import { useMapExploreStore } from '@/store/mapExplore';
import { useMissionsStore } from '@/store/missions';
import type { Cat } from '@/types/cat';

/**
 * Explorer — map + HUD (profile avatar, Missions / Capture / CatDex).
 * No bottom tab bar · no filter stack.
 */
export default function MapScreen() {
  const storedCats = useCatsStore((state) => state.cats);
  const setHasNearbyCat = useMapExploreStore((state) => state.setHasNearbyCat);
  const missions = useMissionsStore((state) => state.missions);
  const openMissionCount = missions.filter((m) => !m.completed).length;

  const capturedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const cat of storedCats) {
      ids.add(cat.id);
      if (cat.sourceWorldId) ids.add(cat.sourceWorldId);
      if (cat.remoteId) ids.add(cat.remoteId);
    }
    return ids;
  }, [storedCats]);

  const [communityCats, setCommunityCats] = useState<Cat[]>([]);
  const [selected, setSelected] = useState<Cat | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [focusCoordinate, setFocusCoordinate] = useState<{
    latitude: number;
    longitude: number;
    nonce: number;
  } | null>(null);
  const [userCoordinate, setUserCoordinate] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const lastHapticCatRef = useRef<string | null>(null);

  const refreshCommunityCats = useCallback(async () => {
    const remote = await pullCommunityCatsForMap();
    setCommunityCats(remote);
  }, []);

  useEffect(() => {
    void refreshCommunityCats();
    const timer = setInterval(() => {
      void refreshCommunityCats();
    }, 60_000);
    return () => clearInterval(timer);
  }, [refreshCommunityCats, storedCats.length]);

  /**
   * Own CatDex pins (photo) + other players' sightings (mystery until you capture them).
   * Community pins disappear once you capture that same sighting id.
   */
  const mapCats = useMemo(() => {
    const byId = new Map<string, Cat>();

    for (const cat of communityCats) {
      if (capturedIds.has(cat.id) || (cat.remoteId && capturedIds.has(cat.remoteId))) {
        continue;
      }
      byId.set(cat.id, cat);
    }

    for (const cat of storedCats) {
      byId.set(cat.remoteId || cat.id, cat);
    }

    return [...byId.values()];
  }, [storedCats, communityCats, capturedIds]);

  const isOwnedCat = useCallback(
    (cat: Cat) =>
      capturedIds.has(cat.id) ||
      Boolean(cat.remoteId && capturedIds.has(cat.remoteId)) ||
      storedCats.some(
        (owned) => owned.id === cat.id || owned.remoteId === cat.id,
      ),
    [capturedIds, storedCats],
  );

  const selectedCaptured = selected ? isOwnedCat(selected) : false;

  const sortedCats = useMemo(
    () => sortCatsByDistance(mapCats, userCoordinate),
    [mapCats, userCoordinate],
  );

  const selectedDistance = useMemo(() => {
    if (!selected) return null;
    const match = sortedCats.find((item) => item.cat.id === selected.id);
    return match?.distanceM ?? null;
  }, [selected, sortedCats]);

  const nearestForProximity = sortedCats[0] ?? null;
  const nearbyCatIds = useMemo(
    () =>
      sortedCats
        .filter(({ distanceM }) => distanceM <= PROXIMITY_ALERT_M)
        .map(({ cat }) => cat.id),
    [sortedCats],
  );

  const refreshUserCoordinate = useCallback(async (opts?: { request?: boolean }) => {
    if (opts?.request) {
      const ok = await requestLocationAccess();
      if (!ok) return null;
    } else {
      const active = await isLocationActive();
      if (!active) return null;
    }
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    const next = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    setUserCoordinate(next);
    return next;
  }, []);

  /** Fly camera to a coordinate (always re-triggers, even if already centered). */
  const flyToCoordinate = useCallback(
    (coordinate: { latitude: number; longitude: number }) => {
      setFocusCoordinate((prev) => ({
        ...coordinate,
        nonce: (prev?.nonce ?? 0) + 1,
      }));
    },
    [],
  );

  useEffect(() => {
    let mounted = true;
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const next = await refreshUserCoordinate({ request: true });
      if (!next || !mounted) return;
      flyToCoordinate(next);

      const active = await isLocationActive();
      if (!active || !mounted) return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1200,
          distanceInterval: 8,
        },
        (position) => {
          if (!mounted) return;
          setUserCoordinate({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
      );
    })().catch(() => undefined);

    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, [flyToCoordinate, refreshUserCoordinate]);

  useEffect(() => {
    if (!nearestForProximity || nearestForProximity.distanceM > PROXIMITY_ALERT_M) {
      setHasNearbyCat(false);
      return;
    }
    setHasNearbyCat(true);
    if (lastHapticCatRef.current !== nearestForProximity.cat.id) {
      lastHapticCatRef.current = nearestForProximity.cat.id;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [nearestForProximity, setHasNearbyCat]);

  const recenterOnPlayer = async () => {
    try {
      const next = await refreshUserCoordinate({ request: true });
      if (next) {
        flyToCoordinate(next);
        return;
      }
    } catch {
      // fallback below
    }
    flyToCoordinate({ ...PARIS_20E.center });
  };

  const mapCatList = useMemo(
    () => sortedCats.map(({ cat }) => cat),
    [sortedCats],
  );
  const capturedCatIdList = useMemo(() => [...capturedIds], [capturedIds]);

  return (
    <View style={styles.root}>
      <View style={StyleSheet.absoluteFill}>
        <CatMap
          cats={mapCatList}
          scheme="light"
          focusCoordinate={
            focusCoordinate
              ? {
                  latitude: focusCoordinate.latitude,
                  longitude: focusCoordinate.longitude,
                }
              : null
          }
          focusNonce={focusCoordinate?.nonce}
          userCoordinate={userCoordinate}
          nearbyCatIds={nearbyCatIds}
          capturedCatIds={capturedCatIdList}
          onSelectCat={(item) => {
            setSelected(item);
            setSheetVisible(true);
          }}
        />
      </View>

      <LocationInactiveBanner
        onActivated={() => {
          void refreshUserCoordinate({ request: true }).then((next) => {
            if (!next) return;
            flyToCoordinate(next);
          });
        }}
      />

      <MapExplorerHud
        missionCount={openMissionCount}
        collectionCount={storedCats.length}
        captureHighlighted={Boolean(nearbyCatIds.length)}
        onRecenter={() => void recenterOnPlayer()}
      />

      <MapCatModal
        visible={sheetVisible}
        cat={selected}
        captured={selectedCaptured}
        distanceM={selectedDistance}
        onClose={() => {
          setSheetVisible(false);
          setSelected(null);
        }}
        onViewCard={() => {
          if (!selected) return;
          setSheetVisible(false);
          router.push({ pathname: '/cat/[id]', params: { id: selected.id } });
        }}
        onGoThere={() => {
          if (!selected) return;
          flyToCoordinate({
            latitude: selected.latitude,
            longitude: selected.longitude,
          });
          setSheetVisible(false);
          setSelected(null);
        }}
        onCapture={() => {
          if (!selected) return;
          const sightingId = selected.id;
          setSheetVisible(false);
          setSelected(null);
          router.push({
            pathname: '/scanner',
            params: { worldId: sightingId },
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
