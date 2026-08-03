import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { Avatar } from '@/components/Avatar';
import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { ProgressBar } from '@/components/Progress';
import { Text } from '@/components/Text';
import { CatMap } from '@/components/maps/CatMap';
import { CATDEX_TARGET, distanceMeters, isInParis20e, PARIS_20E } from '@/lib/constants';
import { DEMO_CATS } from '@/lib/demoCats';
import { useAuthStore } from '@/store/auth';
import { useCatsStore } from '@/store/cats';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

type FilterId = 'nearby' | 'rare' | 'seen';

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

function deriveLevel(catCount: number) {
  const level = Math.max(1, Math.floor(catCount / 2) + 1);
  const xpInLevel = (catCount % 2) * 125;
  return { level, xp: xpInLevel || (catCount === 0 ? 0 : 125), xpMax: 250 };
}

/**
 * Explorer — 3D map HUD: level/XP, filters, collection progress, weather, locate.
 */
export default function MapScreen() {
  const { colors, fonts, spacing, radius, iconStroke, iconSize, shadow } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const storedCats = useCatsStore((state) => state.cats);
  const cats = __DEV__ && storedCats.length === 0 ? DEMO_CATS : storedCats;
  const [selected, setSelected] = useState<Cat | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
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

  const origin = userCoordinate ?? PARIS_20E.center;
  const filteredCats = sortByDistance(
    cats.filter((cat) => {
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
      return true;
    }),
    origin,
  );

  const initials = (user?.displayName ?? 'C').slice(0, 2).toUpperCase();
  const collectionCount = storedCats.length || (__DEV__ ? cats.length : 0);
  const { level, xp, xpMax } = useMemo(
    () => deriveLevel(Math.max(storedCats.length, 1) * 2 + 11),
    [storedCats.length],
  );
  const collectionProgress = Math.min(1, collectionCount / CATDEX_TARGET);

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

  const recenterNearby = async () => {
    setFilter('nearby');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const position = await Location.getCurrentPositionAsync({});
        const next = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setUserCoordinate(next);
        const nearest = sortByDistance(filteredCats.length ? filteredCats : cats, next)[0];
        setFocusCoordinate(
          nearest
            ? { latitude: nearest.latitude, longitude: nearest.longitude }
            : next,
        );
        return;
      }
    } catch {
      // fallback
    }
    const nearest = sortByDistance(filteredCats.length ? filteredCats : cats, PARIS_20E.center)[0];
    setFocusCoordinate(
      nearest
        ? { latitude: nearest.latitude, longitude: nearest.longitude }
        : { ...PARIS_20E.center },
    );
  };

  return (
    <View style={styles.root}>
      <CatMap
        cats={filteredCats}
        scheme="light"
        focusCoordinate={focusCoordinate}
        userCoordinate={userCoordinate ?? PARIS_20E.center}
        onSelectCat={(item) => {
          setSelected(item);
          setSheetVisible(true);
        }}
      />

      <View
        pointerEvents="box-none"
        style={[
          styles.hud,
          {
            paddingTop: insets.top + spacing[8],
            paddingHorizontal: spacing[16],
            gap: spacing[16],
          },
        ]}
      >
        {/* Top: avatar + level/XP · bell + filter */}
        <View style={styles.topBar} pointerEvents="box-none">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Profil"
            onPress={() => router.push('/(tabs)/profile')}
            style={({ pressed }) => [
              {
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing[8],
                paddingRight: spacing[16],
                paddingVertical: spacing[8],
                paddingLeft: spacing[8],
                borderRadius: radius.full,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: pressed ? 0.92 : 1,
              },
              shadow.low,
            ]}
          >
            <Avatar size="M" initials={initials} />
            <View style={{ gap: spacing[4], minWidth: spacing[96] }}>
              <Text variant="caption" color="textBrand" style={{ fontFamily: fonts.bodySemi }}>
                Niveau {level}
              </Text>
              <ProgressBar progress={xp / xpMax} height={6} />
              <Text variant="caption" color="textMuted">
                {xp} / {xpMax} XP
              </Text>
            </View>
          </Pressable>

          <View style={{ flexDirection: 'row', gap: spacing[8] }}>
            <HudIconButton
              label="Notifications"
              onPress={() => void recenterOnPlayer()}
            >
              <Svg width={iconSize.md} height={iconSize.md} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M6 9a6 6 0 1 1 12 0c0 3.2 1.2 4.8 1.8 5.5.3.4 0 1.5-.8 1.5H5c-.8 0-1.1-1.1-.8-1.5C4.8 13.8 6 12.2 6 9Z"
                  stroke={colors.brand}
                  strokeWidth={iconStroke.regular}
                  strokeLinejoin="round"
                />
                <Path
                  d="M10 18a2 2 0 0 0 4 0"
                  stroke={colors.brand}
                  strokeWidth={iconStroke.regular}
                  strokeLinecap="round"
                />
              </Svg>
            </HudIconButton>

            <HudIconButton
              label="Filtres"
              selected={filtersOpen}
              onPress={() => setFiltersOpen((open) => !open)}
            >
              <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M4 7h16M7 12h10M10 17h4"
                  stroke={filtersOpen ? colors.onAccent : colors.brand}
                  strokeWidth={iconStroke.regular}
                  strokeLinecap="round"
                />
              </Svg>
            </HudIconButton>
          </View>
        </View>

        {/* Secondary: nearby · collection · weather */}
        <View style={styles.secondaryRow} pointerEvents="box-none">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="À proximité"
            onPress={() => void recenterNearby()}
            style={({ pressed }) => [
              {
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing[8],
                paddingHorizontal: spacing[16],
                paddingVertical: spacing[8],
                borderRadius: radius.full,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: pressed ? 0.92 : 1,
              },
              shadow.low,
            ]}
          >
            <Text variant="bodySmall" color="textBrand" style={{ fontFamily: fonts.bodySemi }}>
              À proximité
            </Text>
          </Pressable>

          <View
            style={[
              {
                flex: 1,
                paddingHorizontal: spacing[16],
                paddingVertical: spacing[8],
                borderRadius: radius.full,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                gap: spacing[4],
                alignItems: 'center',
              },
              shadow.low,
            ]}
          >
            <Text variant="caption" color="textBrand" style={{ fontFamily: fonts.bodySemi }}>
              {collectionCount} / {CATDEX_TARGET} chats
            </Text>
            <View style={{ width: '100%' }}>
              <ProgressBar progress={collectionProgress} height={4} />
            </View>
          </View>

          <View
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing[8],
                paddingHorizontal: spacing[16],
                paddingVertical: spacing[8],
                borderRadius: radius.full,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              },
              shadow.low,
            ]}
          >
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Circle cx="12" cy="12" r="4" fill={colors.yellow} />
              <Path
                d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"
                stroke={colors.yellow}
                strokeWidth={1.4}
                strokeLinecap="round"
              />
            </Svg>
            <Text variant="caption" color="textBrand" style={{ fontFamily: fonts.bodySemi }}>
              22°
            </Text>
          </View>
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

      {/* Locate control */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Recentrer sur ma position"
        onPress={() => void recenterOnPlayer()}
        style={({ pressed }) => [
          styles.locateBtn,
          {
            bottom: insets.bottom + spacing[96] + spacing[16],
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
            d="M12 3v3M12 18v3M3 12h3M18 12h3"
            stroke={colors.brand}
            strokeWidth={iconStroke.regular}
            strokeLinecap="round"
          />
          <Circle cx="12" cy="12" r="4" stroke={colors.brand} strokeWidth={iconStroke.regular} />
          <Circle cx="12" cy="12" r="1.5" fill={colors.brand} />
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

function HudIconButton({
  label,
  onPress,
  selected,
  children,
}: {
  label: string;
  onPress: () => void;
  selected?: boolean;
  children: ReactNode;
}) {
  const { colors, spacing, radius, shadow } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: spacing[48],
          height: spacing[48],
          borderRadius: radius.full,
          backgroundColor: selected ? colors.accent : colors.surface,
          borderWidth: 1,
          borderColor: selected ? colors.accent : colors.border,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.88 : 1,
        },
        shadow.low,
      ]}
    >
      {children}
    </Pressable>
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
    justifyContent: 'space-between',
  },
  secondaryRow: {
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
