import { Camera } from 'expo-camera';
import * as Linking from 'expo-linking';
import { useCallback, useEffect, useState } from 'react';
import { AppState, Platform, View } from 'react-native';

import { Button } from '@/components/Button';
import {
  IconCamera,
  IconPin,
  SettingsRow,
  SettingsScreen,
  SettingsSection,
} from '@/components/Settings';
import { Text } from '@/components/Text';
import {
  getLocationAccessState,
  openSystemLocationSettings,
} from '@/lib/locationAccess';
import { useTheme } from '@/theme/ThemeProvider';
import * as Location from 'expo-location';

type PermLabel = string;

function cameraLabel(status: string | null): PermLabel {
  if (!status) return '…';
  if (status === 'granted') return 'Autorisée';
  if (status === 'denied') return 'Refusée';
  return 'Non définie';
}

function locationLabel(
  status: Location.PermissionStatus | null,
  servicesEnabled: boolean | null,
): PermLabel {
  if (status == null) return '…';
  if (status === Location.PermissionStatus.GRANTED) {
    if (servicesEnabled === false) return 'Services désactivés';
    // Expo foreground ≠ “Toujours” ; on reste honnête pour le MVP.
    return Platform.OS === 'ios' ? 'Pendant l’utilisation' : 'Autorisée';
  }
  if (status === Location.PermissionStatus.DENIED) return 'Refusée';
  return 'Non définie';
}

export default function PrivacySettingsScreen() {
  const { colors, spacing, radius, shadow } = useTheme();
  const [cameraStatus, setCameraStatus] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<Location.PermissionStatus | null>(
    null,
  );
  const [servicesEnabled, setServicesEnabled] = useState<boolean | null>(null);

  const refresh = useCallback(async () => {
    try {
      const cam = await Camera.getCameraPermissionsAsync();
      setCameraStatus(cam.status);
    } catch {
      setCameraStatus('undetermined');
    }
    try {
      const loc = await getLocationAccessState();
      setLocationStatus(loc.permission);
      setServicesEnabled(loc.servicesEnabled);
    } catch {
      setLocationStatus(Location.PermissionStatus.UNDETERMINED);
      setServicesEnabled(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  const openSettings = () => {
    void (async () => {
      if (Platform.OS === 'web') {
        await Linking.openSettings().catch(() => undefined);
        return;
      }
      await openSystemLocationSettings();
      await Linking.openSettings().catch(() => undefined);
    })();
  };

  return (
    <SettingsScreen
      title="Confidentialité"
      subtitle="CatDex utilise la caméra pour scanner et la localisation pour la carte."
      footer={<Button title="Ouvrir les réglages" variant="secondary" onPress={openSettings} />}
    >
      <SettingsSection title="Autorisations">
        <SettingsRow
          kind="value"
          icon={<IconCamera />}
          title="Caméra"
          value={cameraLabel(cameraStatus)}
        />
        <SettingsRow
          kind="value"
          icon={<IconPin />}
          title="Localisation"
          value={locationLabel(locationStatus, servicesEnabled)}
          showDivider={false}
        />
      </SettingsSection>

      <View
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
        <Text variant="bodySmall" weight="semibold" color="textBody">
          Astuce
        </Text>
        <Text variant="caption" color="textSecondary">
          Pour changer une autorisation, utilise le bouton ci-dessous. CatDex n’essaie pas de
          recopier les réglages de ton téléphone.
        </Text>
      </View>
    </SettingsScreen>
  );
}
