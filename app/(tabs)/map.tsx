import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Text } from '@/components/Text';
import { CatMap } from '@/components/maps/CatMap';
import { isInParis20e, PARIS_20E } from '@/lib/constants';
import { themeFromColorLabel, themeSoft } from '@/lib/catTheme';
import { useAuthStore } from '@/store/auth';
import { useCatsStore } from '@/store/cats';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

type FilterId = 'nearby' | 'rare' | 'seen';

/**
 * Explorer — HUD from design: avatar · CatDex · bell, then À proximité + filters.
 */
export default function MapScreen() {
  const { colors, fonts, spacing, radius, iconStroke, iconSize, shadow } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const cats = useCatsStore((state) => state.cats);
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

  const filteredCats = cats.filter((cat) => {
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
  });
  const nearby = filteredCats[0] ?? cats[0] ?? null;
  const nearbyTheme = nearby ? themeFromColorLabel(nearby.analysis.color, nearby.number) : null;
  const initials = (user?.displayName ?? 'C').slice(0, 2).toUpperCase();

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
        {/* Top bar: avatar · CatDex · notifications */}
        <View style={styles.topBar} pointerEvents="box-none">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Profil"
            onPress={() => router.push('/(tabs)/profile')}
            style={({ pressed }) => [
              styles.avatarWrap,
              {
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <Avatar size="L" initials={initials} />
            {cats.length > 0 ? (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: colors.accent,
                    borderColor: colors.surface,
                    minWidth: spacing[24],
                    height: spacing[24],
                    borderRadius: radius.full,
                    paddingHorizontal: spacing[4],
                  },
                ]}
              >
                <Text
                  variant="caption"
                  style={{
                    color: colors.onAccent,
                    fontFamily: fonts.bodySemi,
                    fontSize: 10,
                    lineHeight: 12,
                  }}
                >
                  {cats.length > 99 ? '99+' : String(cats.length)}
                </Text>
              </View>
            ) : null}
          </Pressable>

          <View style={styles.wordmark} pointerEvents="none">
            <Text
              variant="h2"
              align="center"
              color="textBrand"
              style={{ fontFamily: fonts.display }}
            >
              CatDex
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: spacing[8], zIndex: 2 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              onPress={() => void recenter()}
              style={({ pressed }) => [
                {
                  width: spacing[48],
                  height: spacing[48],
                  borderRadius: radius.full,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.88 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
                shadow.low,
              ]}
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
            </Pressable>

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
                  backgroundColor: filtersOpen ? colors.accentSoft : colors.surface,
                  borderWidth: 1,
                  borderColor: filtersOpen ? colors.accent : colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.88 : 1,
                },
                shadow.low,
              ]}
            >
              <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M4 6h16M7 12h10M10 18h4"
                  stroke={filtersOpen ? colors.accent : colors.brand}
                  strokeWidth={iconStroke.regular}
                  strokeLinecap="round"
                />
              </Svg>
            </Pressable>
          </View>
        </View>

        {/* Secondary: À proximité chip (mock layout) */}
        <View style={styles.filterRow} pointerEvents="box-none">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="À proximité"
            onPress={() => {
              setFilter('nearby');
              void recenter();
            }}
            style={({ pressed }) => [
              {
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing[8],
                paddingHorizontal: spacing[16],
                paddingVertical: spacing[8],
                borderRadius: radius.sm,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: filter === 'nearby' ? colors.accent : colors.border,
                opacity: pressed ? 0.92 : 1,
              },
              shadow.low,
            ]}
          >
            <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z"
                stroke={colors.accent}
                strokeWidth={iconStroke.regular}
                strokeLinejoin="round"
              />
              <Circle cx="12" cy="10" r="2.5" fill={colors.accent} />
            </Svg>
            <Text variant="bodySmall" color="textBrand" style={{ fontFamily: fonts.bodySemi }}>
              À proximité
            </Text>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Path
                d="M6 9l6 6 6-6"
                stroke={colors.textMuted}
                strokeWidth={iconStroke.regular}
                strokeLinecap="round"
                strokeLinejoin="round"
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

      {!sheetVisible && nearby && nearbyTheme ? (
        <Pressable
          onPress={() => {
            setSelected(nearby);
            setSheetVisible(true);
          }}
          style={({ pressed }) => [
            styles.nearbyCard,
            {
              bottom: insets.bottom + spacing[96],
              marginHorizontal: spacing[24],
              backgroundColor: colors.surface,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing[16],
              opacity: pressed ? 0.96 : 1,
              transform: [{ scale: pressed ? 0.99 : 1 }],
            },
            shadow.low,
          ]}
        >
          <Image
            source={{ uri: nearby.photoUri }}
            style={{
              width: spacing[64],
              height: spacing[64],
              borderRadius: radius.md,
              backgroundColor: themeSoft(nearbyTheme, 'light'),
            }}
          />
          <View style={{ flex: 1, gap: spacing[8] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[8] }}>
              <Text
                variant="body"
                color="textBrand"
                style={{ fontFamily: fonts.bodySemi }}
                numberOfLines={1}
              >
                {nearby.name}
              </Text>
              <Badge
                label={nearby.analysis.coat || 'Chat'}
                color={nearbyTheme.badge}
                backgroundColor={`${nearbyTheme.hex}22`}
              />
            </View>
            <Text variant="caption" color="textSecondary" numberOfLines={1}>
              {nearby.analysis.breed} · {nearby.analysis.color}
            </Text>
            <Text variant="caption" color="textMuted">
              Nouveau signalement à proximité
            </Text>
          </View>
        </Pressable>
      ) : null}

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
    justifyContent: 'space-between',
  },
  avatarWrap: {
    position: 'relative',
    zIndex: 2,
  },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  wordmark: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  filterPanel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  nearbyCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
});
