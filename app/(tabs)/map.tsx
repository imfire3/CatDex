import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { GlassIconButton } from '@/components/GlassIconButton';
import { Text } from '@/components/Text';
import { CatMap } from '@/components/maps/CatMap';
import { isInParis20e } from '@/lib/constants';
import {
  rarityFromCat,
  rarityTokens,
  themeFromColorLabel,
  themeSoft,
} from '@/lib/catTheme';
import { useAuthStore } from '@/store/auth';
import { useCatsStore } from '@/store/cats';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

type FilterId = 'nearby' | 'rare' | 'seen';

/**
 * Explorer map — HUD hero: avatar · CatDex wordmark · bell.
 * Soft nearby card + sheet. No vertical side stacks.
 */
export default function MapScreen() {
  const { colors, fonts, scheme, spacing, radius, shadow, iconStroke, iconSize } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const cats = useCatsStore((state) => state.cats);
  const [selected, setSelected] = useState<Cat | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [filter, setFilter] = useState<FilterId>('nearby');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const nearby = cats[0] ?? null;
  const nearbyTheme = nearby ? themeFromColorLabel(nearby.analysis.color, nearby.number) : null;
  const nearbyRarity = nearby
    ? rarityTokens[rarityFromCat(nearby.analysis.color, nearby.analysis.coat, nearby.number)]
    : null;
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

  return (
    <View style={styles.root}>
      <CatMap
        cats={cats}
        scheme="light"
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
                  variant="tiny"
                  style={{
                    color: colors.onBrand,
                    fontFamily: fonts.bodySemi,
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
              style={{ fontFamily: fonts.display, color: colors.brand }}
            >
              Cat
              <Text
                variant="h2"
                style={{ fontFamily: fonts.display, color: colors.accent }}
              >
                Dex
              </Text>
            </Text>
          </View>

          <GlassIconButton
            accessibilityLabel="Notifications"
            onPress={() => undefined}
          >
            <Svg width={iconSize.md} height={iconSize.md} viewBox="0 0 24 24" fill="none">
              <Path
                d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z"
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
          </GlassIconButton>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing[8],
            flexWrap: 'wrap',
          }}
        >
          <Chip
            label="À proximité"
            selected={filter === 'nearby'}
            onPress={() => setFilter('nearby')}
          />
          <GlassIconButton
            accessibilityLabel="Filtres"
            onPress={() => setFiltersOpen((open) => !open)}
            style={{
              backgroundColor: filtersOpen ? colors.accentSoft : colors.glassFill,
              borderColor: filtersOpen ? colors.accent : colors.border,
            }}
          >
            <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
              <Path
                d="M4 6h16M7 12h10M10 18h4"
                stroke={filtersOpen ? colors.accent : colors.brand}
                strokeWidth={iconStroke.regular}
                strokeLinecap="round"
              />
            </Svg>
          </GlassIconButton>
          {filtersOpen ? (
            <>
              <Chip
                label="Rares"
                selected={filter === 'rare'}
                onPress={() => setFilter('rare')}
              />
              <Chip
                label="Vus"
                selected={filter === 'seen'}
                onPress={() => setFilter('seen')}
              />
            </>
          ) : null}
        </View>
      </View>

      {!sheetVisible && nearby && nearbyTheme && nearbyRarity ? (
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
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing[16],
              gap: spacing[16],
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
              backgroundColor: themeSoft(nearbyTheme, scheme),
            }}
          />
          <View style={{ flex: 1, gap: spacing[8] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[8] }}>
              <Text
                variant="title"
                color="textBrand"
                style={{ flex: 1 }}
                numberOfLines={1}
              >
                {nearby.name}
              </Text>
              <Badge
                label={nearbyRarity.label}
                color={nearbyRarity.foreground}
                backgroundColor={nearbyRarity.background}
              />
            </View>
            <Text variant="caption" color="textSecondary" numberOfLines={1}>
              {nearby.analysis.breed} · {nearby.analysis.color}
            </Text>
            <Text variant="tiny" color="textMuted">
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
          <SelectedCatSheet
            cat={selected}
            onOpenFiche={() => {
              setSheetVisible(false);
              router.push(`/cat/${selected.id}`);
            }}
          />
        ) : null}
      </BottomSheet>
    </View>
  );
}

function SelectedCatSheet({ cat, onOpenFiche }: { cat: Cat; onOpenFiche: () => void }) {
  const { scheme, spacing, radius } = useTheme();
  const theme = themeFromColorLabel(cat.analysis.color, cat.number);
  const rarity = rarityTokens[rarityFromCat(cat.analysis.color, cat.analysis.coat, cat.number)];

  return (
    <View style={{ gap: spacing[16] }}>
      <View style={{ flexDirection: 'row', gap: spacing[16], alignItems: 'center' }}>
        <Image
          source={{ uri: cat.photoUri }}
          style={{
            width: spacing[80],
            height: spacing[80],
            borderRadius: radius.card,
            backgroundColor: themeSoft(theme, scheme),
          }}
        />
        <View style={{ flex: 1, gap: spacing[8] }}>
          <Text variant="h3" color="textBrand">
            {cat.name}
          </Text>
          <Badge
            label={rarity.label}
            color={rarity.foreground}
            backgroundColor={rarity.background}
          />
          <Text variant="bodySmall" color="textSecondary">
            {cat.analysis.breed} · {cat.analysis.color}
          </Text>
        </View>
      </View>
      <Text variant="body" color="textBody" numberOfLines={3}>
        {cat.analysis.description}
      </Text>
      <Button title="Voir la fiche" onPress={onOpenFiche} />
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
  nearbyCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
