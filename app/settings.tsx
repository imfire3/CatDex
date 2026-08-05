import { router } from 'expo-router';
import { Pressable, ScrollView, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

const SETTINGS_KEY = 'catdex-settings';

type SettingsPrefs = {
  notificationsEnabled: boolean;
  locationEnabled: boolean;
  hapticsEnabled: boolean;
};

const DEFAULT_PREFS: SettingsPrefs = {
  notificationsEnabled: true,
  locationEnabled: true,
  hapticsEnabled: true,
};

type SettingsRowProps = {
  label: string;
  description?: string;
  trailing?: React.ReactNode;
  showDivider?: boolean;
};

const SettingsRow = ({ label, description, trailing, showDivider = true }: SettingsRowProps) => {
  const { colors, spacing } = useTheme();

  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing[16],
          paddingVertical: spacing[16],
          minHeight: 56,
        }}
      >
        <View style={{ flex: 1, gap: spacing[4] }}>
          <Text variant="body" color="text">
            {label}
          </Text>
          {description ? (
            <Text variant="caption" color="textMuted">
              {description}
            </Text>
          ) : null}
        </View>
        {trailing}
      </View>
      {showDivider ? <View style={{ height: 1, backgroundColor: colors.border }} /> : null}
    </>
  );
};

export default function SettingsScreen() {
  const { colors, fonts, spacing, radius, shadow, iconStroke } = useTheme();
  const insets = useSafeAreaInsets();
  const [prefs, setPrefs] = useState<SettingsPrefs>(DEFAULT_PREFS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadPrefs = async () => {
      try {
        const raw = await AsyncStorage.getItem(SETTINGS_KEY);
        if (!raw || cancelled) return;
        const parsed = JSON.parse(raw) as Partial<SettingsPrefs>;
        setPrefs({ ...DEFAULT_PREFS, ...parsed });
      } catch {
        // Keep defaults when storage is unavailable.
      } finally {
        if (!cancelled) setReady(true);
      }
    };
    void loadPrefs();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleUpdatePref = (key: keyof SettingsPrefs, value: boolean) => {
    setPrefs((current) => {
      const next = { ...current, [key]: value };
      void AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/profile');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          paddingTop: insets.top + spacing[8],
          paddingHorizontal: spacing[24],
          paddingBottom: spacing[16],
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing[12],
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour"
          onPress={handleBack}
          hitSlop={8}
          style={({ pressed }) => ({
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radius.full,
            backgroundColor: colors.surfaceSecondary,
            opacity: pressed ? 0.88 : 1,
          })}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 6l-6 6 6 6"
              stroke={colors.text}
              strokeWidth={iconStroke.regular}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Pressable>
        <Text variant="h2" color="textBrand" style={{ fontFamily: fonts.display, flex: 1 }}>
          Paramètres
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing[24],
          paddingBottom: insets.bottom + spacing[32],
          gap: spacing[24],
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: spacing[8] }}>
          <Text variant="title" color="textBrand">
            Expérience
          </Text>
          <View
            style={[
              {
                backgroundColor: colors.surfaceElevated,
                borderRadius: radius.lg,
                paddingHorizontal: spacing[16],
                borderWidth: 1,
                borderColor: colors.border,
                opacity: ready ? 1 : 0.72,
              },
              shadow.low,
            ]}
          >
            <SettingsRow
              label="Notifications"
              description="Alertes de chats proches et missions"
              trailing={
                <Switch
                  accessibilityLabel="Activer les notifications"
                  value={prefs.notificationsEnabled}
                  onValueChange={(value) => handleUpdatePref('notificationsEnabled', value)}
                  trackColor={{ false: colors.borderStrong, true: colors.accent }}
                  thumbColor={colors.onAccent}
                />
              }
            />
            <SettingsRow
              label="Localisation"
              description="Découvrir les chats autour de toi"
              trailing={
                <Switch
                  accessibilityLabel="Activer la localisation"
                  value={prefs.locationEnabled}
                  onValueChange={(value) => handleUpdatePref('locationEnabled', value)}
                  trackColor={{ false: colors.borderStrong, true: colors.accent }}
                  thumbColor={colors.onAccent}
                />
              }
            />
            <SettingsRow
              label="Retour haptique"
              description="Vibrations lors des découvertes"
              showDivider={false}
              trailing={
                <Switch
                  accessibilityLabel="Activer le retour haptique"
                  value={prefs.hapticsEnabled}
                  onValueChange={(value) => handleUpdatePref('hapticsEnabled', value)}
                  trackColor={{ false: colors.borderStrong, true: colors.accent }}
                  thumbColor={colors.onAccent}
                />
              }
            />
          </View>
        </View>

        <View style={{ gap: spacing[8] }}>
          <Text variant="title" color="textBrand">
            À propos
          </Text>
          <View
            style={[
              {
                backgroundColor: colors.surfaceElevated,
                borderRadius: radius.lg,
                paddingHorizontal: spacing[16],
                borderWidth: 1,
                borderColor: colors.border,
              },
              shadow.low,
            ]}
          >
            <SettingsRow label="Application" description="CatDex" />
            <SettingsRow label="Slogan" description="Ton quartier. Tes chats." />
            <SettingsRow label="Version" description="1.0.0" showDivider={false} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
