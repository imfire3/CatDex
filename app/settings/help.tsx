import { View } from 'react-native';

import {
  IconDoc,
  IconFlag,
  IconHelp,
  SettingsRow,
  SettingsScreen,
  SettingsSection,
} from '@/components/Settings';
import { Text } from '@/components/Text';
import { useToastStore } from '@/store/toast';
import { useTheme } from '@/theme/ThemeProvider';

const FAQ = [
  {
    q: 'Comment capturer un chat ?',
    a: 'Ouvre Explorer, appuie sur le bouton caméra, photographie un chat, puis ajoute-le à ta collection.',
  },
  {
    q: 'Pourquoi ma position est demandée ?',
    a: 'Le GPS place tes captures sur la carte et montre les chats près de toi.',
  },
  {
    q: 'Mes chats sont-ils sauvegardés ?',
    a: 'Oui, avec un compte CatDex tes captures et ton profil sont synchronisés quand le cloud est actif.',
  },
];

export default function HelpCenterScreen() {
  const { spacing } = useTheme();
  const showToast = useToastStore((s) => s.show);

  return (
    <SettingsScreen
      title="Centre d’aide"
      subtitle="FAQ, tutoriel et guide du débutant."
    >
      <SettingsSection title="Guides">
        <SettingsRow
          icon={<IconFlag />}
          title="Tutoriel"
          subtitle="Revois les gestes de base"
          onPress={() =>
            showToast({
              title: 'Tutoriel',
              description: 'Le parcours guidé revient bientôt depuis l’accueil.',
              tone: 'default',
            })
          }
        />
        <SettingsRow
          icon={<IconDoc />}
          title="Guide du débutant"
          subtitle="Ton premier chat en 5 minutes"
          showDivider={false}
          onPress={() =>
            showToast({
              title: 'Guide du débutant',
              description: 'Scanne, confirme, collectionne — c’est tout.',
              tone: 'default',
            })
          }
        />
      </SettingsSection>

      <Text variant="title" color="textBrand">
        FAQ
      </Text>
      <View style={{ gap: spacing[16] }}>
        {FAQ.map((item) => (
          <View
            key={item.q}
            style={{ gap: spacing[8] }}
          >
            <View style={{ flexDirection: 'row', gap: spacing[8], alignItems: 'flex-start' }}>
              <IconHelp />
              <Text
                variant="body" weight="semibold"
                color="text"
                style={{ flex: 1 }}
              >
                {item.q}
              </Text>
            </View>
            <Text variant="bodySmall" color="textBody">
              {item.a}
            </Text>
          </View>
        ))}
      </View>
    </SettingsScreen>
  );
}
