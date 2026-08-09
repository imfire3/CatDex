import { router, type Href } from 'expo-router';
import * as Linking from 'expo-linking';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import {
  IconBug,
  IconChart,
  IconDoc,
  IconHelp,
  IconInfo,
  IconMail,
  IconMap,
  IconPalette,
  IconShield,
  IconSpark,
  IconSpeaker,
  IconSync,
  IconTrash,
  IconUser,
  SettingsRow,
  SettingsScreen,
  SettingsSection,
} from '@/components/Settings';
import { Text } from '@/components/Text';
import { openSupportMail, SUPPORT_EMAIL } from '@/lib/supportLinks';
import { useAuthStore } from '@/store/auth';
import { useToastStore } from '@/store/toast';
import { useTheme } from '@/theme/ThemeProvider';

async function openUrl(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    // ignore
  }
}

export default function SettingsHubScreen() {
  const { spacing } = useTheme();
  const signOut = useAuthStore((s) => s.signOut);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const loading = useAuthStore((s) => s.loading);
  const showToast = useToastStore((s) => s.show);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSignOut = () => {
    void (async () => {
      try {
        await signOut();
      } finally {
        router.replace('/(auth)/welcome');
      }
    })();
  };

  const handleDeleteAccount = () => {
    void (async () => {
      setDeleting(true);
      try {
        await deleteAccount();
        setDeleteOpen(false);
        showToast({
          title: 'Compte supprimé',
          description: 'Tes données CatDex ont été effacées.',
          tone: 'success',
        });
        router.replace('/(auth)/welcome');
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Suppression impossible pour le moment.';
        showToast({
          title: 'Échec de la suppression',
          description: message,
          tone: 'danger',
        });
      } finally {
        setDeleting(false);
      }
    })();
  };

  return (
    <>
      <SettingsScreen
        title="Paramètres"
        subtitle="Quelques réglages pour toute l’app. Le reste vit dans le jeu."
        footer={
          <View style={{ gap: spacing[16] }}>
            <Button title="Se déconnecter" variant="secondary" onPress={handleSignOut} />
            <Button
              title="Supprimer mon compte"
              variant="destructive"
              onPress={() => setDeleteOpen(true)}
            />
          </View>
        }
      >
        <SettingsSection title="Compte">
          <SettingsRow
            icon={<IconUser />}
            title="Modifier le profil"
            subtitle="Change ton pseudo, ton avatar et ta bio."
            onPress={() => router.push('/settings/edit-profile')}
          />
          <SettingsRow
            icon={<IconSpeaker />}
            title="Notifications"
            subtitle="Préférences locales — push pas encore actif."
            onPress={() => router.push('/settings/notifications')}
          />
          <SettingsRow
            icon={<IconShield />}
            title="Confidentialité"
            subtitle="Gère les autorisations de la caméra et de la localisation."
            showDivider={false}
            onPress={() => router.push('/settings/privacy')}
          />
        </SettingsSection>

        <SettingsSection title="Préférences">
          <SettingsRow
            icon={<IconPalette />}
            title="Apparence"
            subtitle="Couleur, forme des coins et thème de l’app."
            onPress={() => router.push('/settings/appearance')}
          />
          <SettingsRow
            icon={<IconSpark />}
            title="Expérience"
            subtitle="Active ou désactive les sons, vibrations et animations."
            onPress={() => router.push('/settings/experience')}
          />
          <SettingsRow
            icon={<IconMap />}
            title="Carte"
            subtitle="Personnalise les chats affichés sur la carte."
            showDivider={false}
            onPress={() => router.push('/settings/map')}
          />
        </SettingsSection>

        <SettingsSection title="Stockage">
          <SettingsRow
            icon={<IconSync />}
            title="Synchronisation"
            subtitle="Sauvegarde automatiquement ton CatDex dans le cloud."
            onPress={() => router.push('/settings/sync')}
          />
          <SettingsRow
            icon={<IconTrash />}
            title="Vider le cache"
            subtitle="Supprime les fichiers temporaires sans perdre ta collection."
            showDivider={false}
            onPress={() => router.push('/settings/cache')}
          />
        </SettingsSection>

        <SettingsSection title="Progression">
          <SettingsRow
            icon={<IconChart />}
            title="Voir mes statistiques"
            subtitle="Retrouve ton niveau, ton XP, tes badges et tes découvertes."
            showDivider={false}
            onPress={() => router.push('/settings/stats')}
          />
        </SettingsSection>

        <SettingsSection title="Aide">
          <SettingsRow
            icon={<IconHelp />}
            title="Centre d’aide"
            subtitle="Réponses aux questions les plus fréquentes."
            onPress={() => router.push('/settings/help')}
          />
          <SettingsRow
            icon={<IconBug />}
            title="Signaler un problème"
            subtitle="Envoie un bug ou un problème rencontré."
            onPress={() => router.push('/settings/report')}
          />
          <SettingsRow
            icon={<IconMail />}
            title="Nous contacter"
            subtitle="Contacte directement l’équipe CatDex."
            showDivider={false}
            onPress={() => router.push('/settings/contact')}
          />
        </SettingsSection>

        <SettingsSection title="À propos">
          <SettingsRow
            icon={<IconInfo />}
            title="Version"
            subtitle="Version actuelle de CatDex."
            onPress={() => router.push('/settings/about')}
          />
          <SettingsRow
            icon={<IconDoc />}
            title="Conditions d’utilisation"
            subtitle="Consulte les conditions d’utilisation."
            onPress={() => router.push('/settings/legal-terms' as Href)}
          />
          <SettingsRow
            icon={<IconShield />}
            title="Politique de confidentialité"
            subtitle="Découvre comment tes données sont utilisées."
            showDivider={false}
            onPress={() => router.push('/settings/legal-privacy' as Href)}
          />
        </SettingsSection>

        <View style={{ height: spacing[8] }} />
      </SettingsScreen>

      <Modal
        visible={deleteOpen}
        title="Supprimer mon compte ?"
        onClose={() => {
          if (!deleting) setDeleteOpen(false);
        }}
        accessibilityLabel="Confirmation suppression de compte"
      >
        <View style={{ gap: spacing[16] }}>
          <Text variant="body" color="textBody">
            Cette action est définitive. Tes captures, ta progression et ton profil seront
            effacés immédiatement.
          </Text>
          <Button
            title={deleting || loading ? 'Suppression…' : 'Oui, supprimer'}
            variant="destructive"
            disabled={deleting || loading}
            onPress={handleDeleteAccount}
          />
          <Button
            title="Annuler"
            variant="secondary"
            disabled={deleting}
            onPress={() => setDeleteOpen(false)}
          />
          <Button
            title="Besoin d’aide ?"
            variant="ghost"
            disabled={deleting}
            onPress={() => {
              void openUrl(openSupportMail('Aide avant suppression de compte CatDex'));
            }}
          />
          <Text variant="caption" color="textMuted" align="center">
            {SUPPORT_EMAIL}
          </Text>
        </View>
      </Modal>
    </>
  );
}
