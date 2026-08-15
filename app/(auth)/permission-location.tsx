import { Redirect, router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Platform, View } from 'react-native';

import { AddToHomeScreenSheet } from '@/components/AddToHomeScreenSheet';
import { AuthShell } from '@/components/Auth/AuthShell';
import { BrandLoader } from '@/components/Auth/Onboarding';
import { Button } from '@/components/Button';
import { ErrorState } from '@/components/ErrorState';
import {
  isLocalWebPreview,
  openSystemLocationSettings,
  requestLocationAccessResult,
  requestWebCompassPermission,
} from '@/lib/locationAccess';
import {
  getHomeScreenOfferKind,
  type HomeScreenOfferKind,
} from '@/lib/pwaInstall';
import { useAuthStore } from '@/store/auth';
import { useToastStore } from '@/store/toast';
import { useTheme } from '@/theme/ThemeProvider';

const LOADER_MIN_MS = 900;

/**
 * Onboarding GPS gate — same authorize UI as before, but before the map
 * (not as a modal over the explorer).
 */
export default function PermissionLocationScreen() {
  const { colors, spacing, radius, shadow } = useTheme();
  const user = useAuthStore((state) => state.user);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const showToast = useToastStore((state) => state.show);

  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<'ask' | 'denied'>('ask');
  const [entering, setEntering] = useState(false);
  const [installKind, setInstallKind] = useState<Exclude<HomeScreenOfferKind, 'none'> | null>(
    null,
  );

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }
  if (onboardingCompleted && !entering && !installKind) {
    return <Redirect href="/(tabs)/map" />;
  }

  const enterMap = useCallback(async () => {
    setInstallKind(null);
    setEntering(true);
    completeOnboarding();
    await new Promise((resolve) => setTimeout(resolve, LOADER_MIN_MS));
    router.replace('/(tabs)/map');
  }, [completeOnboarding]);

  const continueAfterGps = useCallback(async () => {
    const offer = await getHomeScreenOfferKind();
    if (offer !== 'none') {
      setInstallKind(offer);
      return;
    }
    await enterMap();
  }, [enterMap]);

  const handleAuthorize = useCallback(async () => {
    if (Platform.OS === 'web') {
      void requestWebCompassPermission();
    }
    setBusy(true);
    try {
      const result = await requestLocationAccessResult();
      if (result.denied) {
        // In Cursor / localhost, never hard-block the tester.
        if (isLocalWebPreview()) {
          showToast({
            title: 'Aperçu local',
            description: 'GPS ignoré dans Cursor — tu peux continuer.',
            tone: 'default',
            durationMs: 2200,
          });
          await continueAfterGps();
          return;
        }
        setPhase('denied');
        return;
      }
      if (result.granted) {
        showToast({
          title: isLocalWebPreview() ? 'Aperçu local' : 'Position enregistrée',
          description: isLocalWebPreview()
            ? 'Tu peux tester la suite sans GPS réel.'
            : 'Le GPS est activé — direction la carte.',
          tone: 'success',
          durationMs: 2400,
        });
        await continueAfterGps();
        return;
      }
      if (isLocalWebPreview()) {
        await continueAfterGps();
        return;
      }
      if (Platform.OS !== 'web') {
        await openSystemLocationSettings();
      }
    } finally {
      setBusy(false);
    }
  }, [continueAfterGps, showToast]);

  if (entering) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <BrandLoader label="Bienvenue dans ton quartier…" />
      </View>
    );
  }

  const title =
    phase === 'denied'
      ? 'GPS refusé — CatDex est bloqué'
      : 'Autorise le suivi GPS';
  const description =
    phase === 'denied'
      ? 'Sans localisation, CatDex ne peut pas placer les chats près de toi ni faire fonctionner la carte. Active la position pour ce site dans Réglages → Safari → Localisation, puis réessaie.'
      : 'CatDex utilise ta position pour placer les chats près de toi et l’orientation du téléphone pour tourner la carte. Sans GPS, l’app ne peut pas fonctionner.';
  const primaryLabel =
    busy ? 'Ouverture…' : phase === 'denied' ? 'Réessayer' : 'Autoriser le GPS';

  return (
    <>
      <AuthShell
        plain
        fullHeight
        sheetStyle={{
          backgroundColor: colors.background,
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            paddingHorizontal: spacing[24],
          }}
        >
          <View
            style={[
              {
                backgroundColor: colors.surfaceElevated,
                borderRadius: radius.xl,
                borderWidth: 1,
                borderColor: colors.border,
                padding: spacing[24],
                gap: spacing[8],
              },
              shadow.floating,
            ]}
          >
            <ErrorState
              compact
              icon="location"
              title={title}
              description={description}
              primaryLabel={primaryLabel}
              onPrimary={() => {
                void handleAuthorize();
              }}
              secondaryLabel={isLocalWebPreview() ? 'Continuer sans GPS' : undefined}
              onSecondary={
                isLocalWebPreview()
                  ? () => {
                      void continueAfterGps();
                    }
                  : undefined
              }
              secondaryVariant="ghost"
            />
            {Platform.OS !== 'web' && phase === 'denied' ? (
              <Button
                title="Ouvrir les réglages"
                variant="secondary"
                onPress={() => {
                  void openSystemLocationSettings();
                }}
              />
            ) : null}
          </View>
        </View>
      </AuthShell>

      {installKind ? (
        <AddToHomeScreenSheet
          visible
          kind={installKind}
          onContinue={() => {
            void enterMap();
          }}
        />
      ) : null}
    </>
  );
}
