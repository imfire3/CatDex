import * as Linking from 'expo-linking';

import {
  IconMail,
  SettingsRow,
  SettingsScreen,
  SettingsSection,
} from '@/components/Settings';
import { openSupportMail, SUPPORT_EMAIL } from '@/lib/supportLinks';

export default function ContactSettingsScreen() {
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
          showDivider={false}
        />
      </SettingsSection>
    </SettingsScreen>
  );
}
