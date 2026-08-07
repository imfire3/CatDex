import * as Linking from 'expo-linking';

import {
  IconMail,
  IconRoadmap,
  IconSparkle,
  SettingsRow,
  SettingsScreen,
  SettingsSection,
} from '@/components/Settings';
import {
  DISCORD_URL,
  INSTAGRAM_URL,
  openSupportMail,
  SUPPORT_EMAIL,
} from '@/lib/supportLinks';
import { useToastStore } from '@/store/toast';

async function openUrl(url: string, fallbackTitle: string, showToast: ReturnType<typeof useToastStore.getState>['show']) {
  try {
    const can = await Linking.canOpenURL(url);
    if (can) {
      await Linking.openURL(url);
      return;
    }
  } catch {
    // fall through
  }
  showToast({
    title: fallbackTitle,
    description: 'Lien bientôt disponible.',
    tone: 'default',
  });
}

export default function ContactSettingsScreen() {
  const showToast = useToastStore((s) => s.show);

  return (
    <SettingsScreen
      title="Nous contacter"
      subtitle="L’équipe CatDex lit chaque message."
    >
      <SettingsSection title="Canaux">
        <SettingsRow
          icon={<IconMail />}
          title="E-mail"
          subtitle={SUPPORT_EMAIL}
          onPress={() => {
            void Linking.openURL(openSupportMail('Aide CatDex'));
          }}
        />
        <SettingsRow
          icon={<IconRoadmap />}
          title="Discord"
          subtitle="Rejoins la communauté"
          onPress={() => {
            void openUrl(DISCORD_URL, 'Discord CatDex', showToast);
          }}
        />
        <SettingsRow
          icon={<IconSparkle />}
          title="Instagram"
          subtitle="@catdex.app"
          showDivider={false}
          onPress={() => {
            void openUrl(INSTAGRAM_URL, 'Instagram CatDex', showToast);
          }}
        />
      </SettingsSection>
    </SettingsScreen>
  );
}
