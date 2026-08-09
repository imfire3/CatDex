import { BlurView } from 'expo-blur';
import { CameraView, useCameraPermissions, type CameraType, type FlashMode } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { AnalysisLoadingView } from '@/components/scanner/AnalysisLoadingView';
import { AuthBackButton } from '@/components/Auth/AuthChrome';
import { Button } from '@/components/Button';
import { EnablePermissionModal } from '@/components/EnablePermissionModal';
import { ErrorState } from '@/components/ErrorState';
import { PageLoading } from '@/components/Loader';
import { ProgressBar } from '@/components/Progress';
import { ScanFrame } from '@/components/ScanFrame';
import { Text } from '@/components/Text';
import { analyzeCatPhoto } from '@/lib/api';
import {
  isInParis20e,
  PARIS_20E,
} from '@/lib/constants';
import { isNoCatFound } from '@/lib/catTraits';
import {
  classifyThrownAnalysisError,
  ERROR_CATALOG,
  formatAlreadyCapturedDescription,
  resolvePhotoProblemCopy,
} from '@/lib/errorCatalog';
import { resolvePersistentPhotoUri } from '@/lib/photoUri';
import { compressPhotoDataUri } from '@/lib/photoStorage';
import { sendAnalysisErrorReport } from '@/lib/sendErrorReport';
import { useCatsStore } from '@/store/cats';
import { usePendingCaptureStore } from '@/store/pendingCapture';
import { useToastStore } from '@/store/toast';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat, CatAnalysis } from '@/types/cat';

type Step =
  | 'camera'
  | 'analyzing'
  | 'review'
  | 'problem'
  | 'offline'
  | 'server'
  | 'analysisError'
  | 'alreadyCaptured';

/** Brief pause so the loading UI can paint — never pad a slow API. */
const MIN_ANALYSIS_MS = 600;

const FLASH_CYCLE: FlashMode[] = ['auto', 'on', 'off'];
const FLASH_LABELS: Record<FlashMode, string> = {
  auto: 'Auto',
  on: 'Marche',
  off: 'Arrêt',
};

function CameraCircleButton({
  onPress,
  accessibilityLabel,
  children,
  size,
  colors,
  radius,
  /** Solid fill — no translucent overlay / blur. */
  solid = false,
}: {
  onPress: () => void;
  accessibilityLabel: string;
  children: ReactNode;
  size: number;
  colors: ReturnType<typeof useTheme>['colors'];
  radius: ReturnType<typeof useTheme>['radius'];
  solid?: boolean;
}) {
  const fill = solid ? colors.brand : colors.overlay;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: radius.full,
        overflow: 'hidden',
        opacity: pressed ? 0.88 : 1,
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}
    >
      {Platform.OS === 'web' || solid ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: fill,
          }}
        >
          {children}
        </View>
      ) : (
        <BlurView intensity={48} tint="dark" style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          {children}
        </BlurView>
      )}
    </Pressable>
  );
}

export default function ScannerScreen() {
  const { colors, fonts, spacing, radius, shadow } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ worldId?: string }>();
  // Any sighting id (world spawn or community UUID) so the pin can clear after capture.
  const sourceWorldId =
    typeof params.worldId === 'string' && params.worldId.trim().length > 0
      ? params.worldId.trim()
      : undefined;
  const showToast = useToastStore((state) => state.show);
  const nextNumber = useCatsStore((state) => state.nextNumber);
  const cats = useCatsStore((state) => state.cats);
  const setPendingCapture = usePendingCaptureStore((state) => state.setPending);
  const cameraRef = useRef<CameraView>(null);
  const analysisGenRef = useRef(0);
  const runAnalysisRef = useRef<
    ((base64: string, imageUri: string, mimeType?: string) => Promise<void>) | null
  >(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [step, setStep] = useState<Step>('camera');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoMimeType, setPhotoMimeType] = useState('image/jpeg');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CatAnalysis | null>(null);
  const [analysisErrorMessage, setAnalysisErrorMessage] = useState<string | null>(
    null,
  );
  const [existingCat, setExistingCat] = useState<Cat | null>(null);
  const [allowRecapture, setAllowRecapture] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('auto');

  const alreadyCaptured = sourceWorldId
    ? cats.find((cat) => cat.sourceWorldId === sourceWorldId) ?? null
    : null;

  useEffect(() => {
    if (alreadyCaptured && !allowRecapture) {
      setExistingCat(alreadyCaptured);
      setStep('alreadyCaptured');
    }
  }, [alreadyCaptured, allowRecapture]);

  useEffect(() => {
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

  // US-03: auto-retry analysis when connectivity returns.
  useEffect(() => {
    if (step !== 'offline' || !photoBase64 || !photoUri) return;

    const retry = () => {
      void runAnalysisRef.current?.(photoBase64, photoUri, photoMimeType);
    };

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('online', retry);
      return () => window.removeEventListener('online', retry);
    }

    return undefined;
  }, [step, photoBase64, photoUri, photoMimeType]);

  const ensureLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        // Web geolocation can hang forever — fall back to Paris after 4s.
        const position = await Promise.race([
          Location.getCurrentPositionAsync({}).then((value) => ({ kind: 'ok' as const, value })),
          new Promise<{ kind: 'timeout' }>((resolve) => {
            setTimeout(() => resolve({ kind: 'timeout' }), 4_000);
          }),
        ]);
        if (position.kind === 'ok') return position.value;
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

  const enterReveal = async (
    nextAnalysis: CatAnalysis,
    imageUri: string,
    options?: {
      mocked?: boolean;
      photoBase64?: string | null;
      photoMimeType?: string;
    },
  ) => {
    const position = await ensureLocation();
    const { latitude, longitude } = position.coords;

    if (!isInParis20e(latitude, longitude) && __DEV__) {
      showToast({
        title: 'Hors du 20e',
        description: 'Zone de test : capture autorisée en développement.',
        tone: 'warning',
      });
    }

    if (options?.mocked) {
      showToast({
        title: 'Analyse refusée',
        description: 'L’API a renvoyé des données simulées — capture annulée.',
        tone: 'danger',
      });
      setStep('analysisError');
      return;
    }

    setPendingCapture({
      photoUri: imageUri,
      photoBase64: options?.photoBase64 ?? photoBase64 ?? undefined,
      photoMimeType: options?.photoMimeType ?? photoMimeType,
      analysis: nextAnalysis,
      latitude,
      longitude,
      nextNumber,
      sourceWorldId,
    });

    router.replace('/reward');
  };

  const runAnalysis = async (
    base64: string,
    imageUri: string,
    mimeType = 'image/jpeg',
  ) => {
    const gen = ++analysisGenRef.current;
    setAnalyzing(true);
    setAnalysisErrorMessage(null);
    setStep('analyzing');
    const startedAt = Date.now();

    const waitMinDuration = async () => {
      const elapsed = Date.now() - startedAt;
      const remaining = MIN_ANALYSIS_MS - elapsed;
      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }
    };

    const isStale = () => gen !== analysisGenRef.current;

    try {
      let payloadBase64 = base64;
      let payloadMime = mimeType;
      // Web: shrink before Vision (native already uses low capture quality).
      if (Platform.OS === 'web') {
        const dataUri = base64.startsWith('data:')
          ? base64
          : `data:${mimeType};base64,${base64}`;
        const compressed = await compressPhotoDataUri(dataUri, 960, 0.55);
        const match = /^data:([^;]+);base64,(.+)$/s.exec(compressed);
        if (match) {
          payloadMime = match[1] || mimeType;
          payloadBase64 = match[2];
        }
      }

      const { analysis: nextAnalysis, mocked, cutoutUri } = await analyzeCatPhoto(
        payloadBase64,
        payloadMime,
      );
      await waitMinDuration();
      if (isStale()) return;
      if (isNoCatFound(nextAnalysis)) {
        setPhotoUri(imageUri);
        setAnalysis(nextAnalysis);
        setStep('problem');
        return;
      }
      await enterReveal(
        nextAnalysis,
        cutoutUri ?? imageUri,
        {
          mocked,
          photoBase64: base64,
          photoMimeType: mimeType,
        },
      );
    } catch (error) {
      await waitMinDuration();
      if (isStale()) return;
      setPhotoUri(imageUri);
      const kind = classifyThrownAnalysisError(error);
      const detail =
        error instanceof Error && error.message.trim().length > 0
          ? error.message.trim()
          : null;
      setAnalysisErrorMessage(detail);
      setStep(
        kind === 'offline' ? 'offline' : kind === 'server' ? 'server' : 'analysisError',
      );
    } finally {
      if (!isStale()) setAnalyzing(false);
    }
  };

  runAnalysisRef.current = runAnalysis;

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
        // Lean JPEG → faster upload + Vision; storage still gets this capture.
        quality: 0.28,
        base64: true,
        exif: false,
        shutterSound: false,
      });
      const rawBase64 =
        photo?.base64 ??
        (typeof photo?.uri === 'string' && photo.uri.includes('base64,')
          ? photo.uri.split('base64,')[1]
          : null);
      // Persist as data URI — blob/file camera URIs die on web reload / AsyncStorage.
      const durableUri = resolvePersistentPhotoUri({
        uri: photo?.uri,
        base64: rawBase64,
        mimeType: 'image/jpeg',
      });
      if (!durableUri || !rawBase64) {
        showToast({
          title: 'Capture impossible',
          description: 'Réessaie ou choisis une photo dans la galerie.',
          tone: 'danger',
        });
        return;
      }
      setPhotoUri(durableUri);
      setPhotoBase64(rawBase64);
      setPhotoMimeType('image/jpeg');
      setStep('analyzing');
      setAnalyzing(true);
      void runAnalysis(rawBase64, durableUri, 'image/jpeg');
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
      quality: 0.28,
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
    const durableUri = resolvePersistentPhotoUri({
      uri: asset.uri,
      base64: asset.base64,
      mimeType,
    });
    if (!durableUri) {
      showToast({
        title: 'Image illisible',
        description: 'Choisis une autre photo (JPEG ou PNG).',
        tone: 'danger',
      });
      return;
    }
    setPhotoUri(durableUri);
    setPhotoBase64(asset.base64);
    setPhotoMimeType(mimeType);
    setStep('analyzing');
    setAnalyzing(true);
    void runAnalysis(asset.base64, durableUri, mimeType);
  };

  const handleOpenSettings = () => {
    void Linking.openSettings();
  };

  const resetToCamera = () => {
    analysisGenRef.current += 1;
    setAnalyzing(false);
    setStep('camera');
    setPhotoUri(null);
    setPhotoBase64(null);
    setPhotoMimeType('image/jpeg');
    setAnalysis(null);
  };

  const retryLastPhoto = () => {
    if (photoBase64 && photoUri) {
      void runAnalysis(photoBase64, photoUri, photoMimeType);
      return;
    }
    resetToCamera();
  };

  if (step === 'alreadyCaptured' && existingCat) {
    const copy = ERROR_CATALOG.alreadyCaptured;
    return (
      <View
        style={[
          styles.root,
          styles.centered,
          {
            backgroundColor: colors.background,
            paddingTop: insets.top + spacing[24],
            paddingBottom: Math.max(insets.bottom, spacing[24]),
            paddingHorizontal: spacing[24],
          },
        ]}
      >
        <ErrorState
          icon={copy.icon}
          title={copy.title}
          description={formatAlreadyCapturedDescription({
            discoveredAt: existingCat.discoveredAt,
            views: existingCat.views,
          })}
          primaryLabel={copy.primaryLabel}
          onPrimary={() =>
            router.replace({
              pathname: '/cat/[id]',
              params: { id: existingCat.id },
            })
          }
          secondaryLabel={copy.secondaryLabel}
          onSecondary={() => {
            setAllowRecapture(true);
            setExistingCat(null);
            resetToCamera();
          }}
        />
      </View>
    );
  }

  if (step === 'problem') {
    const copy = resolvePhotoProblemCopy(analysis);
    return (
      <View
        style={[
          styles.root,
          styles.centered,
          {
            backgroundColor: colors.background,
            paddingTop: insets.top + spacing[24],
            paddingBottom: Math.max(insets.bottom, spacing[24]),
            paddingHorizontal: spacing[24],
          },
        ]}
      >
        <ErrorState
          icon={copy.icon}
          title={copy.title}
          description={copy.description}
          primaryLabel={copy.primaryLabel}
          onPrimary={resetToCamera}
        />
      </View>
    );
  }

  if (step === 'offline') {
    const copy = ERROR_CATALOG.offline;
    return (
      <View
        style={[
          styles.root,
          styles.centered,
          {
            backgroundColor: colors.background,
            paddingTop: insets.top + spacing[24],
            paddingBottom: Math.max(insets.bottom, spacing[24]),
            paddingHorizontal: spacing[24],
          },
        ]}
      >
        <ErrorState
          icon={copy.icon}
          title={copy.title}
          description={analysisErrorMessage ?? copy.description}
          primaryLabel={copy.primaryLabel}
          onPrimary={retryLastPhoto}
        />
      </View>
    );
  }

  if (step === 'server') {
    const copy = ERROR_CATALOG.server;
    return (
      <View
        style={[
          styles.root,
          styles.centered,
          {
            backgroundColor: colors.background,
            paddingTop: insets.top + spacing[24],
            paddingBottom: Math.max(insets.bottom, spacing[24]),
            paddingHorizontal: spacing[24],
          },
        ]}
      >
        <ErrorState
          icon={copy.icon}
          title={copy.title}
          description={analysisErrorMessage ?? copy.description}
          primaryLabel={copy.primaryLabel}
          onPrimary={retryLastPhoto}
        />
      </View>
    );
  }

  if (step === 'analysisError') {
    const copy = ERROR_CATALOG.analysis;
    return (
      <View
        style={[
          styles.root,
          styles.centered,
          {
            backgroundColor: colors.background,
            paddingTop: insets.top + spacing[24],
            paddingBottom: Math.max(insets.bottom, spacing[24]),
            paddingHorizontal: spacing[24],
          },
        ]}
      >
        <ErrorState
          icon={copy.icon}
          title={copy.title}
          description={analysisErrorMessage ?? copy.description}
          primaryLabel={copy.primaryLabel}
          onPrimary={retryLastPhoto}
          secondaryLabel={copy.secondaryLabel}
          onSecondary={() => {
            void (async () => {
              await sendAnalysisErrorReport({
                errorKind: 'analysis',
                message: analysisErrorMessage ?? 'Impossible d’identifier ce chat',
              });
              showToast({
                title: 'Rapport envoyé',
                description: 'Merci — on regarde ça.',
                tone: 'success',
              });
            })();
          }}
        />
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <PageLoading label="Préparation de la caméra…" />
      </View>
    );
  }

  if (permission && !permission.granted) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <EnablePermissionModal
          visible
          kind="camera"
          title="Autorise la caméra"
          description="Pour scanner et capturer les chats que tu croises dans ton quartier."
          primaryLabel="Autoriser la caméra"
          onClose={() => {
            if (router.canGoBack()) router.back();
          }}
          onRetry={() => {
            void requestPermission();
          }}
          onOpenSettings={
            Platform.OS === 'web' ? undefined : handleOpenSettings
          }
          onDismissLabel="Galerie"
          onDismiss={handlePickFromLibrary}
        />
      </View>
    );
  }

  if ((step === 'analyzing' || analyzing) && photoUri) {
    return (
      <AnalysisLoadingView
        photoUri={photoUri}
        onBack={() => {
          analysisGenRef.current += 1;
          setAnalyzing(false);
          setStep('camera');
        }}
      />
    );
  }

  if (step === 'review' && photoUri) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View
          style={{
            flex: 1,
            paddingTop: insets.top + spacing[8],
            paddingHorizontal: spacing[24],
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: spacing[24],
            }}
          >
            <AuthBackButton onPress={() => router.back()} />
            <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: spacing[8] }}>
              <Text variant="h3" color="textBrand" align="center">
                Analyse
              </Text>
            </View>
            <View style={{ width: spacing[40] }} />
          </View>

          <View
            style={{
              backgroundColor: colors.surfaceElevated,
              borderRadius: radius.cta,
              padding: spacing[16],
              gap: spacing[16],
            }}
          >
            <ProgressBar progress={1} height={8} />
            <View style={{ gap: spacing[8] }}>
              <Text variant="h2" color="textBrand">
                Presque !
              </Text>
              <Text variant="bodySmall" color="textSecondary">
                Relance l’analyse ou reprends une photo.
              </Text>
            </View>
          </View>

          <View
            style={{
              marginTop: spacing[16],
              borderRadius: radius.cta,
              overflow: 'hidden',
              backgroundColor: colors.surfaceElevated,
            }}
          >
            <Image
              source={{ uri: photoUri }}
              style={{ width: '100%', height: spacing[96] * 2 + spacing[32] }}
              resizeMode="contain"
            />
          </View>

          <View
            style={{
              marginTop: 'auto',
              gap: spacing[8],
              paddingBottom: Math.max(insets.bottom, spacing[16]),
            }}
          >
            <Button
              title="Relancer l’analyse"
              onPress={() => photoBase64 && photoUri && runAnalysis(photoBase64, photoUri)}
            />
            <Button title="Réessayer avec une autre photo" variant="secondary" onPress={resetToCamera} />
          </View>
        </View>
      </View>
    );
  }

  const handleToggleFlash = () => {
    setFlash((current) => {
      const index = FLASH_CYCLE.indexOf(current);
      return FLASH_CYCLE[(index + 1) % FLASH_CYCLE.length];
    });
  };

  const handleFlipCamera = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const showFlashControls = Platform.OS !== 'web';
  const scanFrameSize = spacing[96] * 2 + spacing[32];
  const cameraControlSize = spacing[48];
  const shutterOuterSize = spacing[64] + spacing[16];
  const shutterInnerSize = spacing[64];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flash}
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

      {!cameraReady && !cameraError ? (
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

      {cameraError ? (
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

      {!cameraError ? (
        <View
          pointerEvents="box-none"
          style={[
            StyleSheet.absoluteFill,
            {
              paddingTop: insets.top + spacing[8],
              paddingBottom: insets.bottom + spacing[24],
              paddingHorizontal: spacing[24],
            },
          ]}
        >
          <View
            pointerEvents="box-none"
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ alignItems: 'center', gap: spacing[4] }}>
              {showFlashControls ? (
                <>
                  <CameraCircleButton
                    accessibilityLabel="Flash"
                    onPress={handleToggleFlash}
                    size={cameraControlSize}
                    colors={colors}
                    radius={radius}
                  >
                    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"
                        stroke={colors.onAccent}
                        strokeWidth={1.6}
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </CameraCircleButton>
                  <Text variant="caption" color="onAccent" style={{ fontFamily: fonts.bodySemi }}>
                    {FLASH_LABELS[flash]}
                  </Text>
                </>
              ) : (
                <View style={{ width: cameraControlSize }} />
              )}
            </View>

            <CameraCircleButton
              accessibilityLabel="Fermer"
              onPress={() => router.replace('/(tabs)/map')}
              size={cameraControlSize}
              colors={colors}
              radius={radius}
              solid
            >
              <Text color="onAccent" style={{ fontSize: 18, lineHeight: 20 }}>
                ✕
              </Text>
            </CameraCircleButton>
          </View>

          <View
            pointerEvents="box-none"
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing[24],
            }}
          >
            <ScanFrame size={scanFrameSize} color={colors.onAccent} rounded />
            <View
              style={{
                borderRadius: radius.full,
                overflow: 'hidden',
                maxWidth: '92%',
              }}
            >
              {Platform.OS === 'web' ? (
                <View
                  style={{
                    backgroundColor: colors.overlay,
                    paddingHorizontal: spacing[16],
                    paddingVertical: spacing[8],
                  }}
                >
                  <Text variant="bodySmall" color="onAccent" align="center">
                    {cameraReady ? 'Place le chat au centre' : 'Préparation…'}
                  </Text>
                </View>
              ) : (
                <BlurView
                  intensity={56}
                  tint="dark"
                  style={{ paddingHorizontal: spacing[16], paddingVertical: spacing[8] }}
                >
                  <Text
                    variant="bodySmall"
                    color="onAccent"
                    align="center"
                    style={{ fontFamily: fonts.bodySemi }}
                  >
                    {cameraReady ? 'Place le chat au centre' : 'Préparation…'}
                  </Text>
                </BlurView>
              )}
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <CameraCircleButton
              accessibilityLabel="Galerie"
              onPress={handlePickFromLibrary}
              size={cameraControlSize}
              colors={colors}
              radius={radius}
            >
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M5 7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7Z"
                  stroke={colors.onAccent}
                  strokeWidth={1.6}
                />
                <Path
                  d="M8 14l2.5-2.5L13 14l2-2 3 3"
                  stroke={colors.onAccent}
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Circle cx="9" cy="9" r="1.2" fill={colors.onAccent} />
              </Svg>
            </CameraCircleButton>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Prendre la photo"
              disabled={!cameraReady || capturing}
              onPress={handleTakePicture}
              style={({ pressed }) => ({
                width: shutterOuterSize,
                height: shutterOuterSize,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: !cameraReady || capturing ? 0.45 : 1,
                transform: [{ scale: pressed ? 0.94 : 1 }],
              })}
            >
              <Svg
                width={shutterOuterSize}
                height={shutterOuterSize}
                viewBox={`0 0 ${shutterOuterSize} ${shutterOuterSize}`}
                style={StyleSheet.absoluteFill}
              >
                <Circle
                  cx={shutterOuterSize / 2}
                  cy={shutterOuterSize / 2}
                  r={shutterOuterSize / 2 - 2}
                  stroke={colors.onAccent}
                  strokeWidth={3}
                  fill="none"
                  opacity={0.45}
                />
                <Circle
                  cx={shutterOuterSize / 2}
                  cy={shutterOuterSize / 2}
                  r={shutterOuterSize / 2 - 2}
                  stroke={colors.brand}
                  strokeWidth={3}
                  fill="none"
                  strokeDasharray="56 200"
                  strokeLinecap="round"
                  transform={`rotate(-38 ${shutterOuterSize / 2} ${shutterOuterSize / 2})`}
                />
              </Svg>
              <View
                style={{
                  width: shutterInnerSize,
                  height: shutterInnerSize,
                  borderRadius: radius.full,
                  backgroundColor: colors.onAccent,
                }}
              />
            </Pressable>

            <CameraCircleButton
              accessibilityLabel="Retourner la caméra"
              onPress={handleFlipCamera}
              size={cameraControlSize}
              colors={colors}
              radius={radius}
            >
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M7 7h4V3M17 17h-4v4M7 7l-3 3a5 5 0 0 0 8 4M17 17l3-3a5 5 0 0 0-8-4"
                  stroke={colors.onAccent}
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </CameraCircleButton>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  centered: {
    justifyContent: 'center',
  },
});
