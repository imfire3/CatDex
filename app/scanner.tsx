import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { PageLoading } from '@/components/Loader';
import { ScanFrame } from '@/components/ScanFrame';
import { ScannerReveal } from '@/components/scanner/ScannerReveal';
import { ScannerReview } from '@/components/scanner/ScannerReview';
import { Text } from '@/components/Text';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { analyzeCatPhoto } from '@/lib/api';
import {
  CATDEX_TARGET,
  formatCatDefaultName,
  isInParis20e,
  PARIS_20E,
} from '@/lib/constants';
import { getCaptureLocation } from '@/lib/location';
import { useCatsStore } from '@/store/cats';
import { useToastStore } from '@/store/toast';
import { useTheme } from '@/theme/ThemeProvider';
import type { CatAnalysis } from '@/types/cat';

type Step = 'camera' | 'review' | 'reveal';

export default function ScannerScreen() {
  const { colors, fonts, spacing, radius, shadow, motion } = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const showToast = useToastStore((state) => state.show);
  const nextNumber = useCatsStore((state) => state.nextNumber);
  const addCat = useCatsStore((state) => state.addCat);
  const cameraRef = useRef<CameraView>(null);
  const addingRef = useRef(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [step, setStep] = useState<Step>('camera');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CatAnalysis | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: PARIS_20E.center.latitude,
    longitude: PARIS_20E.center.longitude,
  });
  const scanLine = useSharedValue(0);
  const revealScale = useSharedValue(0.88);
  const revealOpacity = useSharedValue(0);
  const blurAmount = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion || step !== 'camera') return;
    scanLine.value = withRepeat(
      withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [reduceMotion, scanLine, step]);

  useEffect(() => {
    if (step !== 'reveal') return;
    if (reduceMotion) {
      revealScale.value = 1;
      revealOpacity.value = 1;
      blurAmount.value = 0;
      return;
    }
    revealScale.value = 0.88;
    revealOpacity.value = 0;
    blurAmount.value = 1;
    revealOpacity.value = withTiming(1, { duration: motion.duration.normal });
    revealScale.value = withSpring(1, motion.easing.spring);
    blurAmount.value = withTiming(0, { duration: motion.duration.reveal });
  }, [
    blurAmount,
    motion.duration.normal,
    motion.duration.reveal,
    motion.easing.spring,
    reduceMotion,
    revealOpacity,
    revealScale,
    step,
  ]);

  const scanStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLine.value * 200 }],
    opacity: 0.7,
  }));

  const revealCardStyle = useAnimatedStyle(() => ({
    opacity: revealOpacity.value,
    transform: [{ scale: revealScale.value }],
  }));

  const blurOverlayStyle = useAnimatedStyle(() => ({
    opacity: blurAmount.value,
  }));

  const enterReveal = async (nextAnalysis: CatAnalysis, imageUri: string, mocked?: boolean) => {
    const { latitude, longitude } = await getCaptureLocation();
    setCoords({ latitude, longitude });
    setAnalysis(nextAnalysis);
    setPhotoUri(imageUri);
    setStep('reveal');

    if (!isInParis20e(latitude, longitude) && __DEV__) {
      showToast({
        title: 'Hors du 20e',
        description: 'Zone de test : capture autorisée en développement.',
        tone: 'warning',
      });
    }

    if (mocked && __DEV__) {
      showToast({
        title: 'Analyse simulée',
        description: 'API indisponible — Cat Card mock.',
        tone: 'warning',
      });
    }
  };

  const runAnalysis = async (base64: string, imageUri: string) => {
    setAnalyzing(true);
    try {
      const { analysis: nextAnalysis, mocked } = await analyzeCatPhoto(base64);
      await enterReveal(nextAnalysis, imageUri, mocked);
    } catch (error) {
      showToast({
        title: 'Analyse indisponible',
        description:
          error instanceof Error
            ? error.message
            : 'Impossible de préparer la Cat Card. Réessaie.',
        tone: 'danger',
        durationMs: 4200,
      });
      setStep('review');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleTakePicture = async () => {
    const photo = await cameraRef.current?.takePictureAsync({
      quality: 0.7,
      base64: true,
    });
    if (!photo?.uri || !photo.base64) {
      showToast({
        title: 'Capture impossible',
        description: 'Réessaie ou choisis une photo dans la galerie.',
        tone: 'danger',
      });
      return;
    }
    setPhotoUri(photo.uri);
    setPhotoBase64(photo.base64);
    setStep('review');
    void runAnalysis(photo.base64, photo.uri);
  };

  const handlePickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: true,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    if (!asset.base64) {
      showToast({
        title: 'Image illisible',
        description: 'Choisis une autre photo (JPEG ou PNG).',
        tone: 'danger',
      });
      return;
    }
    setPhotoUri(asset.uri);
    setPhotoBase64(asset.base64);
    setStep('review');
    void runAnalysis(asset.base64, asset.uri);
  };

  const handleOpenSettings = () => {
    void Linking.openSettings();
  };

  const resetToCamera = () => {
    addingRef.current = false;
    setStep('camera');
    setPhotoUri(null);
    setPhotoBase64(null);
    setAnalysis(null);
  };

  const handleAddToCatDex = async () => {
    if (!photoUri || !analysis || addingRef.current) return;
    addingRef.current = true;

    const name =
      analysis.suggestedName?.trim() || formatCatDefaultName(nextNumber);
    const cat = addCat({
      photoUri,
      latitude: coords.latitude,
      longitude: coords.longitude,
      name,
      analysis,
    });

    if (Platform.OS !== 'web') {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        // ignore
      }
    }

    const remaining = Math.max(0, CATDEX_TARGET - cat.number);
    showToast({
      title: 'Ajouté au CatDex',
      description:
        remaining > 0
          ? `${cat.name} · Plus que ${remaining} chat${remaining > 1 ? 's' : ''}`
          : `${cat.name} · CatDex complet !`,
      tone: 'success',
    });

    router.replace({
      pathname: '/(tabs)/catdex',
      params: { justAdded: cat.id },
    });
  };

  if (Platform.OS !== 'web' && !permission) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <PageLoading label="Préparation de la caméra…" />
      </View>
    );
  }

  if (Platform.OS !== 'web' && permission && !permission.granted) {
    return (
      <View
        style={[
          styles.root,
          styles.centered,
          {
            backgroundColor: colors.background,
            paddingTop: insets.top,
            gap: spacing[16],
            paddingHorizontal: spacing[24],
          },
        ]}
      >
        <Text variant="h3" align="center">
          Autorise la caméra
        </Text>
        <Text variant="bodySmall" color="textSecondary" align="center">
          Pour photographier les chats autour de toi.
        </Text>
        <Button title="Autoriser" onPress={requestPermission} />
        {permission.canAskAgain === false ? (
          <Button title="Ouvrir les réglages" variant="secondary" onPress={handleOpenSettings} />
        ) : null}
        <Button title="Galerie" variant="secondary" onPress={handlePickFromLibrary} />
        <Button title="Fermer" variant="ghost" onPress={() => router.back()} />
      </View>
    );
  }

  if (step === 'reveal' && photoUri && analysis) {
    return (
      <ScannerReveal
        photoUri={photoUri}
        analysis={analysis}
        nextNumber={nextNumber}
        insets={insets}
        revealCardStyle={revealCardStyle}
        blurOverlayStyle={blurOverlayStyle}
        onAdd={() => void handleAddToCatDex()}
        onRetake={resetToCamera}
      />
    );
  }

  if (step === 'review' && photoUri) {
    return (
      <ScannerReview
        photoUri={photoUri}
        analyzing={analyzing}
        insets={insets}
        onRetry={() => {
          if (photoBase64 && photoUri) void runAnalysis(photoBase64, photoUri);
        }}
        onRetake={resetToCamera}
      />
    );
  }

  const isWebCamera = Platform.OS === 'web';

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {!isWebCamera ? (
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surface }]} />
      )}

      <View
        style={{
          flex: 1,
          paddingTop: insets.top + spacing[8],
          paddingBottom: insets.bottom + spacing[32],
          paddingHorizontal: spacing[24],
          justifyContent: 'space-between',
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fermer"
          onPress={() => router.back()}
          style={({ pressed }) => [
            {
              width: spacing[40],
              height: spacing[40],
              borderRadius: radius.full,
              backgroundColor: colors.overlay,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text color="onAccent">✕</Text>
        </Pressable>

        <View style={{ alignItems: 'center', gap: spacing[24] }}>
          <View
            style={{
              width: spacing[96] * 2 + spacing[64],
              height: spacing[96] * 2 + spacing[64],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ScanFrame size={spacing[96] * 2 + spacing[64]} color={colors.accent} />
            {!reduceMotion ? (
              <Animated.View
                style={[
                  {
                    position: 'absolute',
                    top: spacing[24],
                    left: spacing[24],
                    right: spacing[24],
                    height: spacing[4],
                    backgroundColor: colors.accent,
                  },
                  scanStyle,
                ]}
              />
            ) : null}
          </View>
          <Text
            variant="body"
            color={isWebCamera ? 'text' : 'onAccent'}
            align="center"
            style={{ fontFamily: fonts.bodySemi }}
          >
            Cadre un chat
          </Text>
          {isWebCamera ? (
            <Text variant="caption" color="textSecondary" align="center">
              Sur le web, choisis une photo
            </Text>
          ) : null}
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing[48],
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Galerie"
            onPress={handlePickFromLibrary}
            style={({ pressed }) => ({
              width: spacing[48],
              height: spacing[48],
              borderRadius: radius.lg,
              backgroundColor: colors.overlay,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text color="onAccent">🖼</Text>
          </Pressable>

          {isWebCamera ? (
            <Button title="Choisir une photo" onPress={handlePickFromLibrary} fullWidth={false} />
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Prendre la photo"
              onPress={handleTakePicture}
              style={({ pressed }) => [
                {
                  width: spacing[64] + spacing[16],
                  height: spacing[64] + spacing[16],
                  borderRadius: radius['2xl'],
                  backgroundColor: colors.accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: [{ scale: pressed ? 0.94 : 1 }],
                },
                shadow.medium,
              ]}
            >
              <View
                style={{
                  width: spacing[64],
                  height: spacing[64],
                  borderRadius: radius.xl,
                  borderWidth: spacing[4],
                  borderColor: colors.onAccent,
                }}
              />
            </Pressable>
          )}

          <View style={{ width: spacing[48] }} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  centered: {
    justifyContent: 'center',
  },
});
