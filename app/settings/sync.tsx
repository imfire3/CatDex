import { useEffect } from 'react';
import { View } from 'react-native';

import {
  IconSync,
  SettingsRow,
  SettingsScreen,
  SettingsSection,
} from '@/components/Settings';
import { Text } from '@/components/Text';
import { useSettingsPrefsStore } from '@/store/settingsPrefs';
import { useToastStore } from '@/store/toast';
import { useTheme } from '@/theme/ThemeProvider';

export default function SyncSettingsScreen() {
  const { colors, spacing, radius } = useTheme();
  const prefs = useSettingsPrefsStore((s) => s.prefs);
  const hydrated = useSettingsPrefsStore((s) => s.hydrated);
  const hydrate = useSettingsPrefsStore((s) => s.hydrate);
  const setPref = useSettingsPrefsStore((s) => s.setPref);
  const showToast = useToastStore((s) => s.show);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const synced = prefs.syncEnabled;

  return (
    <SettingsScreen
      title="Synchronisation"
      subtitle="Sauvegarde automatiquement ton CatDex dans le cloud."
    >
      <View style={{ gap: spacing[16] }}>
        <Text variant="title" color="textBrand">
          Cloud CatDex
        </Text>
        <Text variant="bodySmall" color="textBody">
          Quand la sync est active, tes captures et ton profil suivent ton compte.
        </Text>
        <View
          style={{
            alignSelf: 'flex-start',
            backgroundColor: synced ? colors.successSoft : colors.warningSoft,
            borderRadius: radius.full,
            paddingHorizontal: spacing[16],
            paddingVertical: spacing[8] }}
        >
          <Text
            variant="caption" weight="semibold"
            style={{
              color: synced ? colors.success : colors.warning }}
          >
            {synced ? 'Synchronisé' : 'Synchronisation en attente'}
          </Text>
        </View>
      </View>

      <SettingsSection title="Réglage">
        <SettingsRow
          kind="switch"
          icon={<IconSync />}
          title="Synchronisation cloud"
          subtitle="Garde ta collection à jour"
          value={prefs.syncEnabled}
          disabled={!hydrated}
          showDivider={false}
          onValueChange={(v) => {
            setPref('syncEnabled', v);
            showToast({
              title: v ? 'Sync activée' : 'Sync en pause',
              description: v
                ? 'Tes captures suivent ton compte.'
                : 'Tes chats restent sur cet appareil.',
              tone: v ? 'success' : 'warning',
            });
          }}
        />
      </SettingsSection>
    </SettingsScreen>
  );
}
