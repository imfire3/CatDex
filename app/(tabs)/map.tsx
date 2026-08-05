import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip } from '@/components/Chip';
import { CatMap } from '@/components/maps/CatMap';
import { MapCatModal } from '@/components/maps/MapCatModal';
import { MapExplorerHud } from '@/components/maps/MapExplorerHud';
import { getMapSideToolsBottom } from '@/layout/tabBarMetrics';
import { PARIS_20E } from '@/lib/constants';
import {
  DISCOVERY_RADIUS_M,
  isRareCat,
  PROXIMITY_ALERT_M,
  sortCatsByDistance,
} from '@/lib/mapExplore';
import { buildWorldCats } from '@/lib/worldCats';
import { useCatsStore } from '@/store/cats';
import { useMapExploreStore } from '@/store/mapExplore';
import { useMissionsStore } from '@/store/missions';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

type FilterId = 'nearby' | 'rare' | 'seen' | 'all';

/**
 * Explorer — map + HUD matching the product mock
 * (right tools, Missions/Capture/Collection cluster, floating tab bar).
 */
export default function MapScreen() {
  const { colors, spacing, radius, shadow } = useTheme();
  const insets = useSafeAreaInsets();
  const storedCats = useCatsStore((state) => state.cats);
  const setHasNearbyCat = useMapExploreStore((state) => state.setHasNearbyCat);
  const missions = useMissionsStore((state) => state.missions);
  const openMissionCount = missions.filter((m) => !m.completed).length;

  const capturedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const cat of storedCats) {
      ids.add(cat.id);
      if (cat.sourceWorldId) ids.add(cat.sourceWorldId);
      if (cat.remoteId) ids.add(cat.remoteId);
    }
    return ids;
  }, [storedCats]);

  const [selected, setSelected] = useState<Cat | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [filter, setFilter] = useState<FilterId>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [focusCoordinate, setFocusCoordinate] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [userCoordinate, setUserCoordinate] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const lastHapticCatRef = useRef<string | null>(null);
  /** Freeze world spawn origin so pins don’t drift with GPS noise. */
  const worldAnchorRef = useRef<{ latitude: number; longitude: number } | null>(null);
  if (userCoordinate && !worldAnchorRef.current) {
    worldAnchorRef.current = userCoordinate;
  }

  /** Own CatDex + world spawns around the player (world pins stay uncaptured). */
  const mapCats = useMemo(() => {
    const anchor = worldAnchorRef.current ?? PARIS_20E.center;
    const world = buildWorldCats(anchor).filter((cat) => !capturedIds.has(cat.id));
    const byId = new Map<string, Cat>();
    for (const cat of [...storedCats, ...world]) byId.set(cat.id, cat);
    return [...byId.values()];
  }, [storedCats, userCoordinate, capturedIds]);

  const selectedCaptured = selected ? capturedIds.has(selected.id) : false;

  const sortedCats = useMemo(
    () => sortCatsByDistance(mapCats, userCoordinate),
    [mapCats, userCoordinate],
  );

  const selectedDistance = useMemo(() => {
    if (!selected) return null;
    const match = sortedCats.find((item) => item.cat.id === selected.id);
    return match?.distanceM ?? null;
  }, [selected, sortedCats]);

  const visibleCats = useMemo(() => {
    return sortedCats.filter(({ cat, distanceM }) => {
      if (filter === 'rare') return isRareCat(cat);
      if (filter === 'seen') return cat.views > 0;
      if (filter === 'nearby') return distanceM <= DISCOVERY_RADIUS_M;
      return true;
    });
  }, [filter, sortedCats]);

  const nearestForProximity = sortedCats[0] ?? null;
  const nearbyCatIds = useMemo(
    () =>
      sortedCats
        .filter(({ distanceM }) => distanceM <= PROXIMITY_ALERT_M)
        .map(({ cat }) => cat.id),
    [sortedCats],
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted' || !mounted) return;
      const position = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = position.coords;
      if (mounted) setUserCoordinate({ latitude, longitude });
    })().catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!nearestForProximity || nearestForProximity.distanceM > PROXIMITY_ALERT_M) {
      setHasNearbyCat(false);
      return;
    }
    setHasNearbyCat(true);
    if (lastHapticCatRef.current !== nearestForProximity.cat.id) {
      lastHapticCatRef.current = nearestForProximity.cat.id;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [nearestForProximity, setHasNearbyCat]);

  const recenterOnPlayer = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const position = await Location.getCurrentPositionAsync({});
        const next = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setUserCoordinate(next);
        setFocusCoordinate(next);
        return;
      }
    } catch {
      // fallback below
    }
    setFocusCoordinate({ ...PARIS_20E.center });
  };

  const goToNearestCat = () => {
    const nearest = sortedCats[0]?.cat;
    if (!nearest) return;
    setFocusCoordinate({
      latitude: nearest.latitude,
      longitude: nearest.longitude,
    });
    setSelected(nearest);
    setSheetVisible(true);
  };

  const filterPanelBottom = getMapSideToolsBottom(insets.bottom, spacing) + spacing[48] * 3 + spacing[32];

  const mapCatList = useMemo(
    () => visibleCats.map(({ cat }) => cat),
    [visibleCats],
  );
  const capturedCatIdList = useMemo(() => [...capturedIds], [capturedIds]);

  return (
    <View style={styles.root}>
      <View style={StyleSheet.absoluteFill}>
        <CatMap
          cats={mapCatList}
          scheme="light"
          focusCoordinate={focusCoordinate}
          userCoordinate={userCoordinate}
          nearbyCatIds={nearbyCatIds}
          capturedCatIds={capturedCatIdList}
          onSelectCat={(item) => {
            setSelected(item);
            setSheetVisible(true);
          }}
        />
      </View>

      <MapExplorerHud
        missionCount={openMissionCount}
        collectionCount={storedCats.length}
        filtersOpen={filtersOpen}
        captureHighlighted={Boolean(nearbyCatIds.length)}
        onToggleFilters={() => setFiltersOpen((open) => !open)}
        onRecenter={() => void recenterOnPlayer()}
        onNavigateNearest={goToNearestCat}
      />

      {filtersOpen ? (
        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            right: spacing[16],
            bottom: filterPanelBottom,
            left: spacing[16],
            zIndex: 25,
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
            gap: spacing[8],
          }}
        >
          <View
            style={[
              {
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: spacing[8],
                padding: spacing[8],
                borderRadius: radius.cta,
                backgroundColor: colors.surfaceElevated,
                maxWidth: '100%',
              },
              shadow.medium,
            ]}
          >
            <Chip label="Tous" selected={filter === 'all'} onPress={() => setFilter('all')} />
            <Chip
              label="À proximité"
              selected={filter === 'nearby'}
              onPress={() => setFilter('nearby')}
            />
            <Chip label="Rares" selected={filter === 'rare'} onPress={() => setFilter('rare')} />
            <Chip label="Vus" selected={filter === 'seen'} onPress={() => setFilter('seen')} />
          </View>
        </View>
      ) : null}

      <MapCatModal
        visible={sheetVisible}
        cat={selected}
        captured={selectedCaptured}
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
        onGoThere={() => {
          if (!selected) return;
          setFocusCoordinate({
            latitude: selected.latitude,
            longitude: selected.longitude,
          });
          setSheetVisible(false);
          setSelected(null);
        }}
        onCapture={() => {
          if (!selected) return;
          const worldId = selected.id.startsWith('world-') ? selected.id : undefined;
          setSheetVisible(false);
          setSelected(null);
          router.push({
            pathname: '/scanner',
            params: worldId ? { worldId } : undefined,
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
