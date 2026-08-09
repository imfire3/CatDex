import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';

import {
  getCameraAccessGranted,
  openSystemCameraSettings,
  requestCameraAccess,
} from '@/lib/cameraAccess';

type CaptureParams = { worldId?: string };

/**
 * Gate Capture → scanner behind a camera permission check.
 * Shows an in-map modal instead of a dedicated onboarding screen.
 */
export function useCaptureGate() {
  const [modalVisible, setModalVisible] = useState(false);
  const [pending, setPending] = useState<CaptureParams | null>(null);
  const [busy, setBusy] = useState(false);

  const openScanner = useCallback((params?: CaptureParams) => {
    if (params?.worldId) {
      router.push({ pathname: '/scanner', params: { worldId: params.worldId } });
      return;
    }
    router.push('/scanner');
  }, []);

  const requestCapture = useCallback(
    async (params?: CaptureParams) => {
      const granted = await getCameraAccessGranted();
      if (granted) {
        openScanner(params);
        return;
      }
      setPending(params ?? null);
      setModalVisible(true);
    },
    [openScanner],
  );

  const handleRetry = useCallback(async () => {
    setBusy(true);
    try {
      const ok = await requestCameraAccess();
      if (ok) {
        const next = pending;
        setModalVisible(false);
        setPending(null);
        openScanner(next ?? undefined);
        return;
      }
      if (Platform.OS !== 'web') {
        await openSystemCameraSettings();
      }
    } finally {
      setBusy(false);
    }
  }, [openScanner, pending]);

  const dismiss = useCallback(() => {
    setModalVisible(false);
    setPending(null);
  }, []);

  return {
    modalVisible,
    busy,
    requestCapture,
    handleRetry,
    dismiss,
    openSettings:
      Platform.OS === 'web'
        ? undefined
        : () => {
            void openSystemCameraSettings();
          },
  };
}
