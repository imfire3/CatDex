import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { EnablePermissionModal } from '@/components/EnablePermissionModal';
import { CatMap } from '@/components/maps/CatMap';
import { LocationInactiveBanner } from '@/components/maps/LocationInactiveBanner';
import { MapCatModal } from '@/components/maps/MapCatModal';
import { MapDiscoveryLegend } from '@/components/maps/MapDiscoveryLegend';
import { MapDiscoveryTip } from '@/components/maps/MapDiscoveryTip';
import { MapExplorerHud } from '@/components/maps/MapExplorerHud';
import { useCaptureGate } from '@/hooks/useCaptureGate';
import {
  buildOwnedCatIdSet,
  getCatDiscoveryState,
} from '@/lib/catDiscovery';
import { isCatVisibleOnMap } from '@/lib/catLifestyle';
import { PARIS_20E, distanceMeters } from '@/lib/constants';
import { pullCommunityCatsForMap } from '@/lib/catSync';
import {
  DEMO_COMMUNITY_CATS,
  DEMO_OWNED_CATS,
  isMapDemoEnabled,
  mergeCatsById,
} from '@/lib/demoCats';
import {
  getCurrentLocationCoordinate,
  isLocationActive,
  openSystemLocationSettings,
  requestLocationAccess,
  requestWebCompassPermission,
} from '@/lib/locationAccess';
import {
  dismissMapDiscoveryTip,
  hasDismissedMapDiscoveryTip,
} from '@/lib/mapDiscoveryTip';
import {
  headingFromDeviceOrientation,
  resolveDeviceHeading,
  shouldUpdateHeading,
  webCompassNeedsUserGesture,
} from '@/lib/mapHeading';
import { PROXIMITY_ALERT_M, sortCatsByDistance } from '@/lib/mapExplore';
import { useAuthStore } from '@/store/auth';
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
  const mapDemo = isMapDemoEnabled();
  const storedCats = useCatsStore((state) => state.cats);
  const userId = useAuthStore((state) => state.user?.id);
  const setHasNearbyCat = useMapExploreStore((state) => state.setHasNearbyCat);
  const pendingFocus = useMapExploreStore((state) => state.pendingFocus);
  const consumePendingFocus = useMapExploreStore(
    (state) => state.consumePendingFocus,
  );
  const pushNearby = useNotificationsStore((state) => state.pushNearby);
  const missions = useMissionsStore((state) => state.missions);
  const openMissionCount = missions.filter((m) => !m.completed).length;
  const captureGate = useCaptureGate();

  /** Local CatDex + optional __DEV__ fake owned pins for discovery UI trials. */
  const ownedCats = useMemo(
    () => (mapDemo ? mergeCatsById(storedCats, DEMO_OWNED_CATS) : storedCats),
    [mapDemo, storedCats],
  );
  const ownedIds = useMemo(() => buildOwnedCatIdSet(ownedCats), [ownedCats]);

  const [communityCats, setCommunityCats] = useState<Cat[]>([]);
  const [selected, setSelected] = useState<Cat | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [discoveryTipVisible, setDiscoveryTipVisible] = useState(false);
  const [focusCoordinate, setFocusCoordinate] = useState<{
    latitude: number;
    longitude: number;
    nonce: number;
  } | null>(null);
  const [resetViewNonce, setResetViewNonce] = useState(0);
  const [userCoordinate, setUserCoordinate] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  /** Compass heading in degrees (0 = north). Drives heading-up follow. */
  const [userHeading, setUserHeading] = useState<number | null>(null);
  /**
   * Bumped after a user-gesture compass unlock (iOS Safari).
   * Re-attaches orientation listeners once permission is actually granted.
   */
  const [compassEpoch, setCompassEpoch] = useState(0);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [locationBusy, setLocationBusy] = useState(false);
  /** Start GPS watch only after the user accepted (or already granted). */
  const [watchEnabled, setWatchEnabled] = useState(false);
  /** GPS follow — paused while looking at a cat in another region. */
  const [followUser, setFollowUser] = useState(true);
  /** Walk-follow + player-pin heading. Active = camera follows you (Pokémon-style). */
  const [compassMode, setCompassMode] = useState(true);

  const lastHapticCatRef = useRef<string | null>(null);
  /** Cat id to select once map pins finish loading (notification deep-link). */
  const pendingSelectCatIdRef = useRef<string | null>(null);
  /** Last GPS point used to refresh community pins while walking. */
  const lastCommunityPullRef = useRef<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const refreshCommunityCats = useCallback(async () => {
    const remote = await pullCommunityCatsForMap();
    setCommunityCats(
      mapDemo ? mergeCatsById(remote, DEMO_COMMUNITY_CATS) : remote,
    );
  }, [mapDemo]);

  useEffect(() => {
    void refreshCommunityCats();
    const timer = setInterval(() => {
      void refreshCommunityCats();
    }, 60_000);
    return () => clearInterval(timer);
  }, [refreshCommunityCats, storedCats.length]);

  /** While walking, refresh nearby pins every ~50 m so new cats appear like Pokémon Go. */
  useEffect(() => {
    if (!userCoordinate) return;
    const prev = lastCommunityPullRef.current;
    if (!prev) {
      lastCommunityPullRef.current = userCoordinate;
      return;
    }
    const moved = distanceMeters(
      prev.latitude,
      prev.longitude,
      userCoordinate.latitude,
      userCoordinate.longitude,
    );
    if (moved < 50) return;
    lastCommunityPullRef.current = userCoordinate;
    void refreshCommunityCats();
  }, [userCoordinate, refreshCommunityCats]);

  /** Dev demo: anchor near Paris 20e so fake pins + nearby pulse are visible. */
  useEffect(() => {
    if (!mapDemo) return;
    setUserCoordinate((prev) => prev ?? { ...PARIS_20E.center });
    setFocusCoordinate((prev) =>
      prev ?? {
        ...PARIS_20E.center,
        nonce: 1,
      },
    );
  }, [mapDemo]);

  /**
   * Own CatDex pins (photo) + other players' sightings (mystery until you capture them).
   * Community pins disappear once you capture that same sighting id.
   */
  const mapCats = useMemo(() => {
    const byId = new Map<string, Cat>();

    for (const cat of communityCats) {
      if (!isCatVisibleOnMap(cat)) continue;
      if (getCatDiscoveryState(cat, ownedIds) === 'owned') {
        continue;
      }
      byId.set(cat.id, cat);
    }

    for (const cat of ownedCats) {
      if (!isCatVisibleOnMap(cat)) continue;
      byId.set(cat.remoteId || cat.id, cat);
    }

    return [...byId.values()];
  }, [ownedCats, communityCats, ownedIds]);

  const selectedDiscoveryState = selected
    ? getCatDiscoveryState(selected, ownedIds)
    : null;

  const hasDiscoverableOnMap = useMemo(
    () =>
      mapCats.some((cat) => getCatDiscoveryState(cat, ownedIds) === 'discoverable'),
    [mapCats, ownedIds],
  );

  useEffect(() => {
    let mounted = true;
    void (async () => {
      // Tip only when the real CatDex is empty (skip when __DEV__ fake owned are on the map).
      if (
        mapDemo ||
        storedCats.length > 0 ||
        !hasDiscoverableOnMap ||
        !userId
      ) {
        if (mounted) setDiscoveryTipVisible(false);
        return;
      }
      const dismissed = await hasDismissedMapDiscoveryTip(userId);
      if (mounted) setDiscoveryTipVisible(!dismissed);
    })();
    return () => {
      mounted = false;
    };
  }, [mapDemo, storedCats.length, hasDiscoverableOnMap, userId]);

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
      setFollowUser(true);
      flyToCoordinate(coordinate);
      setWatchEnabled(true);
    },
    [flyToCoordinate],
  );

  /**
   * iOS Safari: DeviceOrientationEvent.requestPermission() must start inside
   * the tap handler (before any await), then listeners attach after grant.
   */
  const unlockWebCompassFromGesture = useCallback(() => {
    if (Platform.OS !== 'web') return;
    void requestWebCompassPermission().then((granted) => {
      if (granted) {
        setCompassEpoch((value) => value + 1);
        setWatchEnabled(true);
      }
    });
  }, []);

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
            const course = position.coords.heading;
            if (
              typeof course === 'number' &&
              Number.isFinite(course) &&
              course >= 0
            ) {
              setUserHeading((prev) =>
                shouldUpdateHeading(prev, course) ? course : prev,
              );
            }
          },
          () => undefined,
          { enableHighAccuracy: true, maximumAge: 1_000, timeout: 10_000 },
        );
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 800,
          distanceInterval: 2,
          mayShowUserSettingsDialog: true,
        },
        (position) => {
          if (!mounted) return;
          setUserCoordinate({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          const course = position.coords.heading;
          if (
            typeof course === 'number' &&
            Number.isFinite(course) &&
            course >= 0
          ) {
            setUserHeading((prev) =>
              shouldUpdateHeading(prev, course) ? course : prev,
            );
          }
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

  /** Compass — updates the player-pin facing while walking. */
  useEffect(() => {
    if (!watchEnabled || !compassMode) return;

    let mounted = true;
    let subscription: Location.LocationSubscription | null = null;
    let orientationHandler: ((event: Event) => void) | null = null;

    const applyHeading = (next: number) => {
      if (!mounted) return;
      setUserHeading((prev) => (shouldUpdateHeading(prev, next) ? next : prev));
    };

    (async () => {
      if (Platform.OS === 'web') {
        if (typeof window === 'undefined') return;

        // iOS: wait until a tap unlocked motion; otherwise events never arrive.
        if (webCompassNeedsUserGesture() && compassEpoch === 0) {
          return;
        }

        orientationHandler = (event: Event) => {
          const orientation = event as Event & {
            alpha: number | null;
            absolute?: boolean;
            webkitCompassHeading?: number;
          };
          const next = headingFromDeviceOrientation(orientation);
          if (next != null) applyHeading(next);
        };

        // iOS uses deviceorientation + webkitCompassHeading; Android prefers absolute.
        const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
        const isAppleMobile = /iPad|iPhone|iPod/.test(ua);
        if (isAppleMobile) {
          window.addEventListener('deviceorientation', orientationHandler, true);
        } else {
          window.addEventListener(
            'deviceorientationabsolute',
            orientationHandler,
            true,
          );
          window.addEventListener('deviceorientation', orientationHandler, true);
        }
        return;
      }

      subscription = await Location.watchHeadingAsync((sample) => {
        const next = resolveDeviceHeading(sample);
        if (next != null) applyHeading(next);
      });
    })().catch(() => undefined);

    return () => {
      mounted = false;
      subscription?.remove();
      if (orientationHandler && typeof window !== 'undefined') {
        window.removeEventListener(
          'deviceorientationabsolute',
          orientationHandler,
          true,
        );
        window.removeEventListener('deviceorientation', orientationHandler, true);
      }
    };
  }, [watchEnabled, compassEpoch, compassMode]);

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
        latitude: cat.latitude,
        longitude: cat.longitude,
      });
    }
  }, [nearestForProximity, pushNearby, setHasNearbyCat]);

  /** Open a cat from a notification — fly to its GPS pin and show the card. */
  useEffect(() => {
    if (!pendingFocus) return;
    const focus = consumePendingFocus();
    if (!focus) return;

    setFollowUser(false);
    setCompassMode(false);
    flyToCoordinate({
      latitude: focus.latitude,
      longitude: focus.longitude,
    });

    const match =
      mapCats.find(
        (cat) => cat.id === focus.catId || cat.remoteId === focus.catId,
      ) ?? null;
    if (match) {
      pendingSelectCatIdRef.current = null;
      setSelected(match);
      setSheetVisible(true);
      return;
    }
    pendingSelectCatIdRef.current = focus.catId;
  }, [pendingFocus, consumePendingFocus, flyToCoordinate, mapCats]);

  useEffect(() => {
    const pendingId = pendingSelectCatIdRef.current;
    if (!pendingId) return;
    const match =
      mapCats.find((cat) => cat.id === pendingId || cat.remoteId === pendingId) ??
      null;
    if (!match) return;
    pendingSelectCatIdRef.current = null;
    setSelected(match);
    setSheetVisible(true);
  }, [mapCats]);

  const handleLocationAuthorize = useCallback(async () => {
    // May also unlock motion on iOS when the user accepts GPS from the modal.
    unlockWebCompassFromGesture();
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
  }, [applyLocation, unlockWebCompassFromGesture]);

  const recenterOnPlayer = async () => {
    setFollowUser(true);
    setWatchEnabled(true);
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

  /** Double-tap recenter — default zoom + pitch on the player. */
  const resetMainView = () => {
    setFollowUser(true);
    setWatchEnabled(true);
    setResetViewNonce((value) => value + 1);
    if (userCoordinate) {
      flyToCoordinate(userCoordinate);
    }
  };

  /** Toggle walk-follow. Active = camera follows GPS and rotates with the compass. */
  const handleCompassPress = () => {
    // Must run in the same tap — iOS Safari DeviceOrientation.requestPermission().
    unlockWebCompassFromGesture();

    if (compassMode) {
      setCompassMode(false);
      setFollowUser(false);
      return;
    }

    setCompassMode(true);
    setFollowUser(true);
    setWatchEnabled(true);
    setCompassEpoch((value) => value + 1);
    if (userCoordinate) {
      flyToCoordinate(userCoordinate);
      return;
    }
    void isLocationActive().then((active) => {
      if (!active) setLocationModalVisible(true);
    });
  };

  const mapCatList = useMemo(
    () => sortedCats.map(({ cat }) => cat),
    [sortedCats],
  );
  const ownedCatIdList = useMemo(() => [...ownedIds], [ownedIds]);
  const mapFocusCoordinate = useMemo(
    () =>
      focusCoordinate
        ? {
            latitude: focusCoordinate.latitude,
            longitude: focusCoordinate.longitude,
          }
        : null,
    [focusCoordinate?.latitude, focusCoordinate?.longitude],
  );

  const handleDismissDiscoveryTip = useCallback(() => {
    setDiscoveryTipVisible(false);
    void dismissMapDiscoveryTip(userId);
  }, [userId]);

  return (
    <View style={styles.root}>
      <View style={StyleSheet.absoluteFill}>
        <CatMap
          cats={mapCatList}
          scheme="light"
          focusCoordinate={mapFocusCoordinate}
          focusNonce={focusCoordinate?.nonce}
          resetViewNonce={resetViewNonce}
          userCoordinate={userCoordinate}
          userHeading={compassMode ? (userHeading ?? 0) : null}
          nearbyCatIds={nearbyCatIds}
          capturedCatIds={ownedCatIdList}
          selectedCatId={selected?.id ?? null}
          followUser={followUser}
          onBreakFollow={() => {
            setFollowUser(false);
            setCompassMode(false);
          }}
          onSelectCat={(item) => {
            setSelected(item);
            setSheetVisible(true);
            setFollowUser(false);
            setCompassMode(false);
            flyToCoordinate({
              latitude: item.latitude,
              longitude: item.longitude,
            });
          }}
        />
      </View>

      <LocationInactiveBanner
        hasLiveLocation={Boolean(userCoordinate)}
        onRequestEnable={() => setLocationModalVisible(true)}
      />

      {hasDiscoverableOnMap || storedCats.length > 0 ? (
        <MapDiscoveryLegend />
      ) : null}

      <MapExplorerHud
        missionCount={openMissionCount}
        collectionCount={ownedCats.length}
        captureHighlighted={Boolean(nearbyCatIds.length)}
        compassActive={compassMode}
        onRecenter={() => void recenterOnPlayer()}
        onRecenterReset={resetMainView}
        onCompass={handleCompassPress}
        onCapturePress={() => {
          void captureGate.requestCapture();
        }}
      />

      <MapCatModal
        visible={sheetVisible}
        cat={selected}
        discoveryState={selectedDiscoveryState ?? undefined}
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
        onCapture={() => {
          if (!selected) return;
          const sightingId = selected.id;
          setSheetVisible(false);
          setSelected(null);
          void captureGate.requestCapture({ worldId: sightingId });
        }}
      />

      <MapDiscoveryTip
        visible={discoveryTipVisible}
        onDismiss={handleDismissDiscoveryTip}
      />

      <EnablePermissionModal
        visible={locationModalVisible}
        kind="location"
        title="Autorise le suivi GPS"
        description="CatDex utilise ta position pour placer les chats près de toi et l’orientation du téléphone pour tourner la carte. Tu peux refuser et l’activer plus tard."
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
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
});
