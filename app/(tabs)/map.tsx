import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { EnablePermissionModal } from '@/components/EnablePermissionModal';
import { CatMap } from '@/components/maps/CatMap';
import { LocationInactiveBanner } from '@/components/maps/LocationInactiveBanner';
import { MapCatModal } from '@/components/maps/MapCatModal';
import { MapExplorerHud } from '@/components/maps/MapExplorerHud';
import { useCaptureGate } from '@/hooks/useCaptureGate';
import { PARIS_20E } from '@/lib/constants';
import { pullCommunityCatsForMap } from '@/lib/catSync';
import {
  getCurrentLocationCoordinate,
  isLocationActive,
  openSystemLocationSettings,
  requestLocationAccess,
} from '@/lib/locationAccess';
import { PROXIMITY_ALERT_M, sortCatsByDistance } from '@/lib/mapExplore';
import { useCatsStore } from '@/store/cats';
import { useMapExploreStore } from '@/store/mapExplore';
import { useMissionsStore } from '@/store/missions';
import { useNotificationsStore } from '@/store/notifications';
import type { Cat } from '@/types/cat';

/**
 * Explorer — map + HUD (profile avatar, Missions / Capture / CatDex).
 * GPS & camera are gated by in-app modals (no silent OS prompts).
 */
export default function MapScreen() {
  const storedCats = useCatsStore((state) => state.cats);
  const setHasNearbyCat = useMapExploreStore((state) => state.setHasNearbyCat);
  const pushNearby = useNotificationsStore((state) => state.pushNearby);
  const missions = useMissionsStore((state) => state.missions);
  const openMissionCount = missions.filter((m) => !m.completed).length;
  const captureGate = useCaptureGate();

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
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [locationBusy, setLocationBusy] = useState(false);
  /** Start GPS watch only after the user accepted (or already granted). */
  const [watchEnabled, setWatchEnabled] = useState(false);

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

  const applyLocation = useCallback(
    async (coordinate: { latitude: number; longitude: number }) => {
      setUserCoordinate(coordinate);
      flyToCoordinate(coordinate);
      setWatchEnabled(true);
    },
    [flyToCoordinate],
  );

  /** First map entry after signup: in-app GPS modal, never a silent OS prompt. */
  useEffect(() => {
    let mounted = true;
    void (async () => {
      const active = await isLocationActive();
      if (!mounted) return;
      if (active) {
        const next = await getCurrentLocationCoordinate();
        if (next && mounted) await applyLocation(next);
        return;
      }
      setLocationModalVisible(true);
    })().catch(() => {
      if (mounted) setLocationModalVisible(true);
    });
    return () => {
      mounted = false;
    };
  }, [applyLocation]);

  useEffect(() => {
    if (!watchEnabled) return;

    let mounted = true;
    let subscription: Location.LocationSubscription | null = null;
    let webWatchId: number | null = null;

    (async () => {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
        webWatchId = navigator.geolocation.watchPosition(
          (position) => {
            if (!mounted) return;
            setUserCoordinate({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          () => undefined,
          { enableHighAccuracy: true, maximumAge: 10_000, timeout: 15_000 },
        );
        return;
      }

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
      if (webWatchId != null && typeof navigator !== 'undefined') {
        navigator.geolocation?.clearWatch(webWatchId);
      }
    };
  }, [watchEnabled]);

  useEffect(() => {
    if (!nearestForProximity || nearestForProximity.distanceM > PROXIMITY_ALERT_M) {
      setHasNearbyCat(false);
      return;
    }
    setHasNearbyCat(true);
    const { cat } = nearestForProximity;
    if (lastHapticCatRef.current !== cat.id) {
      lastHapticCatRef.current = cat.id;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      pushNearby({
        catId: cat.id,
        catName: cat.name,
        breed: cat.analysis?.breed,
      });
    }
  }, [nearestForProximity, pushNearby, setHasNearbyCat]);

  const handleLocationAuthorize = useCallback(async () => {
    setLocationBusy(true);
    try {
      const ok = await requestLocationAccess();
      if (ok) {
        const next = await getCurrentLocationCoordinate();
        setLocationModalVisible(false);
        if (next) await applyLocation(next);
        return;
      }
      if (Platform.OS !== 'web') {
        await openSystemLocationSettings();
      }
    } finally {
      setLocationBusy(false);
    }
  }, [applyLocation]);

  const recenterOnPlayer = async () => {
    // Instant camera feedback from last known GPS (works even if a fresh
    // geolocation read is slow or blocked).
    if (userCoordinate) {
      flyToCoordinate(userCoordinate);
    }

    const active = await isLocationActive();
    if (!active) {
      if (!userCoordinate) setLocationModalVisible(true);
      return;
    }

    try {
      const next = await getCurrentLocationCoordinate();
      if (next) {
        await applyLocation(next);
        return;
      }
    } catch {
      // fallback below
    }

    if (!userCoordinate) {
      flyToCoordinate({ ...PARIS_20E.center });
    }
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
          selectedCatId={selected?.id ?? null}
          onSelectCat={(item) => {
            setSelected(item);
            setSheetVisible(true);
          }}
        />
      </View>

      <LocationInactiveBanner
        onRequestEnable={() => setLocationModalVisible(true)}
      />

      <MapExplorerHud
        missionCount={openMissionCount}
        collectionCount={storedCats.length}
        captureHighlighted={Boolean(nearbyCatIds.length)}
        onRecenter={() => void recenterOnPlayer()}
        onCapturePress={() => {
          void captureGate.requestCapture();
        }}
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
          void captureGate.requestCapture({ worldId: sightingId });
        }}
      />

      <EnablePermissionModal
        visible={locationModalVisible}
        kind="location"
        title="Autorise le suivi GPS"
        description="CatDex utilise ta position pour placer les chats près de toi et te suivre pendant que tu explores. Tu peux refuser et l’activer plus tard."
        primaryLabel={locationBusy ? 'Ouverture…' : 'Autoriser le GPS'}
        onClose={() => setLocationModalVisible(false)}
        onRetry={() => {
          void handleLocationAuthorize();
        }}
        onOpenSettings={
          Platform.OS === 'web'
            ? undefined
            : () => {
                void openSystemLocationSettings();
              }
        }
        onDismissLabel="Plus tard"
        onDismiss={() => setLocationModalVisible(false)}
      />

      <EnablePermissionModal
        visible={captureGate.modalVisible}
        kind="camera"
        title="Autorise la caméra"
        description="Pour scanner et capturer les chats que tu croises dans ton quartier, CatDex a besoin d’accéder à ta caméra."
        primaryLabel="Autoriser la caméra"
        onClose={captureGate.dismiss}
        onRetry={() => {
          void captureGate.handleRetry();
        }}
        onOpenSettings={captureGate.openSettings}
        onDismissLabel="Plus tard"
        onDismiss={captureGate.dismiss}
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
