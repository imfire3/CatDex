import { memo, useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import Mapbox from "@rnmapbox/maps";
import { MapCatMarker } from "@/components/game/MapCatMarker";
import type { GameMapMarker, GameMapProps } from "./GameMap.types";

const token = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
if (token) {
  Mapbox.setAccessToken(token);
}

const MapMarker = memo(function MapMarker({ cat, onPress }: GameMapMarker) {
  return (
    <Mapbox.PointAnnotation id={cat.id} coordinate={[cat.longitude, cat.latitude]}>
      <View>
        <MapCatMarker cat={cat} onPress={onPress} />
      </View>
    </Mapbox.PointAnnotation>
  );
});

export function GameMapMapbox({
  region,
  markers,
  showUserLocation = true,
  recenterToken = 0,
}: GameMapProps) {
  const cameraRef = useRef<Mapbox.Camera>(null);
  const regionRef = useRef(region);
  regionRef.current = region;

  useEffect(() => {
    if (recenterToken === 0) return;
    cameraRef.current?.setCamera({
      centerCoordinate: [regionRef.current.longitude, regionRef.current.latitude],
      zoomLevel: 14,
      animationDuration: 450,
    });
  }, [recenterToken]);

  return (
    <Mapbox.MapView style={StyleSheet.absoluteFill} styleURL={Mapbox.StyleURL.Street}>
      <Mapbox.Camera
        ref={cameraRef}
        defaultSettings={{
          centerCoordinate: [region.longitude, region.latitude],
          zoomLevel: 14,
        }}
      />
      {showUserLocation ? <Mapbox.UserLocation visible /> : null}
      {markers.map((marker) => (
        <MapMarker key={marker.cat.id} {...marker} />
      ))}
    </Mapbox.MapView>
  );
}
