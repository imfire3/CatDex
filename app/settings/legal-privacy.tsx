import { View } from 'react-native';

import { SettingsScreen } from '@/components/Settings';
import { Text } from '@/components/Text';
import { SUPPORT_EMAIL } from '@/lib/supportLinks';
import { useTheme } from '@/theme/ThemeProvider';

function LegalBlock({ title, children }: { title: string; children: string }) {
  const { spacing } = useTheme();
  return (
    <View style={{ gap: spacing[8] }}>
      <Text variant="h3" color="textBrand">
        {title}
      </Text>
      <Text variant="body" color="textBody">
        {children}
      </Text>
    </View>
  );
}

export default function LegalPrivacyScreen() {
  const { spacing } = useTheme();

  return (
    <SettingsScreen
      title="Confidentialité"
      subtitle="Comment CatDex traite tes données (MVP)."
    >
      <View style={{ gap: spacing[24] }}>
        <Text variant="caption" color="textMuted">
          Dernière mise à jour : 9 août 2026
        </Text>

        <LegalBlock title="Qui sommes-nous ?">
          {`CatDex est une application mobile qui te permet de photographier des chats rencontrés dans ton quartier, de les analyser et de les collectionner sur une carte. Contact : ${SUPPORT_EMAIL}.`}
        </LegalBlock>

        <LegalBlock title="Données collectées">
          Compte (e-mail, pseudo, avatar optionnel), photos que tu envoies pour analyse, position au moment d’une capture (si autorisée), préférences locales, et métadonnées techniques nécessaires au fonctionnement (jetons de session, journaux d’erreurs côté serveur).
        </LegalBlock>

        <LegalBlock title="Finalités">
          Authentification, synchronisation de ta collection, analyse IA des photos (OpenAI via notre API), affichage carte, support utilisateur, et sécurité (limitation d’abus).
        </LegalBlock>

        <LegalBlock title="Partage">
          Tes photos d’analyse transitent par notre API puis OpenAI Vision. L’hébergement compte / base / fichiers utilise Supabase. Nous ne vendons pas tes données.
        </LegalBlock>

        <LegalBlock title="Conservation">
          Tant que ton compte existe. Tu peux supprimer ton compte dans Paramètres : profil, captures et fichiers associés sont alors effacés.
        </LegalBlock>

        <LegalBlock title="Tes droits">
          {`Accès, rectification (profil), suppression de compte dans l’app, et opposition via ${SUPPORT_EMAIL}. Sur iOS / Android, tu contrôles aussi caméra et localisation dans les réglages système.`}
        </LegalBlock>

        <LegalBlock title="Mineurs">
          CatDex n’est pas destinée aux enfants de moins de 13 ans. Si tu es parent et qu’un compte a été créé par erreur, contacte-nous pour le supprimer.
        </LegalBlock>
      </View>
    </SettingsScreen>
  );
}
