import Constants from 'expo-constants';
import { View } from 'react-native';

import {
  IconDoc,
  IconInfo,
  SettingsRow,
  SettingsScreen,
  SettingsSection,
} from '@/components/Settings';
import { Text } from '@/components/Text';
import { useToastStore } from '@/store/toast';
import { useTheme } from '@/theme/ThemeProvider';

function appVersion(): string {
  return (
    Constants.expoConfig?.version ??
    Constants.nativeAppVersion ??
    '1.0.0'
  );
}

function appBuild(): string {
  const ios = Constants.expoConfig?.ios?.buildNumber;
  const android = Constants.expoConfig?.android?.versionCode;
  if (ios) return String(ios);
  if (android != null) return String(android);
  return Constants.nativeBuildVersion ?? '—';
}

export default function AboutVersionScreen() {
  const { spacing } = useTheme();
  const showToast = useToastStore((s) => s.show);
  const version = appVersion();
  const build = appBuild();

  return (
    <SettingsScreen
      title="Version"
      subtitle="Ton quartier. Tes chats."
    >
      <View style={{ gap: spacing[8] }}>
        <Text variant="caption" weight="semibold" color="textMuted">
          CatDex
        </Text>
        <Text variant="title" color="textBrand">
          {version}
        </Text>
        <Text variant="bodySmall" color="textSecondary">
          Build {build}
        </Text>
      </View>

      <SettingsSection title="Détails">
        <SettingsRow
          kind="value"
          icon={<IconInfo />}
          title="Version"
          value={version}
        />
        <SettingsRow
          kind="value"
          icon={<IconInfo />}
          title="Build"
          value={build}
        />
        <SettingsRow
          icon={<IconDoc />}
          title="Notes de version"
          showDivider={false}
          onPress={() =>
            showToast({
              title: 'Notes de version',
              description: `CatDex ${version} — observe, capture, collectionne.`,
              tone: 'default',
            })
          }
        />
      </SettingsSection>
    </SettingsScreen>
  );
}
