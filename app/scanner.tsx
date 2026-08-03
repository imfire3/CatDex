import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Image,
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
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Button } from '@/components/Button';
import { CatCardDetail } from '@/components/CatCardDetail';
import { PageLoading, Skeleton } from '@/components/Loader';
import { ProblemState } from '@/components/ProblemState';
import { ProgressBar } from '@/components/Progress';
import { ScanFrame } from '@/components/ScanFrame';
import { Text } from '@/components/Text';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { analyzeCatPhoto } from '@/lib/api';
import {
  CATDEX_TARGET,
  formatCatDefaultName,
  isInParis20e,
  PARIS_20E,
} from '@/lib/constants';
import { enrichAnalysis, isNoCatFound } from '@/lib/catTraits';
import { useCatsStore } from '@/store/cats';
import { useToastStore } from '@/store/toast';
import { useTheme } from '@/theme/ThemeProvider';
import type { CatAnalysis } from '@/types/cat';

type Step = 'camera' | 'review' | 'reveal' | 'problem';

export default function ScannerScreen() {
  const { colors, fonts, spacing, radius, shadow } = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const showToast = useToastStore((state) => state.show);
  const nextNumber = useCatsStore((state) => state.nextNumber);
  const addCat = useCatsStore((state) => state.addCat);
  const cameraRef = useRef<CameraView>(null);
  const addingRef = useRef(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
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

  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (permission && !permission.granted && permission.canAskAgain !== false) {
      void requestPermission();
    }
  }, [permission, requestPermission]);

  useEffect(() => {
    if (step !== 'camera') {
      setCameraReady(false);
      setCameraError(null);
    }
  }, [step]);

  useEffect(() => {
    if (reduceMotion || step !== 'camera') return;
    scanLine.value = withRepeat(
      withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [reduceMotion, scanLine, step]);

  const scanStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLine.value * 200 }],
    opacity: 0.7,
  }));

  const ensureLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        return Location.getCurrentPositionAsync({});
      }
    } catch {
      // fallback
    }
    return {
      coords: {
        latitude: PARIS_20E.center.latitude,
        longitude: PARIS_20E.center.longitude,
      },
    } as Location.LocationObject;
  };

  const enterReveal = async (nextAnalysis: CatAnalysis, imageUri: string, mocked?: boolean) => {
    const position = await ensureLocation();
    const { latitude, longitude } = position.coords;
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

  const runAnalysis = async (
    base64: string,
    imageUri: string,
    mimeType = 'image/jpeg',
  ) => {
    setAnalyzing(true);
    try {
      const { analysis: nextAnalysis, mocked } = await analyzeCatPhoto(base64, mimeType);
      if (isNoCatFound(nextAnalysis)) {
        setPhotoUri(imageUri);
        setAnalysis(nextAnalysis);
        setStep('problem');
        return;
      }
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
    if (capturing) return;
    if (!cameraReady || !cameraRef.current) {
      showToast({
        title: 'Caméra pas prête',
        description: 'Attends le flux vidéo, ou choisis une photo dans la galerie.',
        tone: 'warning',
      });
      return;
    }

    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.45,
        base64: true,
        exif: false,
        shutterSound: false,
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
      void runAnalysis(photo.base64, photo.uri, 'image/jpeg');
    } catch (error) {
      showToast({
        title: 'Capture impossible',
        description:
          error instanceof Error
            ? error.message
            : 'Réessaie ou choisis une photo dans la galerie.',
        tone: 'danger',
      });
    } finally {
      setCapturing(false);
    }
  };

  const handlePickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.55,
      base64: true,
      exif: false,
      preferredAssetRepresentationMode:
        ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
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
    const mimeType =
      asset.mimeType && !/heic|heif/i.test(asset.mimeType)
        ? asset.mimeType
        : 'image/jpeg';
    setPhotoUri(asset.uri);
    setPhotoBase64(asset.base64);
    setStep('review');
    void runAnalysis(asset.base64, asset.uri, mimeType);
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
      analysis: enrichAnalysis(analysis, nextNumber),
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

  if (step === 'problem') {
    return (
      <ProblemState
        title="Oups"
        description="Il y a un problème — aucun chat n'a été trouvé sur cette photo."
        actionLabel="Retour"
        onAction={() => {
          if (router.canGoBack()) router.back();
          else resetToCamera();
        }}
      />
    );
  }

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
    const displayName =
      analysis.suggestedName?.trim() || formatCatDefaultName(nextNumber);
    const enriched = enrichAnalysis(analysis, nextNumber);

    return (
      <CatCardDetail
        name={displayName}
        number={nextNumber}
        photoUri={photoUri}
        analysis={enriched}
        discoveredAt={new Date().toISOString()}
        views={0}
        onBack={() => {
          if (router.canGoBack()) router.back();
          else resetToCamera();
        }}
        primaryLabel="Ajouter à ma collection"
        onPrimaryAction={() => {
          void handleAddToCatDex();
        }}
        secondaryLabel="Reprendre la photo"
        onSecondaryAction={resetToCamera}
      />
    );
  }

  if (step === 'review' && photoUri) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        {/* Header: close · flash · frame (mock) */}
        <View
          style={{
            paddingHorizontal: spacing[16],
            paddingTop: spacing[8],
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fermer"
            onPress={() => router.back()}
            style={({ pressed }) => [
              {
                width: spacing[48],
                height: spacing[48],
                borderRadius: radius.full,
                backgroundColor: colors.surfaceSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text color="textBrand" style={{ fontSize: 18, lineHeight: 20 }}>
              ✕
            </Text>
          </Pressable>

          <View
            style={{
              width: spacing[48],
              height: spacing[48],
              borderRadius: radius.full,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path
                d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"
                stroke={colors.brand}
                strokeWidth={1.6}
                strokeLinejoin="round"
              />
            </Svg>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Galerie"
            onPress={handlePickFromLibrary}
            style={({ pressed }) => [
              {
                width: spacing[48],
                height: spacing[48],
                borderRadius: radius.full,
                backgroundColor: colors.surfaceSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Rect
                x="5"
                y="5"
                width="14"
                height="14"
                rx="2"
                stroke={colors.brand}
                strokeWidth={1.6}
              />
              <Path
                d="M9 9h.01M15 9h.01M9 15h.01M15 15h.01"
                stroke={colors.brand}
                strokeWidth={2}
                strokeLinecap="round"
              />
            </Svg>
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: spacing[24], paddingTop: spacing[16], gap: spacing[16] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[8] }}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 7v5l3 2"
                stroke={colors.textMuted}
                strokeWidth={1.6}
                strokeLinecap="round"
              />
              <Circle cx="12" cy="12" r="8" stroke={colors.textMuted} strokeWidth={1.6} />
            </Svg>
            <Text variant="caption" color="textMuted" style={{ fontFamily: fonts.bodySemi }}>
              {analyzing ? 'Analyse' : 'Prêt'}
            </Text>
          </View>
          {analyzing ? <ProgressBar progress={0.62} height={8} /> : <ProgressBar progress={1} height={8} />}

          <View style={{ gap: spacing[8] }}>
            <Text variant="h2" color="textBrand">
              {analyzing ? 'Analyse…' : 'Presque !'}
            </Text>
            <Text variant="bodySmall" color="textSecondary">
              {analyzing
                ? 'Ta Cat Card se prépare. Un instant.'
                : 'Relance l’analyse ou reprends une photo.'}
            </Text>
          </View>
        </View>

        <View
          style={[
            {
              marginHorizontal: spacing[24],
              marginTop: spacing[24],
              borderRadius: radius.lg,
              overflow: 'hidden',
              backgroundColor: colors.surfaceSecondary,
              borderWidth: 1,
              borderColor: colors.border,
            },
            shadow.low,
          ]}
        >
          <Image
            source={{ uri: photoUri }}
            style={{ width: '100%', height: spacing[96] * 2 + spacing[64] }}
          />
          {analyzing ? (
            <View
              style={{
                position: 'absolute',
                left: spacing[16],
                right: spacing[16],
                bottom: spacing[16],
                gap: spacing[8],
              }}
            >
              <Skeleton height={spacing[16]} width="55%" />
              <Skeleton height={spacing[8]} width="80%" />
              <Skeleton height={spacing[8]} width="40%" />
            </View>
          ) : null}
        </View>

        <View
          style={{
            marginTop: 'auto',
            paddingHorizontal: spacing[24],
            paddingBottom: insets.bottom + spacing[16],
            gap: spacing[8],
          }}
        >
          {analyzing ? (
            <View style={{ alignItems: 'center', gap: spacing[16], paddingVertical: spacing[16] }}>
              <Text variant="bodySmall" color="textSecondary">
                Révélation en cours…
              </Text>
            </View>
          ) : (
            <>
              <Button
                title="Relancer l’analyse"
                onPress={() => photoBase64 && photoUri && runAnalysis(photoBase64, photoUri)}
                icon={
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M12 3l1.2 3.6L17 8l-3.8 1.4L12 13l-1.2-3.6L7 8l3.8-1.4L12 3Z"
                      fill={colors.onAccent}
                    />
                    <Path
                      d="M18 13l.7 2.1L21 16l-2.3.8L18 19l-.7-2.2L15 16l2.3-.9L18 13Z"
                      fill={colors.onAccent}
                    />
                  </Svg>
                }
              />
              <Button
                title="Reprendre la photo"
                variant="secondary"
                onPress={resetToCamera}
                icon={
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M4 8V6.5A1.5 1.5 0 0 1 5.5 5H8M16 5h2.5A1.5 1.5 0 0 1 20 6.5V8M20 16v1.5a1.5 1.5 0 0 1-1.5 1.5H16M8 19H5.5A1.5 1.5 0 0 1 4 17.5V16"
                      stroke={colors.brand}
                      strokeWidth={1.6}
                      strokeLinecap="round"
                    />
                    <Path
                      d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                      stroke={colors.brand}
                      strokeWidth={1.6}
                    />
                  </Svg>
                }
              />
            </>
          )}
        </View>
      </View>
    );
  }

  const isWebCamera = Platform.OS === 'web';

  return (
    <View style={[styles.root, { backgroundColor: colors.text }]}>
      {!isWebCamera ? (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          mode="picture"
          onCameraReady={() => {
            setCameraReady(true);
            setCameraError(null);
          }}
          onMountError={(event) => {
            setCameraReady(false);
            const message =
              typeof event === 'object' && event && 'message' in event
                ? String((event as { message?: string }).message ?? '')
                : '';
            setCameraError(
              message || 'Impossible d’ouvrir la caméra sur cet appareil.',
            );
          }}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surface }]} />
      )}

      {!isWebCamera && !cameraReady && !cameraError ? (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.overlay,
            },
          ]}
        >
          <PageLoading label="Ouverture de la caméra…" />
        </View>
      ) : null}

      {!isWebCamera && cameraError ? (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: spacing[24],
              gap: spacing[16],
              backgroundColor: colors.background,
            },
          ]}
        >
          <Text variant="h3" align="center" color="textBrand">
            Caméra indisponible
          </Text>
          <Text variant="bodySmall" color="textSecondary" align="center">
            {cameraError}
          </Text>
          <Button title="Choisir une photo" onPress={handlePickFromLibrary} />
          <Button title="Fermer" variant="ghost" onPress={() => router.back()} />
        </View>
      ) : null}

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
            {cameraReady || isWebCamera ? 'Cadre un chat' : 'Préparation…'}
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
              disabled={!cameraReady || capturing}
              onPress={handleTakePicture}
              style={({ pressed }) => [
                {
                  width: spacing[64] + spacing[16],
                  height: spacing[64] + spacing[16],
                  borderRadius: radius['2xl'],
                  backgroundColor: colors.accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: !cameraReady || capturing ? 0.45 : pressed ? 0.9 : 1,
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
