import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
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
import { Chip } from '@/components/Chip';
import { Text } from '@/components/Text';
import { CatMap } from '@/components/maps/CatMap';
import { isInParis20e } from '@/lib/constants';
import { themeFromColorLabel, themeSoft } from '@/lib/catTheme';
import { useCatsStore } from '@/store/cats';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

type FilterId = 'nearby' | 'rare' | 'seen';

export default function MapScreen() {
  const { colors, fonts, scheme, spacing, radius, shadow, iconStroke, iconSize } = useTheme();
  const insets = useSafeAreaInsets();
  const cats = useCatsStore((state) => state.cats);
  const [selected, setSelected] = useState<Cat | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [filter, setFilter] = useState<FilterId>('nearby');
  const [query, setQuery] = useState('');

  const nearby = cats[0] ?? null;
  const nearbyTheme = nearby ? themeFromColorLabel(nearby.analysis.color, nearby.number) : null;

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
        scheme={scheme}
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
            paddingHorizontal: spacing[24],
            gap: spacing[16],
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={{ gap: spacing[4], flex: 1 }}>
            <Text variant="label" color="accent">
              Exploring
            </Text>
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
              <Text variant="h2">Paris 20e</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: spacing[8] }}>
            <GlassIconButton
              onPress={() => undefined}
              accessibilityLabel="Réglages"
              icon={
                <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M4 7h16M7 12h10M10 17h4"
                    stroke={colors.text}
                    strokeWidth={iconStroke.regular}
                    strokeLinecap="round"
                  />
                </Svg>
              }
            />
          </View>
        </View>

        <View
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing[8],
              backgroundColor: colors.surface,
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
            placeholder="Search cats or areas"
            placeholderTextColor={colors.placeholder}
            style={{
              flex: 1,
              color: colors.text,
              fontFamily: fonts.body,
              fontSize: 16,
              paddingVertical: spacing[8],
            }}
          />
        </View>

        <View style={{ flexDirection: 'row', gap: spacing[8] }}>
          <Chip
            label="Nearby"
            selected={filter === 'nearby'}
            onPress={() => setFilter('nearby')}
          />
          <Chip label="Rare" selected={filter === 'rare'} onPress={() => setFilter('rare')} />
          <Chip label="Seen" selected={filter === 'seen'} onPress={() => setFilter('seen')} />
        </View>
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
              borderRadius: radius.lg,
              backgroundColor: themeSoft(nearbyTheme, scheme),
            }}
          />
          <View style={{ flex: 1, gap: spacing[8] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[8] }}>
              <Text variant="body" style={{ fontFamily: fonts.bodySemi }} numberOfLines={1}>
                {nearby.name}
              </Text>
              <Badge
                label={nearby.analysis.coat || 'Chat'}
                color={nearbyTheme.badge}
                backgroundColor={`${nearbyTheme.hex}33`}
              />
            </View>
            <Text variant="caption" color="textSecondary" numberOfLines={1}>
              {nearby.analysis.breed} · {nearby.analysis.color}
            </Text>
            <Text variant="caption" color="textSecondary">
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
            <Text variant="h2">{selected.name}</Text>
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

function GlassIconButton({
  icon,
  onPress,
  accessibilityLabel,
}: {
  icon: React.ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  const { colors, spacing, radius, shadow } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: spacing[40],
          height: spacing[40],
          borderRadius: radius.full,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: colors.border,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
        shadow.small,
      ]}
    >
      {icon}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
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
