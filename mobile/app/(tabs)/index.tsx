import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Animated as RNAnimated } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Cat3DAvatar } from '../../components/Cat3DAvatar';
import { XPBar } from '../../components/XPBar';
import { api } from '../../services/api';
import { Colors, FontSize, Spacing } from '../../constants/theme';
import type { MapCatPin } from '@catdex/shared';

const SF_REGION = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

function MapMarker({ pin, onPress }: { pin: MapCatPin; onPress: () => void }) {
  const pulseAnim = useRef(new RNAnimated.Value(1)).current;

  useEffect(() => {
    if (pin.isRecentlyObserved) {
      RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.timing(pulseAnim, { toValue: 1.3, duration: 800, useNativeDriver: true }),
          RNAnimated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [pin.isRecentlyObserved]);

  if (!pin.isKnown) {
    return (
      <Marker coordinate={{ latitude: pin.latitude, longitude: pin.longitude }} onPress={onPress}>
        <View style={styles.silhouette}>
          <Text style={styles.silhouetteIcon}>🐱</Text>
        </View>
      </Marker>
    );
  }

  return (
    <Marker coordinate={{ latitude: pin.latitude, longitude: pin.longitude }} onPress={onPress}>
      <RNAnimated.View
        style={[
          styles.markerContainer,
          pin.isPopular && styles.popularMarker,
          pin.isRecentlyObserved && { transform: [{ scale: pulseAnim }] },
        ]}
      >
        <Cat3DAvatar modelId={pin.modelId} size={56} autoRotate={false} goldenAura={pin.isPopular} />
        {pin.name && <Text style={styles.markerName}>{pin.name}</Text>}
      </RNAnimated.View>
    </Marker>
  );
}

export default function MapScreen() {
  const router = useRouter();
  const [pins, setPins] = useState<MapCatPin[]>([]);
  const [profile, setProfile] = useState<{ xp: number; level: number; xpProgress: { current: number; required: number; progress: number } } | null>(null);
  const [region, setRegion] = useState(SF_REGION);

  useEffect(() => {
    loadData();
    requestLocation();
  }, []);

  async function requestLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const loc = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      });
    }
  }

  async function loadData() {
    try {
      const [cats, me] = await Promise.all([api.getMapCats(), api.getProfile()]);
      setPins(cats);
      setProfile(me);
    } catch (e) {
      console.warn('Failed to load map data', e);
    }
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton
        customMapStyle={darkMapStyle}
      >
        {pins.map((pin) => (
          <MapMarker key={pin.id} pin={pin} onPress={() => router.push(`/cat/${pin.id}`)} />
        ))}
      </MapView>

      <View style={styles.header}>
        <Text style={styles.logo}>🐾 CatDex</Text>
        {profile && (
          <View style={styles.xpContainer}>
            <XPBar
              current={profile.xpProgress.current}
              required={profile.xpProgress.required}
              progress={profile.xpProgress.progress}
              level={profile.level}
            />
          </View>
        )}
        <TouchableOpacity style={styles.leaderboardBtn} onPress={() => router.push('/leaderboard')}>
          <Ionicons name="trophy" size={22} color={Colors.gold} />
        </TouchableOpacity>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={styles.silhouetteSmall}><Text>🐱</Text></View>
          <Text style={styles.legendText}>Unknown</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendText}>3D = Known</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.goldDot} />
          <Text style={styles.legendText}>Popular</Text>
        </View>
      </View>
    </View>
  );
}

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#a0a0b8' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f0f1a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2d2d44' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f3460' }] },
];

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  header: {
    position: 'absolute',
    top: 50,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface + 'ee',
    borderRadius: 16,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  logo: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text },
  xpContainer: { flex: 1 },
  leaderboardBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerContainer: { alignItems: 'center' },
  popularMarker: {
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Colors.gold,
    padding: 2,
  },
  markerName: {
    color: Colors.text,
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: Colors.surface + 'cc',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 2,
  },
  silhouette: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  silhouetteIcon: { fontSize: 20, opacity: 0.3 },
  silhouetteSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: {
    position: 'absolute',
    bottom: 24,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.surface + 'ee',
    borderRadius: 12,
    padding: Spacing.sm,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendText: { color: Colors.textSecondary, fontSize: FontSize.sm },
  goldDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.gold },
});
