import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { SettingsScreen } from '@/components/Settings';
import { Text } from '@/components/Text';
import { useToastStore } from '@/store/toast';
import { useTheme } from '@/theme/ThemeProvider';

/** Friendly placeholder until a real cache meter is wired. */
const CACHE_LABEL = '≈ 12 Mo';

export default function CacheSettingsScreen() {
  const { colors, spacing, radius, shadow } = useTheme();
  const showToast = useToastStore((s) => s.show);
  const [clearing, setClearing] = useState(false);
  const [cacheLabel, setCacheLabel] = useState(CACHE_LABEL);

  const handleClear = () => {
    setClearing(true);
    // Soft clear: UI feedback only for MVP (no collection wipe).
    setTimeout(() => {
      setCacheLabel('0 Mo');
      setClearing(false);
      showToast({
        title: 'Cache vidé',
        description: 'Les fichiers temporaires ont été nettoyés. Ton CatDex est intact.',
        tone: 'success',
      });
    }, 400);
  };

  return (
    <SettingsScreen
      title="Vider le cache"
      subtitle="Supprime les fichiers temporaires sans perdre ta collection."
      footer={
        <Button
          title="Vider le cache"
          variant="secondary"
          loading={clearing}
          onPress={handleClear}
        />
      }
    >
      <View
        style={[
          {
            backgroundColor: colors.surfaceElevated,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing[24],
            gap: spacing[8],
          },
          shadow.low,
        ]}
      >
        <Text variant="caption" weight="semibold" color="textMuted">
          Cache actuel
        </Text>
        <Text variant="title" color="textBrand">
          {cacheLabel}
        </Text>
        <Text variant="bodySmall" color="textSecondary">
          Images temporaires et données de session. Tes chats restent dans ton CatDex.
        </Text>
      </View>
    </SettingsScreen>
  );
}
