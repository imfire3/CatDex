import { useEffect } from 'react';
import { Pressable, View } from 'react-native';

import { SettingsScreen } from '@/components/Settings';
import { Text } from '@/components/Text';
import {
  formatTheme,
  type ThemePreference,
  useSettingsPrefsStore,
} from '@/store/settingsPrefs';
import { useTheme } from '@/theme/ThemeProvider';

const OPTIONS: ThemePreference[] = ['clair', 'sombre', 'automatique'];

export default function AppearanceSettingsScreen() {
  const { colors, fonts, spacing, radius, shadow, motion } = useTheme();
  const prefs = useSettingsPrefsStore((s) => s.prefs);
  const hydrated = useSettingsPrefsStore((s) => s.hydrated);
  const hydrate = useSettingsPrefsStore((s) => s.hydrate);
  const setTheme = useSettingsPrefsStore((s) => s.setTheme);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <SettingsScreen
      title="Apparence"
      subtitle="Choisis le thème de l’application. (Le mode sombre arrive bientôt — ton choix est déjà mémorisé.)"
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
        {OPTIONS.map((option, index) => {
          const selected = prefs.theme === option;
          return (
            <View key={option}>
              {index > 0 ? (
                <View style={{ height: 1, backgroundColor: colors.border, marginLeft: spacing[16] }} />
              ) : null}
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: selected, disabled: !hydrated }}
                accessibilityLabel={formatTheme(option)}
                disabled={!hydrated}
                onPress={() => setTheme(option)}
                style={({ pressed }) => ({
                  padding: spacing[16],
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing[16],
                  opacity: pressed ? 0.88 : 1,
                  transform: [{ scale: pressed ? motion.pressScale : 1 }],
                })}
              >
                <View
                  style={{
                    width: spacing[24],
                    height: spacing[24],
                    borderRadius: radius.full,
                    borderWidth: 2,
                    borderColor: selected ? colors.brand : colors.borderDefault,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {selected ? (
                    <View
                      style={{
                        width: spacing[8],
                        height: spacing[8],
                        borderRadius: radius.full,
                        backgroundColor: colors.brand,
                      }}
                    />
                  ) : null}
                </View>
                <Text
                  variant="body"
                  color="text"
                  style={{ flex: 1, fontFamily: fonts.bodySemi }}
                >
                  {formatTheme(option)}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </SettingsScreen>
  );
}
