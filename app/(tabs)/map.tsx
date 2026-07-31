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
import { MapHudSpacer, MapSideButton } from '@/components/maps/MapSideButton';
import { isInParis20e, PARIS_20E } from '@/lib/constants';
import { themeFromColorLabel, themeSoft } from '@/lib/catTheme';
import { useAuthStore } from '@/store/auth';
import { useCatsStore } from '@/store/cats';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

type FilterId = 'nearby' | 'rare' | 'seen';

/**
 * Explore map — reference HUD: avatar + CatDex wordmark + vertical side actions.
 */
export default function MapScreen() {
  const { colors, fonts, scheme, spacing, radius, iconStroke, iconSize } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const cats = useCatsStore((state) => state.cats);
  const [selected, setSelected] = useState<Cat | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [filter, setFilter] = useState<FilterId>('nearby');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mapScheme, setMapScheme] = useState<'light' | 'dark'>(scheme);
  const [focusCoordinate, setFocusCoordinate] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const nearby = cats[0] ?? null;
  const nearbyTheme = nearby ? themeFromColorLabel(nearby.analysis.color, nearby.number) : null;
  const initials = (user?.displayName ?? 'C').slice(0, 2).toUpperCase();
  const avatarSource = nearby?.photoUri ? { uri: nearby.photoUri } : undefined;

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted' || !mounted) return;
      const position = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = position.coords;
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
        setFocusCoordinate({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
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
        cats={cats}
        scheme={mapScheme}
        focusCoordinate={focusCoordinate}
        onSelectCat={(item) => {
          setSelected(item);
          setSheetVisible(true);
        }}
      />

      {/* Top HUD */}
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
        <View style={styles.topBar} pointerEvents="box-none">
          {/* Avatar */}
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
            <Avatar size="L" source={avatarSource} initials={initials} />
            {cats.length > 0 ? (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: colors.brand,
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
                    color: colors.onBrand,
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

          {/* Wordmark */}
          <View style={styles.wordmark} pointerEvents="none">
            <Text
              variant="h2"
              align="center"
              style={{ fontFamily: fonts.display, color: colors.text }}
            >
              Cat
              <Text
                variant="h2"
                style={{ fontFamily: fonts.display, color: colors.accent }}
              >
                Dex
              </Text>
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing[4],
                marginTop: spacing[4],
              }}
            >
              <View style={{ flex: 1, height: 1, backgroundColor: colors.border, maxWidth: 40 }} />
              <Svg width={14} height={10} viewBox="0 0 14 10" fill="none">
                <Path
                  d="M1 4h4M9 4h4M7 1v3M5 7c.8 1.2 2.2 1.2 3 0"
                  stroke={colors.brand}
                  strokeWidth={1.4}
                  strokeLinecap="round"
                />
              </Svg>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.border, maxWidth: 40 }} />
            </View>
          </View>

          <MapHudSpacer />
        </View>

        {/* Vertical side actions — top right */}
        <View
          style={[
            styles.sideActions,
            {
              top: insets.top + spacing[8],
              right: spacing[16],
              gap: spacing[8],
            },
          ]}
        >
          <MapSideButton
            accessibilityLabel={
              mapScheme === 'light' ? 'Passer en carte sombre' : 'Passer en carte claire'
            }
            onPress={() => setMapScheme((s) => (s === 'light' ? 'dark' : 'light'))}
            icon={
              mapScheme === 'light' ? (
                <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
                  <Circle
                    cx="12"
                    cy="12"
                    r="4"
                    stroke={colors.brand}
                    strokeWidth={iconStroke.regular}
                  />
                  <Path
                    d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
                    stroke={colors.brand}
                    strokeWidth={iconStroke.regular}
                    strokeLinecap="round"
                  />
                </Svg>
              ) : (
                <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5Z"
                    stroke={colors.brand}
                    strokeWidth={iconStroke.regular}
                    strokeLinejoin="round"
                  />
                </Svg>
              )
            }
          />
          <MapSideButton
            accessibilityLabel="Recentrer la carte"
            onPress={() => void recenter()}
            icon={
              <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
                <Circle
                  cx="12"
                  cy="12"
                  r="3"
                  stroke={colors.brand}
                  strokeWidth={iconStroke.regular}
                />
                <Path
                  d="M12 3v3M12 18v3M3 12h3M18 12h3"
                  stroke={colors.brand}
                  strokeWidth={iconStroke.regular}
                  strokeLinecap="round"
                />
                <Circle
                  cx="12"
                  cy="12"
                  r="8"
                  stroke={colors.brand}
                  strokeWidth={iconStroke.regular}
                />
              </Svg>
            }
          />
          <MapSideButton
            accessibilityLabel="Filtres"
            onPress={() => setFiltersOpen((open) => !open)}
            active={filtersOpen}
            icon={
              <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M4 6h16M7 12h10M10 18h4"
                  stroke={filtersOpen ? colors.accent : colors.brand}
                  strokeWidth={iconStroke.regular}
                  strokeLinecap="round"
                />
              </Svg>
            }
          />
        </View>

        {filtersOpen ? (
          <View
            style={[
              styles.filterPanel,
              {
                marginTop: spacing[16],
                marginRight: spacing[56],
                gap: spacing[8],
              },
            ]}
          >
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
              gap: spacing[16],
              opacity: pressed ? 0.96 : 1,
              transform: [{ scale: pressed ? 0.99 : 1 }],
            },
          ]}
        >
          <Image
            source={{ uri: nearby.photoUri }}
            style={{
              width: spacing[64],
              height: spacing[64],
              borderRadius: radius.md,
              backgroundColor: themeSoft(nearbyTheme),
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
  sideActions: {
    position: 'absolute',
    zIndex: 12,
    alignItems: 'center',
  },
  filterPanel: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  nearbyCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
