import { useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';

import { CatMapMarker } from '@/components/CatMapMarker';
import { DiscoveryRadius } from '@/components/maps/DiscoveryRadius';
import { MapWorldDecor } from '@/components/maps/MapWorldDecor';
import { PlayerLocationMarker } from '@/components/maps/PlayerLocationMarker';
import { catdexMapStyle } from '@/components/maps/catdexMapStyle';
import {
  buildFollowCamera,
  buildMapCamera,
  INITIAL_MAP_CAMERA,
  MAP_CAMERA_DURATION,
  MAP_FLY_TO_PIN_DURATION,
  MAP_FOLLOW_THRESHOLD_M,
  MAP_MAX_ZOOM,
  MAP_MIN_ZOOM,
} from '@/components/maps/mapCamera';
import { getCatDiscoveryState } from '@/lib/catDiscovery';
import { distanceMeters } from '@/lib/constants';
import type { Cat } from '@/types/cat';

type Props = {
  cats: Cat[];
  scheme: 'light' | 'dark';
  onSelectCat: (cat: Cat) => void;
  /** When set, camera animates to this coordinate (compass / recenter). */
  focusCoordinate?: { latitude: number; longitude: number } | null;
  /** Bumps on each recenter request so the camera re-animates. */
  focusNonce?: number;
  /** Bumps to snap zoom/pitch back to the default explorer framing. */
  resetViewNonce?: number;
  /** Player position for the custom CatDex location indicator. */
  userCoordinate?: { latitude: number; longitude: number } | null;
  /** Device compass heading in degrees (0 = north) — heading-up camera while follow is on. */
  userHeading?: number | null;
  nearbyCatIds?: string[];
  /** Ids of cats already in the player CatDex. */
  capturedCatIds?: string[];
  /** Currently selected cat — larger pin + pulse rings. */
  selectedCatId?: string | null;
  /** When false, GPS follow is paused so the camera can stay on a selected cat. */
  followUser?: boolean;
  /** Fired when the user pans / pinches — parent should pause GPS follow. */
  onBreakFollow?: () => void;
  /** @deprecated Option-1 mock has no name callout on pins. */
  pinCallouts?: Record<string, string>;
};

type ExtraMaps = {
  googleMapsApiKey?: string;
  ios?: { googleMapsApiKey?: string };
  android?: { googleMaps?: { apiKey?: string } };
};

/**
 * Google customMapStyle works on Android (and iOS when PROVIDER_GOOGLE + API key).
 * Without an iOS Google key we keep Apple Maps + POI suppression.
 */
function resolveMapProvider() {
  if (Platform.OS === 'android') return PROVIDER_GOOGLE;

  const extra = (Constants.expoConfig?.extra ?? {}) as ExtraMaps;
  const iosKey =
    extra.googleMapsApiKey ??
    extra.ios?.googleMapsApiKey ??
    Constants.expoConfig?.ios?.config?.googleMapsApiKey;

  return iosKey ? PROVIDER_GOOGLE : PROVIDER_DEFAULT;
}

const mapProvider = resolveMapProvider();

export function CatMap({
  cats,
  scheme,
  onSelectCat,
  focusCoordinate,
  focusNonce,
  resetViewNonce = 0,
  userCoordinate,
  userHeading = null,
  nearbyCatIds,
  capturedCatIds,
  selectedCatId,
  followUser = true,
  onBreakFollow,
}: Props) {
  const mapRef = useRef<MapView>(null);
  const lastFollowRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const didCenterOnUserRef = useRef(false);
  /** When true, camera keeps the GPS point centered (Pokémon-style). */
  const keepCenteredRef = useRef(true);
  const followUserRef = useRef(followUser);
  followUserRef.current = followUser;
  const userCoordinateRef = useRef(userCoordinate);
  userCoordinateRef.current = userCoordinate;
  const userHeadingRef = useRef(userHeading);
  userHeadingRef.current = userHeading;
  const focusCoordinateRef = useRef(focusCoordinate);
  focusCoordinateRef.current = focusCoordinate;
  /** Last zoom chosen by the player (pinch) — never sampled mid-animation. */
  const userZoomRef = useRef<number | null>(null);
  const onBreakFollowRef = useRef(onBreakFollow);
  onBreakFollowRef.current = onBreakFollow;
  const gestureActiveRef = useRef(false);
  /** Bumped to drop stale getCamera → animateCamera races. */
  const cameraGenerationRef = useRef(0);
  const ownedIds = useMemo(
    () => new Set(capturedCatIds ?? []),
    [capturedCatIds],
  );

  const stopCameraAnimation = () => {
    cameraGenerationRef.current += 1;
    const map = mapRef.current as (MapView & { stopAnimation?: () => void }) | null;
    map?.stopAnimation?.();
  };

  const pauseFollowFromGesture = () => {
    stopCameraAnimation();
    if (!keepCenteredRef.current && !followUserRef.current) return;
    keepCenteredRef.current = false;
    onBreakFollowRef.current?.();
  };

  const captureUserZoom = () => {
    void (async () => {
      const generation = cameraGenerationRef.current;
      const current = await mapRef.current?.getCamera();
      if (generation !== cameraGenerationRef.current) return;
      if (typeof current?.zoom === 'number') {
        userZoomRef.current = current.zoom;
      }
    })();
  };

  useEffect(() => {
    keepCenteredRef.current = followUser;
  }, [followUser]);

  // Soft recenter — only on explicit fly requests (nonce / coordinate).
  // Do NOT depend on followUser: breaking GPS follow must not re-fly the camera.
  // Depend on lat/lng primitives + nonce — never the object identity (parent may
  // allocate a fresh `{ lat, lng }` every render).
  useEffect(() => {
    if (!focusCoordinate) return;
    lastFollowRef.current = focusCoordinate;
    keepCenteredRef.current = followUserRef.current;
    didCenterOnUserRef.current = true;
    const generation = ++cameraGenerationRef.current;
    const shouldFollow = followUserRef.current;
    const target = {
      latitude: focusCoordinate.latitude,
      longitude: focusCoordinate.longitude,
    };
    void (async () => {
      const current = await mapRef.current?.getCamera();
      if (generation !== cameraGenerationRef.current) return;
      mapRef.current?.animateCamera(
        buildFollowCamera(
          target,
          current,
          userHeadingRef.current,
          userZoomRef.current,
        ),
        {
          duration: shouldFollow ? MAP_CAMERA_DURATION : MAP_FLY_TO_PIN_DURATION,
        },
      );
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional primitive deps
  }, [
    focusCoordinate?.latitude,
    focusCoordinate?.longitude,
    focusNonce,
  ]);

  // Double-tap recenter — restore default zoom + pitch framing (once per nonce).
  useEffect(() => {
    if (!resetViewNonce) return;
    const coordinate =
      userCoordinateRef.current ?? focusCoordinateRef.current;
    if (!coordinate) return;
    lastFollowRef.current = coordinate;
    keepCenteredRef.current = true;
    didCenterOnUserRef.current = true;
    userZoomRef.current = null;
    stopCameraAnimation();
    mapRef.current?.animateCamera(
      buildMapCamera(coordinate),
      { duration: MAP_FLY_TO_PIN_DURATION },
    );
  }, [resetViewNonce]);

  // Soft follow while walking — pan + compass heading, never override pinch zoom.
  // First GPS lock: center the camera on the player (game default framing).
  // User pan disables follow until recenter.
  useEffect(() => {
    if (!userCoordinate || !keepCenteredRef.current || gestureActiveRef.current) {
      return;
    }

    const prev = lastFollowRef.current;
    if (!prev || !didCenterOnUserRef.current) {
      lastFollowRef.current = userCoordinate;
      didCenterOnUserRef.current = true;
      userZoomRef.current = null;
      cameraGenerationRef.current += 1;
      mapRef.current?.animateCamera(
        buildMapCamera(userCoordinate, {
          heading: userHeadingRef.current ?? 0,
        }),
        { duration: MAP_CAMERA_DURATION },
      );
      return;
    }

    const moved = distanceMeters(
      prev.latitude,
      prev.longitude,
      userCoordinate.latitude,
      userCoordinate.longitude,
    );
    if (moved < MAP_FOLLOW_THRESHOLD_M) return;

    lastFollowRef.current = userCoordinate;
    const generation = ++cameraGenerationRef.current;
    void (async () => {
      if (!keepCenteredRef.current || gestureActiveRef.current) return;
      const current = await mapRef.current?.getCamera();
      if (generation !== cameraGenerationRef.current) return;
      if (!keepCenteredRef.current || gestureActiveRef.current) return;
      mapRef.current?.animateCamera(
        buildFollowCamera(
          userCoordinate,
          current,
          userHeadingRef.current,
          userZoomRef.current,
        ),
        { duration: MAP_CAMERA_DURATION },
      );
    })();
  }, [userCoordinate]);

  // Compass — rotate the map so the facing direction is up.
  useEffect(() => {
    const coordinate = userCoordinateRef.current;
    if (!coordinate) return;
    const generation = ++cameraGenerationRef.current;
    void (async () => {
      const current = await mapRef.current?.getCamera();
      if (generation !== cameraGenerationRef.current) return;
      mapRef.current?.animateCamera(
        buildFollowCamera(
          coordinate,
          current,
          userHeading,
          userZoomRef.current,
        ),
        { duration: MAP_CAMERA_DURATION },
      );
    })();
  }, [userHeading]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={mapProvider}
        initialCamera={INITIAL_MAP_CAMERA}
        customMapStyle={catdexMapStyle}
        userInterfaceStyle={scheme}
        mapType="standard"
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        showsTraffic={false}
        showsIndoors={false}
        showsBuildings={false}
        showsPointsOfInterest={false}
        pitchEnabled={false}
        rotateEnabled={false}
        scrollEnabled
        zoomEnabled
        zoomTapEnabled
        zoomControlEnabled={false}
        minZoomLevel={MAP_MIN_ZOOM}
        maxZoomLevel={MAP_MAX_ZOOM}
        toolbarEnabled={false}
        mapPadding={{ top: 0, right: 0, bottom: 0, left: 0 }}
        onPanDrag={() => {
          pauseFollowFromGesture();
        }}
        onRegionChange={() => {
          // Pinch zoom moves the region without pan-drag on some builds.
          // Do not pause on touch alone — that killed Pokémon-style walk follow.
          if (gestureActiveRef.current) {
            pauseFollowFromGesture();
          }
        }}
        onTouchStart={() => {
          gestureActiveRef.current = true;
        }}
        onTouchEnd={() => {
          gestureActiveRef.current = false;
          captureUserZoom();
        }}
        onTouchCancel={() => {
          gestureActiveRef.current = false;
          captureUserZoom();
        }}
        onRegionChangeComplete={() => {
          if (!gestureActiveRef.current) {
            captureUserZoom();
          }
        }}
      >
        <MapWorldDecor cats={cats} />
        {userCoordinate ? <DiscoveryRadius coordinate={userCoordinate} /> : null}
        {cats.map((cat) => {
          const discoveryState = capturedCatIds
            ? getCatDiscoveryState(cat, ownedIds)
            : 'owned';
          const owned = discoveryState === 'owned';
          return (
            <CatMapMarker
              key={cat.id}
              cat={cat}
              onPress={onSelectCat}
              isNearby={nearbyCatIds?.includes(cat.id) ?? false}
              captured={owned}
              discoveryState={discoveryState}
              selected={selectedCatId === cat.id}
            />
          );
        })}
        {userCoordinate ? (
          <PlayerLocationMarker
            coordinate={userCoordinate}
            heading={userHeading}
          />
        ) : null}
      </MapView>
    </View>
  );
}

export function MiniMap({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  return (
    <MapView
      style={styles.miniMap}
      pointerEvents="none"
      provider={mapProvider}
      customMapStyle={catdexMapStyle}
      initialCamera={buildMapCamera(
        { latitude, longitude },
        { pitch: 0, zoom: 15, altitude: 1200 },
      )}
      showsPointsOfInterest={false}
      showsBuildings={false}
      showsUserLocation={false}
      pitchEnabled={false}
      scrollEnabled={false}
      zoomEnabled={false}
      rotateEnabled={false}
    >
      <Marker coordinate={{ latitude, longitude }} />
    </MapView>
  );
}

const styles = StyleSheet.create({
  miniMap: {
    height: 180,
  },
});
