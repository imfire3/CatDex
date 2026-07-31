import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

import { CatMapMarker } from '@/components/CatMapMarker';
import { PARIS_20E } from '@/lib/constants';
import type { Cat } from '@/types/cat';

type Props = {
  cats: Cat[];
  scheme: 'light' | 'dark';
  onSelectCat: (cat: Cat) => void;
  /** When set, camera animates to this coordinate (compass / recenter). */
  focusCoordinate?: { latitude: number; longitude: number } | null;
};

export function CatMap({ cats, scheme, onSelectCat, focusCoordinate }: Props) {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (!focusCoordinate) return;
    mapRef.current?.animateToRegion(
      {
        latitude: focusCoordinate.latitude,
        longitude: focusCoordinate.longitude,
        latitudeDelta: PARIS_20E.delta.latitudeDelta,
        longitudeDelta: PARIS_20E.delta.longitudeDelta,
      },
      480,
    );
  }, [focusCoordinate]);

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      provider={PROVIDER_DEFAULT}
      initialRegion={{
        ...PARIS_20E.center,
        ...PARIS_20E.delta,
      }}
      userInterfaceStyle={scheme}
      showsUserLocation
      mapPadding={{ top: 0, right: 0, bottom: 90, left: 0 }}
    >
      {cats.map((cat) => (
        <CatMapMarker key={cat.id} cat={cat} onPress={onSelectCat} />
      ))}
    </MapView>
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
      initialRegion={{
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
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
