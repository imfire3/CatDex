import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Text } from '@/components/Text';
import { CatMap } from '@/components/maps/CatMap';
import { distanceMeters, isInParis20e, PARIS_20E } from '@/lib/constants';
import { DEMO_CATS } from '@/lib/demoCats';
import { useCatsStore } from '@/store/cats';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

type FilterId = 'nearby' | 'rare' | 'seen' | 'all';

function sortByDistance(
  list: Cat[],
  origin: { latitude: number; longitude: number },
): Cat[] {
  return [...list].sort(
    (a, b) =>
      distanceMeters(origin.latitude, origin.longitude, a.latitude, a.longitude) -
      distanceMeters(origin.latitude, origin.longitude, b.latitude, b.longitude),
  );
}

/**
 * Explorer — clean 3D map: search, filter, locate (mock style).
 */
export default function MapScreen() {
  const { colors, fonts, spacing, radius, iconStroke, iconSize, shadow } = useTheme();
  const insets = useSafeAreaInsets();
  const storedCats = useCatsStore((state) => state.cats);
  const cats = __DEV__ && storedCats.length === 0 ? DEMO_CATS : storedCats;
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

  const origin = userCoordinate ?? PARIS_20E.center;
  const filteredCats = sortByDistance(
    cats.filter((cat) => {
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const hay = `${cat.name} ${cat.analysis.color} ${cat.analysis.breed}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filter === 'rare') {
        const coat = cat.analysis.coat?.toLowerCase() ?? '';
        const color = cat.analysis.color?.toLowerCase() ?? '';
        return (
          coat.includes('long') ||
          color.includes('siamois') ||
          color.includes('écaille') ||
          color.includes('bengal')
        );
      }
      if (filter === 'seen') return cat.views > 0;
      if (filter === 'nearby') return true;
      return true;
    }),
    origin,
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted' || !mounted) return;
      const position = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = position.coords;
      if (mounted) setUserCoordinate({ latitude, longitude });
      if (!isInParis20e(latitude, longitude) && mounted && __DEV__) {
        Alert.alert(
          'Hors du 20e',
          'Tu es hors de la zone de test (Paris 20e). En développement, les captures restent autorisées.',
        );
      }
    })().catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, []);

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
      // fallback
    }
    setFocusCoordinate({ ...PARIS_20E.center });
  };

  return (
    <View style={styles.root}>
      <CatMap
        cats={filteredCats}
        scheme="light"
        focusCoordinate={focusCoordinate}
        userCoordinate={userCoordinate}
        onSelectCat={(item) => {
          setSelected(item);
          setSheetVisible(true);
        }}
      />

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
            bottom: insets.bottom + spacing[96] + spacing[8],
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
  root: { flex: 1 },
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
    zIndex: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
