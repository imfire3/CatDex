import { View } from 'react-native';

import { SettingsScreen } from '@/components/Settings';
import { Text } from '@/components/Text';
import { SUPPORT_EMAIL } from '@/lib/supportLinks';
import { useTheme } from '@/theme/ThemeProvider';

function LegalBlock({ title, children }: { title: string; children: string }) {
  const { spacing } = useTheme();
  return (
    <View style={{ gap: spacing[8] }}>
      <Text variant="title" color="textBrand">
        {title}
      </Text>
      <Text variant="body" color="textBody">
        {children}
      </Text>
    </View>
  );
}

export default function LegalTermsScreen() {
  const { spacing } = useTheme();

  return (
    <SettingsScreen
      title="Conditions"
      subtitle="Règles d’utilisation de CatDex (MVP)."
    >
      <View style={{ gap: spacing[24] }}>
        <Text variant="caption" color="textMuted">
          Dernière mise à jour : 9 août 2026
        </Text>

        <LegalBlock title="Service">
          CatDex te permet de capturer, analyser et collectionner des chats réels
          rencontrés dehors. Le service est fourni « en l’état » pendant la phase MVP /
          bêta.
        </LegalBlock>

        <LegalBlock title="Compte">
          Tu es responsable de la confidentialité de ton mot de passe et de l’activité
          sur ton compte. Un seul compte personnel par utilisateur.
        </LegalBlock>

        <LegalBlock title="Contenu">
          Tu restes propriétaire des photos que tu ajoutes. En les envoyant, tu nous
          autorises à les stocker et à les traiter pour faire fonctionner CatDex
          (analyse, fiche, carte). N’uploade pas de contenu illégal ou portant atteinte
          à autrui.
        </LegalBlock>

        <LegalBlock title="Analyse IA">
          L’analyse visuelle est assistée par un modèle d’IA et peut se tromper. Les
          fiches générées sont des suggestions, pas une identification garantie.
        </LegalBlock>

        <LegalBlock title="Zone et sécurité">
          Explore en sécurité et respecte la loi locale. Ne dérange pas les animaux ni
          les propriétés privées. CatDex n’encourage aucune intrusion.
        </LegalBlock>

        <LegalBlock title="Suspension">
          Nous pouvons limiter ou fermer un compte en cas d’abus (spam API, contenu
          illicite, contournement de sécurité).
        </LegalBlock>

        <LegalBlock title="Contact">
          {`Questions : ${SUPPORT_EMAIL}. La politique de confidentialité détaille le traitement des données personnelles.`}
        </LegalBlock>
      </View>
    </SettingsScreen>
  );
}
