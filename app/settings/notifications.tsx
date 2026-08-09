import { useEffect } from 'react';
import { View } from 'react-native';

import {
  IconFlag,
  IconFlame,
  IconSparkle,
  IconTrophy,
  SettingsRow,
  SettingsScreen,
  SettingsSection,
} from '@/components/Settings';
import { Text } from '@/components/Text';
import { useSettingsPrefsStore } from '@/store/settingsPrefs';
import { useTheme } from '@/theme/ThemeProvider';

export default function NotificationsSettingsScreen() {
  const { colors, spacing, radius } = useTheme();
  const prefs = useSettingsPrefsStore((s) => s.prefs);
  const hydrated = useSettingsPrefsStore((s) => s.hydrated);
  const hydrate = useSettingsPrefsStore((s) => s.hydrate);
  const setPref = useSettingsPrefsStore((s) => s.setPref);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <SettingsScreen
      title="Notifications"
      subtitle="Préférences enregistrées sur cet appareil. Les push ne sont pas encore envoyés."
    >
      <View
        style={{
          padding: spacing[16],
          borderRadius: radius.lg,
          backgroundColor: colors.brandSoft,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: spacing[8],
        }}
      >
        <Text variant="bodySmall" color="textBody">
          Bientôt : vraies alertes push. Pour l’instant, ces interrupteurs préparent
          seulement tes choix — rien n’est envoyé.
        </Text>
      </View>

      <SettingsSection title="Alertes (bientôt)">
        <SettingsRow
          kind="switch"
          icon={<IconSparkle />}
          title="Chats rares"
          subtitle="Quand un chat rare est repéré près de toi"
          value={prefs.notifRareCats}
          disabled={!hydrated}
          onValueChange={(v) => setPref('notifRareCats', v)}
        />
        <SettingsRow
          kind="switch"
          icon={<IconFlag />}
          title="Missions"
          subtitle="Objectifs et rappels d’exploration"
          value={prefs.notifMissions}
          disabled={!hydrated}
          onValueChange={(v) => setPref('notifMissions', v)}
        />
        <SettingsRow
          kind="switch"
          icon={<IconTrophy />}
          title="Badges"
          subtitle="Quand tu débloques un trophée"
          value={prefs.notifBadges}
          disabled={!hydrated}
          onValueChange={(v) => setPref('notifBadges', v)}
        />
        <SettingsRow
          kind="switch"
          icon={<IconFlame />}
          title="Série quotidienne"
          subtitle="Ne casse pas ta flamme"
          value={prefs.notifDailyStreak}
          disabled={!hydrated}
          showDivider={false}
          onValueChange={(v) => setPref('notifDailyStreak', v)}
        />
      </SettingsSection>
    </SettingsScreen>
  );
}
