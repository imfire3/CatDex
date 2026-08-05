import * as Linking from 'expo-linking';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { SettingsScreen } from '@/components/Settings/SettingsScreen';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

const FAQ = [
  {
    q: 'Comment capturer un chat ?',
    a: 'Ouvre Explorer, appuie sur le bouton caméra, photographie un chat, puis ajoute-le à ta collection.',
  },
  {
    q: 'Pourquoi ma position est demandée ?',
    a: 'Le GPS place tes captures sur la carte et montre les chats près de toi. Tu peux changer ça dans les réglages du téléphone.',
  },
  {
    q: 'Mes chats sont-ils sauvegardés ?',
    a: 'Oui, avec un compte CatDex tes captures et ton profil sont synchronisés (quand Supabase est configuré).',
  },
  {
    q: 'La photo n’apparaît pas dans le CatDex',
    a: 'Rescanne le chat après une mise à jour : les photos sont maintenant enregistrées durablement sur l’appareil.',
  },
];

const SUPPORT_EMAIL = 'support@catdex.app';

export default function HelpSupportScreen() {
  const { colors, fonts, spacing, radius, shadow } = useTheme();

  const openMail = () => {
    void Linking.openURL(
      `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Aide CatDex')}`,
    );
  };

  return (
    <SettingsScreen
      title="Aide & support"
      subtitle="Questions fréquentes et contact si tu es bloqué."
      footer={
        <Button title="Contacter le support" variant="secondary" onPress={openMail} />
      }
    >
      <View style={{ gap: spacing[16] }}>
        {FAQ.map((item) => (
          <View
            key={item.q}
            style={[
              {
                backgroundColor: colors.surfaceElevated,
                borderRadius: radius.lg,
                borderWidth: 1,
                borderColor: colors.border,
                padding: spacing[16],
                gap: spacing[8],
              },
              shadow.low,
            ]}
          >
            <Text variant="body" color="text" style={{ fontFamily: fonts.bodySemi }}>
              {item.q}
            </Text>
            <Text variant="bodySmall" color="textBody">
              {item.a}
            </Text>
          </View>
        ))}
      </View>

      <Text variant="caption" color="textMuted" align="center">
        {SUPPORT_EMAIL}
      </Text>
    </SettingsScreen>
  );
}
