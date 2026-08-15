import { Platform, View } from 'react-native';

import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import {
  canNativeInstallPrompt,
  markInstallPromptDismissed,
  promptNativePwaInstall,
  type HomeScreenOfferKind,
} from '@/lib/pwaInstall';
import { useTheme } from '@/theme/ThemeProvider';

export type AddToHomeScreenSheetProps = {
  visible: boolean;
  kind: Exclude<HomeScreenOfferKind, 'none'>;
  onContinue: () => void;
};

/**
 * Post-signup: offer a home-screen shortcut (PWA).
 * Android/Chrome can trigger the native install prompt; iOS needs Share → Sur l’écran d’accueil.
 */
export function AddToHomeScreenSheet({
  visible,
  kind,
  onContinue,
}: AddToHomeScreenSheetProps) {
  const { colors, spacing, radius } = useTheme();
  const isIos = kind === 'ios-guide';

  const handlePrimary = async () => {
    if (!isIos && canNativeInstallPrompt()) {
      await promptNativePwaInstall();
    }
    await markInstallPromptDismissed();
    onContinue();
  };

  const handleSkip = async () => {
    await markInstallPromptDismissed();
    onContinue();
  };

  return (
    <BottomSheet visible={visible} onClose={() => void handleSkip()}>
      <View style={{ gap: spacing[16] }}>
        <Text variant="h3" color="textBrand">
          Accès rapide CatDex
        </Text>
        <Text variant="body" color="textBody">
          {isIos
            ? 'Ajoute CatDex sur ton écran d’accueil pour l’ouvrir comme une app — sans passer par Safari à chaque fois.'
            : 'Installe CatDex sur ton écran d’accueil : une icône, un tap, et tu es directement sur la carte de ton quartier.'}
        </Text>

        {isIos ? (
          <View
            style={{
              gap: spacing[8],
              padding: spacing[16],
              backgroundColor: colors.surfaceSecondary,
              borderRadius: radius.md,
            }}
          >
            <Text variant="bodySmall" color="text">
              1. Appuie sur Partager (carré avec flèche)
            </Text>
            <Text variant="bodySmall" color="text">
              2. Choisis « Sur l’écran d’accueil »
            </Text>
            <Text variant="bodySmall" color="text">
              3. Confirme « Ajouter »
            </Text>
          </View>
        ) : null}

        {Platform.OS === 'web' && !isIos && !canNativeInstallPrompt() ? (
          <Text variant="caption" color="textSecondary">
            Si le bouton d’installation n’apparaît pas, ouvre le menu du navigateur
            → « Installer l’application » / « Ajouter à l’écran d’accueil ».
          </Text>
        ) : null}

        <Button
          title={
            isIos
              ? 'Continuer vers la carte'
              : canNativeInstallPrompt()
                ? 'Ajouter à l’écran d’accueil'
                : 'Continuer'
          }
          onPress={() => {
            void handlePrimary();
          }}
        />
        <Button title="Plus tard" variant="ghost" onPress={() => void handleSkip()} />
      </View>
    </BottomSheet>
  );
}
