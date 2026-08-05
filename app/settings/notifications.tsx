import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Pressable, Switch, View } from 'react-native';

import { SettingsScreen } from '@/components/Settings/SettingsScreen';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

const STORAGE_KEY = 'catdex-notification-prefs';

type PrefKey = 'nearbyCats' | 'missions' | 'weeklyDigest';

type Prefs = Record<PrefKey, boolean>;

const DEFAULT_PREFS: Prefs = {
  nearbyCats: true,
  missions: true,
  weeklyDigest: false,
};

const ROWS: { key: PrefKey; title: string; body: string }[] = [
  {
    key: 'nearbyCats',
    title: 'Chats à proximité',
    body: 'Quand un chat est repéré près de toi.',
  },
  {
    key: 'missions',
    title: 'Missions & streak',
    body: 'Rappels pour garder ta série et tes objectifs.',
  },
  {
    key: 'weeklyDigest',
    title: 'Récap hebdo',
    body: 'Un résumé de tes captures chaque semaine.',
  },
];

export default function NotificationsSettingsScreen() {
  const { colors, fonts, spacing, radius, shadow } = useTheme();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && mounted) {
          const parsed = JSON.parse(raw) as Partial<Prefs>;
          setPrefs({ ...DEFAULT_PREFS, ...parsed });
        }
      } catch {
        // keep defaults
      } finally {
        if (mounted) setHydrated(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const updatePref = (key: PrefKey, value: boolean) => {
    setPrefs((current) => {
      const next = { ...current, [key]: value };
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <SettingsScreen
      title="Notifications"
      subtitle="Choisis ce que CatDex peut te rappeler. Tu pourras activer les alertes système plus tard."
    >
      <View
        style={[
          {
            backgroundColor: colors.surfaceElevated,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
          },
          shadow.low,
        ]}
      >
        {ROWS.map((row, index) => (
          <View key={row.key}>
            {index > 0 ? (
              <View style={{ height: 1, backgroundColor: colors.border, marginLeft: spacing[16] }} />
            ) : null}
            <Pressable
              accessibilityRole="switch"
              accessibilityState={{ checked: prefs[row.key], disabled: !hydrated }}
              onPress={() => updatePref(row.key, !prefs[row.key])}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing[16],
                padding: spacing[16],
              }}
            >
              <View style={{ flex: 1, gap: spacing[4] }}>
                <Text variant="body" color="text" style={{ fontFamily: fonts.bodySemi }}>
                  {row.title}
                </Text>
                <Text variant="bodySmall" color="textSecondary">
                  {row.body}
                </Text>
              </View>
              <Switch
                value={prefs[row.key]}
                onValueChange={(value) => updatePref(row.key, value)}
                disabled={!hydrated}
                trackColor={{ false: colors.border, true: colors.brandSoft }}
                thumbColor={prefs[row.key] ? colors.brand : colors.surfaceElevated}
              />
            </Pressable>
          </View>
        ))}
      </View>
    </SettingsScreen>
  );
}
