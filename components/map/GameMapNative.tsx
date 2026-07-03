import { memo, useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker as RNMarker } from "react-native-maps";
import { MapCatMarker } from "@/components/game/MapCatMarker";
import type { GameMapMarker, GameMapProps } from "./GameMap.types";

const MapMarker = memo(function MapMarker({ cat, onPress }: GameMapMarker) {
  return (
    <RNMarker
      coordinate={{ latitude: cat.latitude, longitude: cat.longitude }}
      tracksViewChanges={false}
    >
      <MapCatMarker cat={cat} onPress={onPress} />
    </RNMarker>
  );
});

export function GameMapNative({
  region,
  markers,
  showUserLocation = true,
  recenterToken = 0,
}: GameMapProps) {
  const mapRef = useRef<MapView>(null);
  const regionRef = useRef(region);
  regionRef.current = region;

  useEffect(() => {
    if (recenterToken > 0) {
      mapRef.current?.animateToRegion(regionRef.current, 450);
    }
  }, [recenterToken]);

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      initialRegion={region}
      showsUserLocation={showUserLocation}
      showsCompass={false}
      rotateEnabled={false}
      pitchEnabled={false}
    >
      {markers.map((marker) => (
        <MapMarker key={marker.cat.id} {...marker} />
      ))}
    </MapView>
  );
}

export type { GameMapMarker };
