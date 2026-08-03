import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/Button';
import { CatSprite } from '@/components/CatSprite';
import { Chip } from '@/components/Chip';
import { ProgressBar } from '@/components/Progress/ProgressBar';
import { Text } from '@/components/Text';
import { CatMap } from '@/components/maps/CatMap';
import { getMapHudBottom } from '@/layout/tabBarMetrics';
import { DEMO_CATS } from '@/lib/demoCats';
import {
  CATDEX_TARGET,
  formatDistanceMeters,
  PARIS_20E,
} from '@/lib/constants';
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

type FilterId = 'nearby' | 'rare' | 'seen';

const HUD_CONTROL_SIZE = 40;
const NEARBY_BUTTON_HEIGHT = 40;

export default function MapScreen() {
  const { colors, fonts, spacing, radius, iconStroke, iconSize, shadow } = useTheme();
  const insets = useSafeAreaInsets();
  const storedCats = useCatsStore((state) => state.cats);
  const setHasNearbyCat = useMapExploreStore((state) => state.setHasNearbyCat);

  const mapCats = storedCats.length > 0 ? storedCats : __DEV__ ? DEMO_CATS : [];

  const [selected, setSelected] = useState<Cat | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [nearbySheetVisible, setNearbySheetVisible] = useState(false);
  const [filter, setFilter] = useState<FilterId>('nearby');
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
  const collectionCount = storedCats.length > 0 ? storedCats.length : __DEV__ ? mapCats.length : 0;

  const sortedCats = useMemo(
    () => sortCatsByDistance(mapCats, userCoordinate),
    [mapCats, userCoordinate],
  );

  const filteredCats = useMemo(() => {
    return sortedCats.filter(({ cat, distanceM }) => {
      if (filter === 'rare') return isRareCat(cat);
      if (filter === 'seen') return cat.views > 0;
      if (filter === 'nearby') return distanceM <= DISCOVERY_RADIUS_M;
      return true;
    });
  }, [filter, sortedCats]);

  const nearbyCats = useMemo(
    () => sortedCats.filter(({ distanceM }) => distanceM <= DISCOVERY_RADIUS_M),
    [sortedCats],
  );

  const nearest = filteredCats[0] ?? sortedCats[0] ?? null;
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
    if (!nearest || nearest.distanceM > PROXIMITY_ALERT_M) {
      setHasNearbyCat(false);
      return;
    }
    setHasNearbyCat(true);
    if (lastHapticCatRef.current !== nearest.cat.id) {
      lastHapticCatRef.current = nearest.cat.id;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [nearest, setHasNearbyCat]);

  const recenter = async () => {
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

  const hudControlStyle = {
    width: HUD_CONTROL_SIZE,
    height: HUD_CONTROL_SIZE,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  const recenterBottom = getMapHudBottom(insets.bottom, spacing);

  return (
    <View style={styles.root}>
      <View style={StyleSheet.absoluteFill}>
        <CatMap
          cats={filteredCats.map(({ cat }) => cat)}
          scheme="light"
          focusCoordinate={focusCoordinate}
          userCoordinate={userCoordinate}
          nearbyCatIds={nearbyCatIds}
          onSelectCat={(item) => {
            setSelected(item);
            setSheetVisible(true);
          }}
        />
      </View>

      <View
        pointerEvents="box-none"
        style={[
          styles.hud,
          {
            paddingTop: insets.top + spacing[8],
            paddingHorizontal: spacing[16],
            gap: spacing[8],
          },
        ]}
      >
        <View style={styles.topBar} pointerEvents="box-none">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Chats à proximité"
            onPress={() => setNearbySheetVisible(true)}
            style={({ pressed }) => [
              {
                height: NEARBY_BUTTON_HEIGHT,
                borderRadius: radius.full,
                backgroundColor: colors.surfaceElevated,
                paddingHorizontal: spacing[16],
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.88 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <Text variant="caption" color="textBrand" style={{ fontFamily: fonts.bodySemi }}>
              À proximité
              {nearbyCats.length > 0 ? ` · ${nearbyCats.length}` : ''}
            </Text>
          </Pressable>

          <View style={styles.progressBlock}>
            <Text variant="caption" color="textBrand" style={{ fontFamily: fonts.bodySemi }}>
              {collectionCount} / {CATDEX_TARGET} chats
            </Text>
            <ProgressBar
              progress={collectionCount / CATDEX_TARGET}
              height={6}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Filtres"
            accessibilityState={{ selected: filtersOpen }}
            onPress={() => setFiltersOpen((open) => !open)}
            style={({ pressed }) => [
              hudControlStyle,
              filtersOpen
                ? {
                    backgroundColor: colors.brandSoft,
                  }
                : null,
              {
                opacity: pressed ? 0.88 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <Svg width={iconSize.md} height={iconSize.md} viewBox="0 0 24 24" fill="none">
              <Path
                d="M4 6h16M7 12h10M10 18h4"
                stroke={colors.brand}
                strokeWidth={iconStroke.regular}
                strokeLinecap="round"
              />
            </Svg>
          </Pressable>
        </View>

        {filtersOpen ? (
          <View style={[styles.filterPanel, { gap: spacing[8] }]}>
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

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Recentrer la carte"
        onPress={() => void recenter()}
        style={({ pressed }) => [
          hudControlStyle,
          styles.recenterButton,
          shadow.low,
          {
            right: spacing[16],
            bottom: recenterBottom,
            backgroundColor: colors.surface,
            opacity: pressed ? 0.88 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <Svg width={iconSize.md} height={iconSize.md} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2l7 19-7-4-7 4 7-19z"
            stroke={colors.brand}
            strokeWidth={iconStroke.regular}
            strokeLinejoin="round"
            strokeLinecap="round"
            transform="rotate(45 12 12)"
          />
        </Svg>
      </Pressable>

      <BottomSheet
        visible={nearbySheetVisible}
        onClose={() => setNearbySheetVisible(false)}
      >
        <View style={{ gap: spacing[16] }}>
          <Text variant="h3" color="textBrand">
            À proximité
          </Text>
          {nearbyCats.length === 0 ? (
            <Text variant="bodySmall" color="textSecondary">
              Aucun chat dans un rayon de {formatDistanceMeters(DISCOVERY_RADIUS_M)} pour le moment.
            </Text>
          ) : (
            <ScrollView
              style={{ maxHeight: spacing[96] * 4 }}
              contentContainerStyle={{ gap: spacing[8] }}
              showsVerticalScrollIndicator={false}
            >
              {nearbyCats.map(({ cat, distanceM }) => (
                <Pressable
                  key={cat.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${cat.name}, ${formatDistanceMeters(distanceM)}`}
                  onPress={() => {
                    setNearbySheetVisible(false);
                    setSelected(cat);
                    setSheetVisible(true);
                  }}
                  style={({ pressed }) => [
                    styles.nearbyCard,
                    {
                      gap: spacing[8],
                      paddingHorizontal: spacing[8],
                      paddingVertical: spacing[8],
                      borderRadius: radius.cta,
                      backgroundColor: colors.surfaceSecondary,
                      opacity: pressed ? 0.96 : 1,
                      transform: [{ scale: pressed ? 0.99 : 1 }],
                    },
                  ]}
                >
                  <View
                    style={{
                      width: spacing[40],
                      height: spacing[40],
                      borderRadius: radius.full,
                      backgroundColor: colors.surfaceElevated,
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    <CatSprite
                      colorLabel={cat.analysis.color}
                      seed={cat.number}
                      size={spacing[32]}
                      faceOnly
                    />
                  </View>
                  <View style={{ flex: 1, gap: spacing[4] }}>
                    <Text variant="bodySmall" color="text" style={{ fontFamily: fonts.bodySemi }}>
                      {cat.name}
                    </Text>
                    <Text variant="caption" color="textSecondary">
                      {isRareCat(cat) ? 'Rare' : cat.analysis.color} · {formatDistanceMeters(distanceM)}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
      </BottomSheet>

      <BottomSheet
        visible={sheetVisible}
        onClose={() => {
          setSheetVisible(false);
          setSelected(null);
        }}
      >
        {selected ? (
          <View style={{ gap: spacing[16] }}>
            <Text variant="h2" color="textBrand">
              {selected.name}
            </Text>
            <Text variant="bodySmall" color="textSecondary">
              {selected.analysis.breed} · {selected.analysis.color}
            </Text>
            <Text variant="body" color="textBody" numberOfLines={3}>
              {selected.analysis.description}
            </Text>
            <Button
              title="Voir la fiche"
              onPress={() => {
                setSheetVisible(false);
                router.push(`/cat/${selected.id}`);
              }}
            />
          </View>
        ) : null}
      </BottomSheet>
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
  progressBlock: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  filterPanel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  nearbyCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recenterButton: {
    position: 'absolute',
    zIndex: 15,
  },
});
