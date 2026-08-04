import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { Chip } from '@/components/Chip';
import { CatMap } from '@/components/maps/CatMap';
import { MapCatModal } from '@/components/maps/MapCatModal';
import { getMapHudBottom } from '@/layout/tabBarMetrics';
import { PARIS_20E } from '@/lib/constants';
import {
  DISCOVERY_RADIUS_M,
  isRareCat,
  PROXIMITY_ALERT_M,
  sortCatsByDistance,
} from '@/lib/mapExplore';
import { useCatsStore } from '@/store/cats';
import { useMapExploreStore } from '@/store/mapExplore';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

type FilterId = 'nearby' | 'rare' | 'seen' | 'all';

/**
 * Explorer — Apple Maps-style HUD (search, filter, locate) with production
 * discovery radius, proximity haptics, and MapCatModal.
 */
export default function MapScreen() {
  const { colors, fonts, spacing, radius, iconStroke, iconSize, shadow } = useTheme();
  const insets = useSafeAreaInsets();
  const storedCats = useCatsStore((state) => state.cats);
  const setHasNearbyCat = useMapExploreStore((state) => state.setHasNearbyCat);

  const capturedIds = useMemo(() => new Set(storedCats.map((cat) => cat.id)), [storedCats]);

  /** Only cats the player actually captured — no demo samples on the map. */
  const mapCats = storedCats;

  const [selected, setSelected] = useState<Cat | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [filter, setFilter] = useState<FilterId>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [focusCoordinate, setFocusCoordinate] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [userCoordinate, setUserCoordinate] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const lastHapticCatRef = useRef<string | null>(null);
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
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const hay = `${cat.name} ${cat.analysis.color} ${cat.analysis.breed}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filter === 'rare') return isRareCat(cat);
      if (filter === 'seen') return cat.views > 0;
      if (filter === 'nearby') return distanceM <= DISCOVERY_RADIUS_M;
      return true;
    });
  }, [filter, query, sortedCats]);

  /** Proximity uses all cats — independent of search/filter UI state. */
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

  const recenterBottom = getMapHudBottom(insets.bottom, spacing);

  return (
    <View style={styles.root}>
      <View style={StyleSheet.absoluteFill}>
        <CatMap
          cats={visibleCats.map(({ cat }) => cat)}
          scheme="light"
          focusCoordinate={focusCoordinate}
          userCoordinate={userCoordinate}
          nearbyCatIds={nearbyCatIds}
          capturedCatIds={[...capturedIds]}
          onSelectCat={(item) => {
            setSelected(item);
            setSheetVisible(true);
          }}
        />
      </View>

      {/* Top HUD: Recherche + Filtre */}
      <View
        pointerEvents="box-none"
        style={[
          styles.hud,
          {
            paddingTop: insets.top + spacing[8],
            paddingHorizontal: spacing[16],
          },
        ]}
      >
        <View style={styles.topBar}>
          <View
            style={[
              {
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing[8],
                height: spacing[48],
                paddingHorizontal: spacing[16],
                borderRadius: radius.full,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              },
              shadow.low,
            ]}
          >
            <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
              <Circle
                cx="11"
                cy="11"
                r="6.5"
                stroke={colors.textMuted}
                strokeWidth={iconStroke.regular}
              />
              <Path
                d="M16.5 16.5 20 20"
                stroke={colors.textMuted}
                strokeWidth={iconStroke.regular}
                strokeLinecap="round"
              />
            </Svg>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Recherche"
              placeholderTextColor={colors.placeholder}
              accessibilityLabel="Recherche"
              style={{
                flex: 1,
                fontFamily: fonts.body,
                fontSize: 16,
                color: colors.text,
                paddingVertical: 0,
              }}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Filtres"
            accessibilityState={{ selected: filtersOpen }}
            onPress={() => setFiltersOpen((open) => !open)}
            style={({ pressed }) => [
              {
                width: spacing[48],
                height: spacing[48],
                borderRadius: radius.full,
                backgroundColor: filtersOpen ? colors.brand : colors.surface,
                borderWidth: 1,
                borderColor: filtersOpen ? colors.brand : colors.border,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.88 : 1,
              },
              shadow.low,
            ]}
          >
            <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
              <Path
                d="M4 7h16M7 12h10M10 17h4"
                stroke={filtersOpen ? colors.onBrand : colors.brand}
                strokeWidth={iconStroke.regular}
                strokeLinecap="round"
              />
            </Svg>
          </Pressable>
        </View>

        {filtersOpen ? (
          <View style={[styles.filterPanel, { gap: spacing[8], marginTop: spacing[8] }]}>
            <Chip
              label="Tous"
              selected={filter === 'all'}
              onPress={() => setFilter('all')}
            />
            <Chip
              label="À proximité"
              selected={filter === 'nearby'}
              onPress={() => setFilter('nearby')}
            />
            <Chip label="Rares" selected={filter === 'rare'} onPress={() => setFilter('rare')} />
            <Chip label="Vus" selected={filter === 'seen'} onPress={() => setFilter('seen')} />
          </View>
        ) : null}
      </View>

      {/* Locate */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Recentrer sur ma position"
        onPress={() => void recenterOnPlayer()}
        style={({ pressed }) => [
          styles.locateBtn,
          {
            bottom: recenterBottom,
            right: spacing[16],
            width: spacing[48],
            height: spacing[48],
            borderRadius: radius.full,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            opacity: pressed ? 0.88 : 1,
          },
          shadow.medium,
        ]}
      >
        <Svg width={iconSize.md} height={iconSize.md} viewBox="0 0 24 24" fill="none">
          <Path
            d="m12 3 2.2 6.2L20.5 11 14.2 13.2 12 19.5 9.8 13.2 3.5 11l6.3-1.8L12 3Z"
            fill={colors.brand}
          />
        </Svg>
      </Pressable>

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
          router.push(`/cat/${selected.id}`);
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  hud: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterPanel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  locateBtn: {
    position: 'absolute',
    zIndex: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
