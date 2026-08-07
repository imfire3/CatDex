import Constants from 'expo-constants';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import {
  IconBug,
  IconCamera,
  IconChart,
  IconDoc,
  IconDownload,
  IconEye,
  IconFilter,
  IconFlag,
  IconFlame,
  IconHelp,
  IconImage,
  IconInfo,
  IconLightbulb,
  IconLink,
  IconLock,
  IconMail,
  IconMegaphone,
  IconPalette,
  IconPhotos,
  IconPin,
  IconRadar,
  IconRoadmap,
  IconSettings,
  IconShield,
  IconSpark,
  IconSparkle,
  IconSpeaker,
  IconStorage,
  IconSync,
  IconTrash,
  IconTrophy,
  IconUser,
  IconVibrate,
  IconXp,
  SettingsRow,
  SettingsScreen,
  SettingsSection,
} from '@/components/Settings';
import { Text } from '@/components/Text';
import { openSystemLocationSettings } from '@/lib/locationAccess';
import {
  CATDEX_GOAL,
  estimateTotalXp,
  progressionFromTotalXp,
  uniquePlaces,
} from '@/lib/progression';
import { useAuthStore } from '@/store/auth';
import { useCatsStore } from '@/store/cats';
import { useMissionsStore } from '@/store/missions';
import {
  formatImageQuality,
  formatSearchDistance,
  formatTheme,
  useSettingsPrefsStore,
} from '@/store/settingsPrefs';
import { useToastStore } from '@/store/toast';
import { useTheme } from '@/theme/ThemeProvider';

const SUPPORT_EMAIL = 'support@catdex.app';
const TERMS_URL = 'https://catdex.app/terms';
const PRIVACY_URL = 'https://catdex.app/privacy';
const ROADMAP_URL = 'https://catdex.app/roadmap';

function appVersionLabel(): string {
  const version =
    Constants.expoConfig?.version ??
    Constants.nativeAppVersion ??
    '1.0.0';
  const build =
    Constants.expoConfig?.ios?.buildNumber ??
    Constants.expoConfig?.android?.versionCode;
  return build ? `${version} (${build})` : version;
}

export default function SettingsHubScreen() {
  const { colors, spacing } = useTheme();
  const showToast = useToastStore((s) => s.show);
  const signOut = useAuthStore((s) => s.signOut);
  const cats = useCatsStore((s) => s.cats);
  const streakDays = useMissionsStore((s) => s.streakDays);

  const prefs = useSettingsPrefsStore((s) => s.prefs);
  const hydrated = useSettingsPrefsStore((s) => s.hydrated);
  const hydrate = useSettingsPrefsStore((s) => s.hydrate);
  const setPref = useSettingsPrefsStore((s) => s.setPref);
  const resetMapFilters = useSettingsPrefsStore((s) => s.resetMapFilters);
  const cycleSearchDistance = useSettingsPrefsStore((s) => s.cycleSearchDistance);
  const cycleImageQuality = useSettingsPrefsStore((s) => s.cycleImageQuality);
  const cycleTheme = useSettingsPrefsStore((s) => s.cycleTheme);

  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const totalXp = estimateTotalXp(cats);
  const { level, xpIntoLevel, xpMax, title } = progressionFromTotalXp(totalXp);
  const places = uniquePlaces(cats);
  const streak = Math.max(streakDays, cats.length > 0 ? 1 : 0);
  const badgeCount = Math.min(cats.length, 12);
  const missionHint = streak > 0 ? `Série ${streak} j` : 'Aucune active';

  const soon = (title: string, description?: string) => {
    showToast({
      title,
      description: description ?? 'Bientôt disponible.',
      tone: 'default',
    });
  };

  const openMail = (subject: string) => {
    void Linking.openURL(
      `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`,
    );
  };

  const openUrl = async (url: string, fallbackTitle: string) => {
    try {
      const can = await Linking.canOpenURL(url);
      if (can) {
        await Linking.openURL(url);
        return;
      }
    } catch {
      // fall through
    }
    soon(fallbackTitle);
  };

  const handleSignOut = () => {
    void (async () => {
      try {
        await signOut();
      } finally {
        router.replace('/(auth)/welcome');
      }
    })();
  };

  const handleClearCache = () => {
    showToast({
      title: 'Cache vidé',
      description: 'Les images temporaires ont été nettoyées.',
      tone: 'success',
    });
  };

  return (
    <>
      <SettingsScreen
        title="Paramètres"
        subtitle="Personnalise ton exploration. Tout est rangé par thème."
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
        <SettingsSection title="Mon compte">
          <SettingsRow
            icon={<IconUser />}
            title="Modifier le profil"
            subtitle="Nom, avatar, bio"
            onPress={() => router.push('/settings/edit-profile')}
          />
          <SettingsRow
            icon={<IconLock />}
            title="Sécurité"
            subtitle="Mot de passe et sessions"
            onPress={() => soon('Sécurité')}
          />
          <SettingsRow
            icon={<IconLink />}
            title="Comptes liés"
            subtitle="Google, Apple"
            showDivider={false}
            onPress={() => soon('Comptes liés')}
          />
        </SettingsSection>

        <SettingsSection title="Notifications">
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
            onValueChange={(v) => setPref('notifDailyStreak', v)}
          />
          <SettingsRow
            kind="switch"
            icon={<IconMegaphone />}
            title="Marketing"
            subtitle="Actus et offres CatDex"
            value={prefs.notifMarketing}
            disabled={!hydrated}
            showDivider={false}
            onValueChange={(v) => setPref('notifMarketing', v)}
          />
        </SettingsSection>

        <SettingsSection title="Préférences">
          <SettingsRow
            kind="value"
            icon={<IconPalette />}
            title="Thème"
            value={formatTheme(prefs.theme)}
            onPress={cycleTheme}
          />
          <SettingsRow
            kind="switch"
            icon={<IconSpeaker />}
            title="Sons"
            subtitle="Captures, récompenses, UI"
            value={prefs.sounds}
            disabled={!hydrated}
            onValueChange={(v) => setPref('sounds', v)}
          />
          <SettingsRow
            kind="switch"
            icon={<IconVibrate />}
            title="Vibrations"
            subtitle="Retours haptiques"
            value={prefs.haptics}
            disabled={!hydrated}
            onValueChange={(v) => setPref('haptics', v)}
          />
          <SettingsRow
            kind="switch"
            icon={<IconSpark />}
            title="Animations"
            subtitle="Révéler, transitions, micro-mouvements"
            value={prefs.animations}
            disabled={!hydrated}
            onValueChange={(v) => setPref('animations', v)}
          />
          <SettingsRow
            kind="value"
            icon={<IconImage />}
            title="Qualité des images"
            value={formatImageQuality(prefs.imageQuality)}
            showDivider={false}
            onPress={cycleImageQuality}
          />
        </SettingsSection>

        <SettingsSection title="Carte">
          <SettingsRow
            kind="value"
            icon={<IconRadar />}
            title="Distance de recherche"
            subtitle="Rayon autour de toi"
            value={formatSearchDistance(prefs.searchDistance)}
            onPress={cycleSearchDistance}
          />
          <SettingsRow
            kind="switch"
            icon={<IconEye />}
            title="Non découverts seulement"
            subtitle="Masque les chats déjà dans ton CatDex"
            value={prefs.mapUndiscoveredOnly}
            disabled={!hydrated}
            onValueChange={(v) => setPref('mapUndiscoveredOnly', v)}
          />
          <SettingsRow
            kind="switch"
            icon={<IconSparkle />}
            title="Afficher les chats rares"
            subtitle="Pins et alertes de rareté"
            value={prefs.mapShowRare}
            disabled={!hydrated}
            onValueChange={(v) => setPref('mapShowRare', v)}
          />
          <SettingsRow
            icon={<IconFilter />}
            title="Réinitialiser les filtres"
            subtitle="Distance et affichage par défaut"
            showDivider={false}
            onPress={() => {
              resetMapFilters();
              showToast({
                title: 'Filtres réinitialisés',
                description: 'La carte utilise les réglages par défaut.',
                tone: 'success',
              });
            }}
          />
        </SettingsSection>

        <SettingsSection title="Confidentialité">
          <SettingsRow
            icon={<IconCamera />}
            title="Caméra"
            subtitle="Autorisation système"
            onPress={() => {
              void Linking.openSettings();
            }}
          />
          <SettingsRow
            icon={<IconPin />}
            title="Localisation"
            subtitle="Pour placer tes captures"
            onPress={() => {
              void openSystemLocationSettings();
            }}
          />
          <SettingsRow
            icon={<IconPhotos />}
            title="Photos"
            subtitle="Accès à ta galerie"
            onPress={() => {
              void Linking.openSettings();
            }}
          />
          <SettingsRow
            icon={<IconDownload />}
            title="Exporter mes données"
            subtitle="Copie de tes captures et profil"
            badge="Bêta"
            onPress={() => soon('Export des données', 'On prépare un export lisible de ton CatDex.')}
          />
          <SettingsRow
            icon={<IconTrash color={colors.danger} />}
            title="Supprimer mes données"
            subtitle="Efface captures locales et cache"
            destructive
            showDivider={false}
            onPress={() =>
              soon('Suppression des données', 'Contacte le support pour une suppression complète.')
            }
          />
        </SettingsSection>

        <SettingsSection title="Stockage">
          <SettingsRow
            kind="value"
            icon={<IconStorage />}
            title="Taille du cache"
            value="Local"
          />
          <SettingsRow
            icon={<IconTrash />}
            title="Vider le cache"
            subtitle="Libère de l’espace sans perdre ton CatDex"
            onPress={handleClearCache}
          />
          <SettingsRow
            kind="switch"
            icon={<IconSync />}
            title="Synchronisation"
            subtitle="Garde ta collection à jour sur le cloud"
            value={prefs.syncEnabled}
            disabled={!hydrated}
            badge="Nouveau"
            showDivider={false}
            onValueChange={(v) => setPref('syncEnabled', v)}
          />
        </SettingsSection>

        <SettingsSection title="Progression">
          <SettingsRow
            kind="value"
            icon={<IconTrophy />}
            title="Niveau"
            subtitle={title}
            value={`Nv. ${level}`}
            onPress={() => router.push('/(tabs)/profile')}
          />
          <SettingsRow
            kind="value"
            icon={<IconXp />}
            title="XP"
            value={`${xpIntoLevel.toLocaleString('fr-FR')} / ${xpMax.toLocaleString('fr-FR')}`}
          />
          <SettingsRow
            kind="value"
            icon={<IconSparkle />}
            title="Badges"
            value={`${badgeCount}`}
            onPress={() => soon('Badges', 'La vitrine des trophées arrive bientôt.')}
          />
          <SettingsRow
            kind="value"
            icon={<IconFlag />}
            title="Missions"
            value={missionHint}
            onPress={() => soon('Missions')}
          />
          <SettingsRow
            kind="value"
            icon={<IconChart />}
            title="Statistiques"
            subtitle={`CatDex ${cats.length}/${CATDEX_GOAL} · ${places} lieu${places > 1 ? 'x' : ''}`}
            value={`${cats.length}`}
            showDivider={false}
            onPress={() => router.push('/(tabs)/catdex')}
          />
        </SettingsSection>

        <SettingsSection title="Aide & support">
          <SettingsRow
            icon={<IconHelp />}
            title="FAQ"
            onPress={() => router.push('/settings/help')}
          />
          <SettingsRow
            icon={<IconMail />}
            title="Contacter le support"
            onPress={() => openMail('Aide CatDex')}
          />
          <SettingsRow
            icon={<IconBug />}
            title="Signaler un bug"
            onPress={() => openMail('Bug CatDex')}
          />
          <SettingsRow
            icon={<IconLightbulb />}
            title="Proposer une idée"
            onPress={() => openMail('Idée CatDex')}
          />
          <SettingsRow
            icon={<IconRoadmap />}
            title="Roadmap CatDex"
            badge="Nouveau"
            onPress={() => {
              void openUrl(ROADMAP_URL, 'Roadmap CatDex');
            }}
          />
          <SettingsRow
            icon={<IconDoc />}
            title="Conditions d’utilisation"
            onPress={() => {
              void openUrl(TERMS_URL, 'Conditions d’utilisation');
            }}
          />
          <SettingsRow
            icon={<IconShield />}
            title="Politique de confidentialité"
            showDivider={false}
            onPress={() => {
              void openUrl(PRIVACY_URL, 'Politique de confidentialité');
            }}
          />
        </SettingsSection>

        <SettingsSection title="À propos">
          <SettingsRow
            kind="value"
            icon={<IconInfo />}
            title="Version"
            value={appVersionLabel()}
          />
          <SettingsRow
            icon={<IconDoc />}
            title="Notes de version"
            onPress={() =>
              soon('Notes de version', `CatDex ${appVersionLabel()} — ton quartier, tes chats.`)
            }
          />
          <SettingsRow
            icon={<IconSettings />}
            title="Licences"
            showDivider={false}
            onPress={() => soon('Licences open source')}
          />
        </SettingsSection>

        <View style={{ height: spacing[8] }} />
      </SettingsScreen>

      <Modal
        visible={deleteOpen}
        title="Supprimer mon compte ?"
        onClose={() => setDeleteOpen(false)}
        accessibilityLabel="Confirmation suppression de compte"
      >
        <View style={{ gap: spacing[16] }}>
          <Text variant="body" color="textBody">
            Cette action est définitive. Tes captures, ta progression et ton profil seront
            effacés. Contacte le support si tu as besoin d’aide avant.
          </Text>
          <Button
            title="Oui, supprimer"
            variant="destructive"
            onPress={() => {
              setDeleteOpen(false);
              openMail('Suppression de compte CatDex');
            }}
          />
          <Button
            title="Annuler"
            variant="secondary"
            onPress={() => setDeleteOpen(false)}
          />
        </View>
      </Modal>
    </>
  );
}
