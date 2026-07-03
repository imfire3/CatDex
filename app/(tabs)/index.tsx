import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Mapbox, { Camera, PointAnnotation } from '@rnmapbox/maps';
import { useLocationStore } from '@/stores/location.store';
import { useNearbyCats } from '@/hooks';
import { getCurrentLocation, requestLocationPermission } from '@/utils/location';
import { MAPBOX_TOKEN, formatDistance, RARITY_COLORS } from '@/lib/constants';
import { colors, spacing, typography } from '@/theme';
import { LoadingSpinner } from '@/components';

if (MAPBOX_TOKEN) {
  Mapbox.setAccessToken(MAPBOX_TOKEN);
}

export default function MapScreen() {
  const router = useRouter();
  const { coords, setCoords, setPermissionGranted } = useLocationStore();
  const [loading, setLoading] = useState(true);
  const cameraRef = useRef<Camera>(null);

  const { data: nearbyCats = [], isLoading: catsLoading, refetch } = useNearbyCats(
    coords?.latitude,
    coords?.longitude
  );

  useEffect(() => {
    (async () => {
      const granted = await requestLocationPermission();
      setPermissionGranted(granted);
      if (granted) {
        try {
          const location = await getCurrentLocation();
          setCoords(location);
        } catch {
          setCoords({ latitude: 37.7749, longitude: -122.4194, accuracy: null });
        }
      }
      setLoading(false);
    })();
  }, []);

  if (loading || !coords) {
    return <LoadingSpinner message="Getting your location..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Cats</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => refetch()}>
            <Ionicons name="refresh" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <Mapbox.MapView style={styles.map} styleURL={Mapbox.StyleURL.Dark}>
          <Camera
            ref={cameraRef}
            centerCoordinate={[coords.longitude, coords.latitude]}
            zoomLevel={14}
            animationMode="flyTo"
            animationDuration={1000}
          />

          <PointAnnotation
            id="user-location"
            coordinate={[coords.longitude, coords.latitude]}
          >
            <View style={styles.userMarker}>
              <View style={styles.userMarkerInner} />
            </View>
          </PointAnnotation>

          {nearbyCats.map((cat) => (
            <PointAnnotation
              key={cat.id}
              id={cat.id}
              coordinate={[cat.approximate_lng, cat.approximate_lat]}
              onSelected={() => router.push(`/cat/${cat.id}`)}
            >
              <View style={[styles.catMarker, { borderColor: RARITY_COLORS[cat.rarity] ?? colors.primary }]}>
                <Text style={styles.catMarkerEmoji}>🐱</Text>
              </View>
            </PointAnnotation>
          ))}
        </Mapbox.MapView>
      </View>

      <View style={styles.bottomSheet}>
        <Text style={styles.sheetTitle}>
          {catsLoading ? 'Searching...' : `${nearbyCats.length} cats nearby`}
        </Text>
        <Text style={styles.sheetSubtitle}>Approximate locations only</Text>
        {nearbyCats.slice(0, 3).map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.catRow}
            onPress={() => router.push(`/cat/${cat.id}`)}
          >
            <Text style={styles.catEmoji}>🐱</Text>
            <View style={styles.catInfo}>
              <Text style={styles.catName}>{cat.name}</Text>
              <Text style={styles.catDistance}>{formatDistance(cat.distance_km)}</Text>
            </View>
            <View style={[styles.rarityDot, { backgroundColor: RARITY_COLORS[cat.rarity] }]} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing.md,
  },
  title: { ...typography.h2, color: colors.text },
  headerActions: { flexDirection: 'row', gap: spacing.sm },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  userMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  catMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catMarkerEmoji: { fontSize: 18 },
  bottomSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  sheetTitle: { ...typography.h3, color: colors.text },
  sheetSubtitle: { color: colors.textMuted, fontSize: 12, marginBottom: spacing.md },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  catEmoji: { fontSize: 28 },
  catInfo: { flex: 1 },
  catName: { color: colors.text, fontWeight: '600', fontSize: 16 },
  catDistance: { color: colors.textSecondary, fontSize: 13 },
  rarityDot: { width: 10, height: 10, borderRadius: 5 },
});
