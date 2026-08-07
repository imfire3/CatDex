import { useEffect, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';

import { CatMapMarker } from '@/components/CatMapMarker';
import { DiscoveryRadius } from '@/components/maps/DiscoveryRadius';
import { MapLuminousOverlay } from '@/components/maps/MapLuminousOverlay';
import { MapWorldDecor } from '@/components/maps/MapWorldDecor';
import { PlayerLocationMarker } from '@/components/maps/PlayerLocationMarker';
import { catdexMapStyle } from '@/components/maps/catdexMapStyle';
import {
  buildFollowCamera,
  buildMapCamera,
  INITIAL_MAP_CAMERA,
  MAP_CAMERA_DURATION,
  MAP_FOLLOW_THRESHOLD_M,
  MAP_MAX_ZOOM,
  MAP_MIN_ZOOM,
} from '@/components/maps/mapCamera';
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
  /** Player position for the custom CatDex location indicator. */
  userCoordinate?: { latitude: number; longitude: number } | null;
  nearbyCatIds?: string[];
  /** Ids of cats already in the player CatDex. */
  capturedCatIds?: string[];
};

type ExtraMaps = {
  googleMapsApiKey?: string;
  ios?: { googleMapsApiKey?: string };
  android?: { googleMaps?: { apiKey?: string } };
};

/**
 * Google customMapStyle works on Android (and iOS when PROVIDER_GOOGLE + API key).
 * Without an iOS Google key we keep Apple Maps + POI suppression + pitch + overlay.
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
  userCoordinate,
  nearbyCatIds,
  capturedCatIds,
}: Props) {
  const mapRef = useRef<MapView>(null);
  const lastFollowRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const didCenterOnUserRef = useRef(false);

  // Explicit recenter — restores game default zoom/pitch.
  useEffect(() => {
    if (!focusCoordinate) return;
    lastFollowRef.current = focusCoordinate;
    didCenterOnUserRef.current = true;
    mapRef.current?.animateCamera(buildMapCamera(focusCoordinate), {
      duration: MAP_CAMERA_DURATION,
    });
  }, [focusCoordinate, focusNonce]);

  // Soft follow while walking — pan only, never override pinch zoom.
  // First GPS lock: center the camera on the player (game default framing).
  useEffect(() => {
    if (!userCoordinate) return;

    const prev = lastFollowRef.current;
    if (!prev || !didCenterOnUserRef.current) {
      lastFollowRef.current = userCoordinate;
      didCenterOnUserRef.current = true;
      mapRef.current?.animateCamera(buildMapCamera(userCoordinate), {
        duration: MAP_CAMERA_DURATION,
      });
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
    void (async () => {
      const current = await mapRef.current?.getCamera();
      mapRef.current?.animateCamera(buildFollowCamera(userCoordinate, current), {
        duration: MAP_CAMERA_DURATION,
      });
    })();
  }, [userCoordinate]);

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
        showsBuildings
        showsPointsOfInterest={false}
        pitchEnabled
        rotateEnabled
        scrollEnabled
        zoomEnabled
        zoomTapEnabled
        zoomControlEnabled={false}
        minZoomLevel={MAP_MIN_ZOOM}
        maxZoomLevel={MAP_MAX_ZOOM}
        toolbarEnabled={false}
        mapPadding={{ top: 0, right: 0, bottom: 0, left: 0 }}
      >
        <MapWorldDecor cats={cats} />
        {userCoordinate ? <DiscoveryRadius coordinate={userCoordinate} /> : null}
        {cats.map((cat) => (
          <CatMapMarker
            key={cat.id}
            cat={cat}
            onPress={onSelectCat}
            isNearby={nearbyCatIds?.includes(cat.id) ?? false}
            captured={capturedCatIds?.includes(cat.id) ?? true}
          />
        ))}
        {userCoordinate ? (
          <PlayerLocationMarker coordinate={userCoordinate} />
        ) : null}
      </MapView>
      <MapLuminousOverlay />
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
