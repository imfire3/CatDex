import { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { EnablePermissionModal } from '@/components/EnablePermissionModal';
import { Text } from '@/components/Text';
import {
  isLocationActive,
  openSystemLocationSettings,
  requestLocationAccess,
} from '@/lib/locationAccess';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  /** Called after location becomes active (e.g. recenter map). */
  onActivated?: () => void;
};

/**
 * Map notice + modal when location permission / services are off.
 */
export function LocationInactiveBanner({ onActivated }: Props) {
  const { colors, spacing, radius, shadow, iconStroke } = useTheme();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [promptedOnce, setPromptedOnce] = useState(false);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const active = await isLocationActive();
    setVisible(!active);
    if (active) setModalVisible(false);
    return active;
  }, []);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      const active = await refresh();
      if (!mounted) return;
      if (!active && !promptedOnce) {
        setPromptedOnce(true);
        setModalVisible(true);
      }
    })().catch(() => {
      if (mounted) {
        setVisible(true);
        if (!promptedOnce) {
          setPromptedOnce(true);
          setModalVisible(true);
        }
      }
    });
    const timer = setInterval(() => {
      void refresh();
    }, 8_000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [promptedOnce, refresh]);

  const handleRetry = async () => {
    setBusy(true);
    try {
      const ok = await requestLocationAccess();
      if (ok) {
        setVisible(false);
        setModalVisible(false);
        onActivated?.();
        return;
      }
      if (Platform.OS !== 'web') {
        await openSystemLocationSettings();
      }
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  if (!visible) return null;

  return (
    <>
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          top: insets.top + spacing[8],
          left: spacing[16],
          right: spacing[16],
          zIndex: 40,
        }}
      >
        <View
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing[16],
              padding: spacing[16],
              borderRadius: radius.md,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.warning,
            },
            shadow.medium,
          ]}
        >
          <View
            style={{
              width: spacing[40],
              height: spacing[40],
              borderRadius: radius.full,
              backgroundColor: colors.warningSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z"
                stroke={colors.warning}
                strokeWidth={iconStroke.regular}
                strokeLinejoin="round"
              />
              <Circle
                cx="12"
                cy="10"
                r="2.5"
                stroke={colors.warning}
                strokeWidth={iconStroke.regular}
              />
            </Svg>
          </View>

          <View style={{ flex: 1, gap: spacing[4] }}>
            <Text variant="bodySmall" color="textBrand">
              Localisation désactivée
            </Text>
            <Text variant="caption" color="textSecondary">
              Active ta position pour voir les chats près de toi.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Activer la localisation"
            disabled={busy}
            onPress={() => setModalVisible(true)}
            hitSlop={8}
            style={({ pressed }) => ({
              paddingVertical: spacing[8],
              paddingHorizontal: spacing[16],
              borderRadius: radius.cta,
              backgroundColor: colors.accent,
              opacity: busy || pressed ? 0.85 : 1,
            })}
          >
            <Text variant="caption" color="onAccent">
              Activer
            </Text>
          </Pressable>
        </View>
      </View>

      <EnablePermissionModal
        visible={modalVisible}
        kind="location"
        onClose={() => setModalVisible(false)}
        onRetry={() => {
          void handleRetry();
        }}
        onOpenSettings={
          Platform.OS === 'web'
            ? undefined
            : () => {
                void openSystemLocationSettings();
              }
        }
      />
    </>
  );
}
