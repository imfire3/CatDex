import { useEffect, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';

import { CatMapMarker } from '@/components/CatMapMarker';
import { MapLuminousOverlay } from '@/components/maps/MapLuminousOverlay';
import { PlayerLocationMarker } from '@/components/maps/PlayerLocationMarker';
import { catdexMapStyle } from '@/components/maps/catdexMapStyle';
import {
  buildMapCamera,
  INITIAL_MAP_CAMERA,
  MAP_CAMERA_DURATION,
} from '@/components/maps/mapCamera';
import type { Cat } from '@/types/cat';

type Props = {
  cats: Cat[];
  scheme: 'light' | 'dark';
  onSelectCat: (cat: Cat) => void;
  /** When set, camera animates to this coordinate (compass / recenter). */
  focusCoordinate?: { latitude: number; longitude: number } | null;
  /** Player position for the custom CatDex location indicator. */
  userCoordinate?: { latitude: number; longitude: number } | null;
};

/**
 * Google customMapStyle works on Android (and iOS when PROVIDER_GOOGLE + API key).
 * Apple Maps ignores JSON styles but still gets POI suppression + pitch + overlay.
 */
const mapProvider =
  Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT;

export function CatMap({
  cats,
  scheme,
  onSelectCat,
  focusCoordinate,
  userCoordinate,
}: Props) {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (!focusCoordinate) return;
    mapRef.current?.animateCamera(
      buildMapCamera(focusCoordinate),
      { duration: MAP_CAMERA_DURATION },
    );
  }, [focusCoordinate]);

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
        pitchEnabled
        rotateEnabled={false}
        toolbarEnabled={false}
        mapPadding={{ top: 0, right: 0, bottom: 90, left: 0 }}
      >
        {cats.map((cat) => (
          <CatMapMarker key={cat.id} cat={cat} onPress={onSelectCat} />
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
