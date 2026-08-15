import { useIsFocused } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { EnablePermissionModal } from '@/components/EnablePermissionModal';
import { SupportProjectModal } from '@/components/SupportProjectModal';
import { CatMap } from '@/components/maps/CatMap';
import { LocationInactiveBanner } from '@/components/maps/LocationInactiveBanner';
import { MapCatModal } from '@/components/maps/MapCatModal';
import { MapDiscoverableSheet } from '@/components/maps/MapDiscoverableSheet';
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
  isMapDemoEnabled,
  mergeCatsById,
} from '@/lib/demoCats';
import { coordinatesForDiscoveryOverview } from '@/lib/mapDiscoveryOverview';
import {
  getCurrentLocationCoordinate,
  openSystemLocationSettings,
  requestLocationAccessResult,
  requestWebCompassPermission,
} from '@/lib/locationAccess';
import {
  dismissMapDiscoveryTip,
  hasDismissedMapDiscoveryTip,
} from '@/lib/mapDiscoveryTip';
import {
  dismissSupportModal,
  hasDismissedSupportModal,
} from '@/lib/supportModal';
import {
  headingFromDeviceOrientation,
  resolveDeviceHeading,
  shouldUpdateHeading,
  webCompassNeedsUserGesture,
} from '@/lib/mapHeading';
import { PROXIMITY_ALERT_M, sortCatsByDistance } from '@/lib/mapExplore';
import { useAuthStore } from '@/store/auth';
import { useCatsStore } from '@/store/cats';
import { claimTargetFromCat, useClaimTargetStore } from '@/store/claimTarget';
import { useCommunityCatsStore } from '@/store/communityCats';
import { useMapExploreStore } from '@/store/mapExplore';
import { useMissionsStore } from '@/store/missions';
import { useNotificationsStore } from '@/store/notifications';
import { useToastStore } from '@/store/toast';
import type { Cat } from '@/types/cat';

/**
 * Explorer — map + HUD (profile avatar, Missions / Capture / CatDex).
 * GPS & camera are gated by in-app modals (no silent OS prompts).
 */
export default function MapScreen() {
  const mapFocused = useIsFocused();
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
  const setClaimTarget = useClaimTargetStore((state) => state.setTarget);
  const clearClaimTarget = useClaimTargetStore((state) => state.clearTarget);

  /** Real CatDex only — never count demo / community pins as captures. */
  const ownedCats = storedCats;
  const ownedIds = useMemo(() => buildOwnedCatIdSet(ownedCats), [ownedCats]);

  const [communityCats, setCommunityCats] = useState<Cat[]>([]);
  const setSharedCommunityCats = useCommunityCatsStore((state) => state.setCats);
  const [selected, setSelected] = useState<Cat | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [discoveryTipVisible, setDiscoveryTipVisible] = useState(false);
  const [discoverableSheetVisible, setDiscoverableSheetVisible] =
    useState(false);
  const [focusCoordinate, setFocusCoordinate] = useState<{
    latitude: number;
    longitude: number;
    nonce: number;
    pinZoom?: boolean;
  } | null>(null);
  const [resetViewNonce, setResetViewNonce] = useState(0);
  const [overviewNonce, setOverviewNonce] = useState(0);
  const [overviewCoordinates, setOverviewCoordinates] = useState<
    { latitude: number; longitude: number }[] | null
  >(null);
  const [userCoordinate, setUserCoordinate] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  /** True only after a real geolocation fix (never the Paris demo anchor). */
  const [hasGpsFix, setHasGpsFix] = useState(false);
  /** Compass heading in degrees (0 = north). Drives heading-up follow. */
  const [userHeading, setUserHeading] = useState<number | null>(null);
  /**
   * Bumped after a user-gesture compass unlock (iOS Safari).
   * Re-attaches orientation listeners once permission is actually granted.
   */
  const [compassEpoch, setCompassEpoch] = useState(0);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  /** ask = first prompt · denied = user blocked OS permission */
  const [locationModalPhase, setLocationModalPhase] = useState<'ask' | 'denied'>(
    'ask',
  );
  const [locationBusy, setLocationBusy] = useState(false);
  /** GPS gate finished (granted or already active) — then we may show support. */
  const [locationGateDone, setLocationGateDone] = useState(false);
  const [supportModalVisible, setSupportModalVisible] = useState(false);
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
    const next = mapDemo ? mergeCatsById(remote, DEMO_COMMUNITY_CATS) : remote;
    setCommunityCats(next);
    setSharedCommunityCats(next);
  }, [mapDemo, setSharedCommunityCats]);

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

  /**
   * Dev demo: keep Paris pins for exploration, but never pretend Paris is the
   * player's GPS. Camera starts on real location once a fix arrives.
   */
  useEffect(() => {
    if (!mapDemo || hasGpsFix) return;
    setFocusCoordinate((prev) =>
      prev ?? {
        ...PARIS_20E.center,
        nonce: 1,
      },
    );
  }, [mapDemo, hasGpsFix]);

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

  const discoverableCats = useMemo(
    () =>
      mapCats.filter(
        (cat) => getCatDiscoveryState(cat, ownedIds) === 'discoverable',
      ),
    [mapCats, ownedIds],
  );

  const handleShowDiscoverable = useCallback(() => {
    if (discoverableCats.length === 0) return;
    const points = coordinatesForDiscoveryOverview(
      userCoordinate,
      discoverableCats.map((cat) => ({
        latitude: cat.latitude,
        longitude: cat.longitude,
      })),
    );
    setOverviewCoordinates(points);
    setOverviewNonce((value) => value + 1);
    setFollowUser(false);
    setCompassMode(false);
    setSheetVisible(false);
    setSelected(null);
    setDiscoverableSheetVisible(true);
  }, [discoverableCats, userCoordinate]);

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

  /** After GPS is ready on the map: optional free/Revolut note (once per user). */
  useEffect(() => {
    if (!locationGateDone || locationModalVisible || !userId) return;
    let mounted = true;
    void (async () => {
      const dismissed = await hasDismissedSupportModal(userId);
      if (mounted && !dismissed) {
        // Let the GPS success toast settle briefly before stacking another surface.
        await new Promise((resolve) => setTimeout(resolve, 600));
        if (mounted) setSupportModalVisible(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [locationGateDone, locationModalVisible, userId]);

  const sortedCats = useMemo(
    () => sortCatsByDistance(mapCats, userCoordinate),
    [mapCats, userCoordinate],
  );

  /** Distance label — GPS only (never Paris demo fallback). */
  const selectedDistance = useMemo(() => {
    if (!selected || !hasGpsFix || !userCoordinate) return null;
    return distanceMeters(
      userCoordinate.latitude,
      userCoordinate.longitude,
      selected.latitude,
      selected.longitude,
    );
  }, [selected, hasGpsFix, userCoordinate]);

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
    (
      coordinate: { latitude: number; longitude: number },
      options?: { pinZoom?: boolean },
    ) => {
      setFocusCoordinate((prev) => ({
        ...coordinate,
        nonce: (prev?.nonce ?? 0) + 1,
        pinZoom: options?.pinZoom,
      }));
    },
    [],
  );

  const sortedDiscoverableCats = useMemo(
    () =>
      sortCatsByDistance(
        discoverableCats,
        hasGpsFix ? userCoordinate : null,
      ),
    [discoverableCats, hasGpsFix, userCoordinate],
  );

  const handleSelectDiscoverable = useCallback(
    (item: { cat: Cat; distanceM: number }) => {
      setDiscoverableSheetVisible(false);
      setSelected(item.cat);
      setSheetVisible(true);
      setFollowUser(false);
      setCompassMode(false);
      flyToCoordinate({
        latitude: item.cat.latitude,
        longitude: item.cat.longitude,
      });
    },
    [flyToCoordinate],
  );

  const applyLocation = useCallback(
    async (coordinate: { latitude: number; longitude: number }) => {
      setUserCoordinate(coordinate);
      setHasGpsFix(true);
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

  /**
   * Always request a live GPS fix on the explorer (triggers the browser prompt
   * when needed). Do not wait for Permissions API "granted" — Cursor / Safari
   * often report "prompt" even after the user can share location.
   */
  useEffect(() => {
    let mounted = true;
    void (async () => {
      if (mounted) setWatchEnabled(true);

      const result = await requestLocationAccessResult();
      if (!mounted) return;

      if (result.denied) {
        setLocationGateDone(true);
        return;
      }

      const next =
        result.coordinate ?? (await getCurrentLocationCoordinate());
      if (next && mounted) {
        await applyLocation(next);
      }
      if (mounted) setLocationGateDone(true);
    })().catch(() => {
      if (mounted) {
        setWatchEnabled(true);
        setLocationGateDone(true);
      }
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
            setHasGpsFix(true);
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
          setHasGpsFix(true);
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
    if (!pendingFocus || !mapFocused) return;
    const focus = consumePendingFocus();
    if (!focus) return;

    setFollowUser(false);
    setCompassMode(false);
    flyToCoordinate(
      {
        latitude: focus.latitude,
        longitude: focus.longitude,
      },
      { pinZoom: focus.pinZoom !== false },
    );

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
  }, [pendingFocus, mapFocused, consumePendingFocus, flyToCoordinate, mapCats]);

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

  const showToast = useToastStore((state) => state.show);

  const openLocationAskModal = useCallback(() => {
    setLocationModalPhase('ask');
    setLocationModalVisible(true);
  }, []);

  const handleLocationAuthorize = useCallback(async () => {
    // May also unlock motion on iOS when the user accepts GPS from the modal.
    unlockWebCompassFromGesture();
    setLocationBusy(true);
    try {
      const result = await requestLocationAccessResult();

      if (result.denied) {
        setLocationModalPhase('denied');
        setLocationModalVisible(true);
        return;
      }

      if (result.granted) {
        setLocationModalVisible(false);
        setLocationModalPhase('ask');
        setWatchEnabled(true);
        setLocationGateDone(true);
        showToast({
          title: 'Position enregistrée',
          description: 'Le GPS est activé — tu peux explorer ton quartier.',
          tone: 'success',
          durationMs: 2800,
        });
        const next =
          result.coordinate ?? (await getCurrentLocationCoordinate());
        if (next) await applyLocation(next);
        return;
      }

      // Undetermined / no response — keep modal, invite retry.
      if (Platform.OS !== 'web') {
        await openSystemLocationSettings();
      }
    } finally {
      setLocationBusy(false);
    }
  }, [applyLocation, showToast, unlockWebCompassFromGesture]);

  const recenterOnPlayer = async () => {
    setFollowUser(true);
    setWatchEnabled(true);
    unlockWebCompassFromGesture();

    // Instant camera feedback from last known *real* GPS.
    if (hasGpsFix && userCoordinate) {
      flyToCoordinate(userCoordinate);
    }

    try {
      const result = await requestLocationAccessResult();
      if (result.denied) {
        openLocationAskModal();
        setLocationModalPhase('denied');
        setLocationModalVisible(true);
        return;
      }
      const next =
        result.coordinate ?? (await getCurrentLocationCoordinate());
      if (next) {
        await applyLocation(next);
        return;
      }
    } catch {
      // fallback below
    }

    if (hasGpsFix && userCoordinate) {
      flyToCoordinate(userCoordinate);
      return;
    }

    openLocationAskModal();
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
    if (userCoordinate && hasGpsFix) {
      flyToCoordinate(userCoordinate);
      return;
    }
    void requestLocationAccessResult().then(async (result) => {
      if (result.denied) {
        openLocationAskModal();
        return;
      }
      const next =
        result.coordinate ?? (await getCurrentLocationCoordinate());
      if (next) await applyLocation(next);
      else if (!hasGpsFix) openLocationAskModal();
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
          focusPinZoom={Boolean(focusCoordinate?.pinZoom)}
          resetViewNonce={resetViewNonce}
          overviewCoordinates={overviewCoordinates}
          overviewNonce={overviewNonce}
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
        hasLiveLocation={hasGpsFix}
        onRequestEnable={openLocationAskModal}
      />

      {hasDiscoverableOnMap || storedCats.length > 0 ? (
        <MapDiscoveryLegend
          discoverableCount={discoverableCats.length}
          onShowDiscoverable={
            discoverableCats.length > 0 ? handleShowDiscoverable : undefined
          }
        />
      ) : null}

      <MapExplorerHud
        missionCount={openMissionCount}
        collectionCount={storedCats.length}
        captureHighlighted={Boolean(nearbyCatIds.length)}
        compassActive={compassMode}
        onRecenter={() => void recenterOnPlayer()}
        onRecenterReset={resetMainView}
        onCompass={handleCompassPress}
        onCapturePress={() => {
          clearClaimTarget();
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
          setClaimTarget(claimTargetFromCat(selected));
          const sightingId = selected.remoteId || selected.id;
          setSheetVisible(false);
          setSelected(null);
          void captureGate.requestCapture({ worldId: sightingId });
        }}
      />

      <MapDiscoverableSheet
        visible={discoverableSheetVisible}
        items={sortedDiscoverableCats}
        showDistance={hasGpsFix}
        onClose={() => setDiscoverableSheetVisible(false)}
        onSelect={handleSelectDiscoverable}
      />

      <MapDiscoveryTip
        visible={discoveryTipVisible && !supportModalVisible}
        onDismiss={handleDismissDiscoveryTip}
      />

      <SupportProjectModal
        visible={supportModalVisible}
        onContinue={() => {
          setSupportModalVisible(false);
          void dismissSupportModal(userId);
        }}
      />

      <EnablePermissionModal
        visible={locationModalVisible}
        kind="location"
        title={
          locationModalPhase === 'denied'
            ? 'GPS refusé — CatDex est bloqué'
            : 'Autorise le suivi GPS'
        }
        description={
          locationModalPhase === 'denied'
            ? 'Sans localisation, CatDex ne peut pas placer les chats près de toi ni faire fonctionner la carte. Active la position pour ce site dans Réglages → Safari → Localisation, puis réessaie.'
            : 'CatDex utilise ta position pour placer les chats près de toi et l’orientation du téléphone pour tourner la carte. Sans GPS, l’app ne peut pas fonctionner.'
        }
        primaryLabel={
          locationBusy
            ? 'Ouverture…'
            : locationModalPhase === 'denied'
              ? 'Réessayer'
              : 'Autoriser le GPS'
        }
        onClose={() => {
          // Keep the gate up until GPS is granted (or user retries after a deny).
          if (locationModalPhase === 'denied') return;
        }}
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
