import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CatPreviewSheet } from '@/components/CatPreviewSheet';
import { CatMap } from '@/components/maps/CatMap';
import { isInParis20e } from '@/lib/constants';
import { useCatsStore } from '@/store/cats';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

export default function MapScreen() {
  const { colors, fonts, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const cats = useCatsStore((state) => state.cats);
  const [selected, setSelected] = useState<Cat | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [outsideZone, setOutsideZone] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted' || !mounted) return;

      const position = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = position.coords;
      const inside = isInParis20e(latitude, longitude);
      if (!inside && mounted) {
        setOutsideZone(true);
        if (__DEV__) {
          Alert.alert(
            'Hors du 20e',
            'Tu es hors de la zone de test (Paris 20e). En développement, les captures restent autorisées.',
          );
        }
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

      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <View style={[styles.badge, { backgroundColor: colors.surface }]}>
          <Text style={[styles.badgeTitle, { color: colors.text, fontFamily: fonts.display }]}>
            CatDex
          </Text>
          <Text style={[styles.badgeSub, { color: colors.textMuted, fontFamily: fonts.body }]}>
            Paris 20e · {cats.length} chat{cats.length === 1 ? '' : 's'}
            {outsideZone ? ' · hors zone' : ''}
          </Text>
        </View>
      </View>

      <CatPreviewSheet
        cat={selected}
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onOpenDetails={(cat) => {
          setSheetVisible(false);
          router.push(`/cat/${cat.id}`);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  badgeTitle: {
    fontSize: 18,
    letterSpacing: -0.3,
  },
  badgeSub: {
    marginTop: 2,
    fontSize: 12,
  },
});
