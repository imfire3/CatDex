import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { Badge } from '@/components/Badge';
import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Text } from '@/components/Text';
import { CatMap } from '@/components/maps/CatMap';
import {
  distanceMeters,
  formatCaptureTime,
  formatDexNumber,
  formatDistanceMeters,
  isInParis20e,
} from '@/lib/constants';
import { themeFromColorLabel, themeSoft } from '@/lib/catTheme';
import { useCatsStore } from '@/store/cats';
import { useToastStore } from '@/store/toast';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

type UserCoords = { latitude: number; longitude: number };

export default function MapScreen() {
  const { colors, fonts, scheme, spacing, radius, shadow, iconStroke, iconSize } = useTheme();
  const insets = useSafeAreaInsets();
  const cats = useCatsStore((state) => state.cats);
  const showToast = useToastStore((state) => state.show);
  const [selected, setSelected] = useState<Cat | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [userCoords, setUserCoords] = useState<UserCoords | null>(null);

  const filteredCats = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cats;
    return cats.filter((cat) => {
      const haystack = [
        cat.name,
        cat.analysis.breed,
        cat.analysis.color,
        cat.analysis.coat,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [cats, query]);

  const nearby = useMemo(() => {
    if (filteredCats.length === 0) return null;
    if (!userCoords) {
      return [...filteredCats].sort(
        (a, b) => new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime(),
      )[0];
    }
    return [...filteredCats].sort(
      (a, b) =>
        distanceMeters(userCoords.latitude, userCoords.longitude, a.latitude, a.longitude) -
        distanceMeters(userCoords.latitude, userCoords.longitude, b.latitude, b.longitude),
    )[0];
  }, [filteredCats, userCoords]);

  const nearbyTheme = nearby ? themeFromColorLabel(nearby.analysis.color, nearby.number) : null;
  const nearbyDistance =
    nearby && userCoords
      ? distanceMeters(
          userCoords.latitude,
          userCoords.longitude,
          nearby.latitude,
          nearby.longitude,
        )
      : null;

  const selectedTheme = selected
    ? themeFromColorLabel(selected.analysis.color, selected.number)
    : null;
  const selectedDistance =
    selected && userCoords
      ? distanceMeters(
          userCoords.latitude,
          userCoords.longitude,
          selected.latitude,
          selected.longitude,
        )
      : null;

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted' || !mounted) return;
      const position = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = position.coords;
      if (!mounted) return;
      setUserCoords({ latitude, longitude });
      if (!isInParis20e(latitude, longitude) && __DEV__) {
        showToast({
          title: 'Hors du 20e',
          description: 'Zone de test : les captures restent autorisées en développement.',
          tone: 'warning',
        });
      }
    })().catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, [showToast]);

  const handleSelectCat = (item: Cat) => {
    setSelected(item);
    setSheetVisible(true);
  };

  const handleCloseSheet = () => {
    setSheetVisible(false);
    setSelected(null);
  };

  const handleOpenDetails = () => {
    if (!selected) return;
    setSheetVisible(false);
    router.push(`/cat/${selected.id}`);
  };

  return (
    <View style={styles.root}>
      <CatMap
        cats={filteredCats}
        scheme={scheme}
        selectedCatId={selected?.id ?? null}
        onSelectCat={handleSelectCat}
      />

      <View
        pointerEvents="box-none"
        style={[
          styles.hud,
          {
            paddingTop: insets.top + spacing[8],
            paddingHorizontal: spacing[24],
            gap: spacing[8],
          },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[8] }}>
          <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z"
              stroke={colors.text}
              strokeWidth={iconStroke.regular}
              strokeLinejoin="round"
            />
            <Path
              d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
              stroke={colors.text}
              strokeWidth={iconStroke.regular}
            />
          </Svg>
          <Text variant="h3">Paris 20e</Text>
        </View>

        <View
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing[8],
              backgroundColor: colors.glassFill,
              borderRadius: radius.full,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: spacing[16],
              minHeight: spacing[48],
            },
            shadow.small,
          ]}
        >
          <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
            <Path
              d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15ZM16.5 16.5 21 21"
              stroke={colors.textSecondary}
              strokeWidth={iconStroke.regular}
              strokeLinecap="round"
            />
          </Svg>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher un chat…"
            placeholderTextColor={colors.placeholder}
            accessibilityLabel="Rechercher un chat"
            style={{
              flex: 1,
              color: colors.text,
              fontFamily: fonts.body,
              fontSize: 16,
              paddingVertical: spacing[8],
            }}
          />
        </View>
      </View>

      {cats.length === 0 && !sheetVisible ? (
        <View
          pointerEvents="box-none"
          style={[
            styles.emptyWrap,
            {
              bottom: insets.bottom + spacing[96],
              paddingHorizontal: spacing[24],
            },
          ]}
        >
          <EmptyState
            title="Aucun chat découvert ici"
            description="Pars explorer ton quartier et capture ton premier chat."
            actionLabel="Scanner un chat"
            onAction={() => router.push('/scanner')}
          />
        </View>
      ) : null}

      {!sheetVisible && nearby && nearbyTheme && cats.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Chat à proximité, ${nearby.name}`}
          onPress={() => handleSelectCat(nearby)}
          style={({ pressed }) => [
            styles.nearbyCard,
            {
              bottom: insets.bottom + spacing[96],
              marginHorizontal: spacing[24],
              backgroundColor: colors.surface,
              borderRadius: radius.xl,
              padding: spacing[16],
              opacity: pressed ? 0.96 : 1,
              transform: [{ scale: pressed ? 0.985 : 1 }],
            },
            shadow.medium,
          ]}
        >
          <Image
            source={{ uri: nearby.photoUri }}
            style={{
              width: spacing[64],
              height: spacing[64],
              borderRadius: radius.full,
              borderWidth: 2,
              borderColor: nearbyTheme.hex,
              backgroundColor: themeSoft(nearbyTheme, scheme),
            }}
          />
          <View style={{ flex: 1, gap: spacing[4] }}>
            <Text variant="body" style={{ fontFamily: fonts.bodySemi }} numberOfLines={1}>
              {nearby.name || 'Chat inconnu'}
            </Text>
            <Text variant="caption" color="textSecondary" numberOfLines={1}>
              {formatDexNumber(nearby.number)} · {nearby.analysis.breed}
            </Text>
            <Text variant="caption" color="textSecondary">
              {nearbyDistance != null
                ? `À ${formatDistanceMeters(nearbyDistance)}`
                : 'Découverte récente'}
            </Text>
          </View>
        </Pressable>
      ) : null}

      <BottomSheet visible={sheetVisible} onClose={handleCloseSheet}>
        {selected && selectedTheme ? (
          <View style={{ gap: spacing[16] }}>
            <View style={{ flexDirection: 'row', gap: spacing[16], alignItems: 'center' }}>
              <Image
                source={{ uri: selected.photoUri }}
                style={{
                  width: spacing[96],
                  height: spacing[96],
                  borderRadius: radius.full,
                  borderWidth: 3,
                  borderColor: selectedTheme.hex,
                  backgroundColor: themeSoft(selectedTheme, scheme),
                }}
              />
              <View style={{ flex: 1, gap: spacing[4] }}>
                <Text variant="label" color="accent">
                  CatDex {formatDexNumber(selected.number)}
                </Text>
                <Text variant="h2" numberOfLines={1}>
                  {selected.name?.trim() || 'Chat inconnu'}
                </Text>
                <Text variant="bodySmall" color="textSecondary">
                  {selected.analysis.breed} · {selected.analysis.color}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[8] }}>
              <Badge
                label={selected.analysis.coat || 'Chat'}
                color={selectedTheme.badge}
                backgroundColor={`${selectedTheme.hex}33`}
              />
              {selectedDistance != null ? (
                <Badge
                  label={formatDistanceMeters(selectedDistance)}
                  color={colors.sky}
                  backgroundColor={colors.skySoft}
                />
              ) : null}
            </View>

            <Text variant="caption" color="textSecondary">
              Découvert le {formatCaptureTime(selected.discoveredAt)}
            </Text>

            <Text variant="body" color="textBody" numberOfLines={3}>
              {selected.analysis.description}
            </Text>

            <Button title="Voir la fiche" onPress={handleOpenDetails} />
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
  emptyWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 15,
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
