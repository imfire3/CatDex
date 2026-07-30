import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
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

import { Button } from '@/components/Button';
import { TextInput } from '@/components/Input';
import { Spinner } from '@/components/Loader';
import { ScanFrame } from '@/components/ScanFrame';
import { Text } from '@/components/Text';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { analyzeCatPhoto } from '@/lib/api';
import { isInParis20e, PARIS_20E } from '@/lib/constants';
import { useTheme } from '@/theme/ThemeProvider';
import type { CatAnalysis } from '@/types/cat';

type Step = 'camera' | 'review';

export default function ScannerScreen() {
  const { colors, fonts, spacing, radius, shadow } = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [step, setStep] = useState<Step>('camera');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const scanLine = useSharedValue(0);

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

  const goToDiscovery = async (
    analysis: CatAnalysis,
    imageUri: string,
    mocked?: boolean,
  ) => {
    const position = await ensureLocation();
    const { latitude, longitude } = position.coords;

    if (!isInParis20e(latitude, longitude) && __DEV__) {
      Alert.alert(
        'Hors du 20e',
        'Capture hors zone autorisée en développement. En production, la zone sera restreinte.',
      );
    }

    router.replace({
      pathname: '/discovery',
      params: {
        photoUri: imageUri,
        name: name.trim() || analysis.suggestedName || '',
        notes,
        latitude: String(latitude),
        longitude: String(longitude),
        color: analysis.color,
        breed: analysis.breed,
        coat: analysis.coat,
        description: analysis.description,
        suggestedName: analysis.suggestedName ?? '',
        mocked: mocked ? '1' : '0',
      },
    });
  };

  const runAnalysis = async (base64: string, imageUri: string) => {
    setAnalyzing(true);
    try {
      const { analysis, mocked } = await analyzeCatPhoto(base64);
      await goToDiscovery(analysis, imageUri, mocked);
    } catch (error) {
      Alert.alert(
        'Analyse indisponible',
        error instanceof Error
          ? `${error.message}\n\nVérifie que le serveur tourne (npm run server) et que OPENAI_API_KEY est défini.`
          : 'Impossible d’analyser la photo.',
      );
      setStep('review');
    } finally {
      setAnalyzing(false);
    }
  };

  const takePicture = async () => {
    const photo = await cameraRef.current?.takePictureAsync({
      quality: 0.7,
      base64: true,
    });
    if (!photo?.uri || !photo.base64) return;
    setPhotoUri(photo.uri);
    setPhotoBase64(photo.base64);
    setStep('review');
    void runAnalysis(photo.base64, photo.uri);
  };

  const pickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: true,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    if (!asset.base64) {
      Alert.alert('Erreur', 'Impossible de lire cette image.');
      return;
    }
    setPhotoUri(asset.uri);
    setPhotoBase64(asset.base64);
    setStep('review');
    void runAnalysis(asset.base64, asset.uri);
  };

  if (Platform.OS !== 'web' && !permission) {
    return <View style={[styles.root, { backgroundColor: colors.background }]} />;
  }

  if (Platform.OS !== 'web' && permission && !permission.granted) {
    return (
      <View
        style={[
          styles.root,
          styles.centered,
          { backgroundColor: colors.background, paddingTop: insets.top, gap: spacing[16] },
        ]}
      >
        <Text variant="h3" align="center">
          Autorise la caméra
        </Text>
        <Text variant="bodySmall" color="textSecondary" align="center">
          Pour photographier les chats autour de toi.
        </Text>
        <Button title="Autoriser" onPress={requestPermission} />
        <Button title="Galerie" variant="secondary" onPress={pickFromLibrary} />
        <Button title="Fermer" variant="ghost" onPress={() => router.back()} />
      </View>
    );
  }

  if (step === 'review' && photoUri) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={{ paddingHorizontal: spacing[24], paddingTop: spacing[16], gap: spacing[8] }}>
          <Text variant="h2">{analyzing ? 'Analyse…' : 'Confirmer'}</Text>
          <Text variant="bodySmall" color="textSecondary">
            {analyzing
              ? 'L’IA décrit ton chat et prépare la fiche.'
              : 'Relance l’analyse ou reprends une photo.'}
          </Text>
        </View>

        <Image
          source={{ uri: photoUri }}
          style={{
            marginHorizontal: spacing[24],
            marginTop: spacing[24],
            height: 280,
            borderRadius: radius.xl,
          }}
        />

        {!analyzing ? (
          <View style={{ padding: spacing[24], gap: spacing[16] }}>
            <TextInput placeholder="Nom (optionnel)" value={name} onChangeText={setName} />
            <TextInput
              placeholder="Notes (optionnel)"
              value={notes}
              onChangeText={setNotes}
              multiline
              style={{ minHeight: spacing[96], textAlignVertical: 'top' }}
            />
          </View>
        ) : null}

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
              <Spinner size="lg" />
              <Text variant="bodySmall" color="textSecondary">
                Description en cours…
              </Text>
            </View>
          ) : (
            <>
              <Button
                title="Relancer l’analyse"
                onPress={() => photoBase64 && photoUri && runAnalysis(photoBase64, photoUri)}
              />
              <Button title="Reprendre" variant="ghost" onPress={() => setStep('camera')} />
            </>
          )}
        </View>
      </View>
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
          <View style={{ width: 256, height: 256, alignItems: 'center', justifyContent: 'center' }}>
            <ScanFrame size={256} color={colors.accent} />
            {!reduceMotion ? (
              <Animated.View
                style={[
                  {
                    position: 'absolute',
                    top: spacing[24],
                    left: spacing[24],
                    right: spacing[24],
                    height: 2,
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
            onPress={pickFromLibrary}
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
            <Button title="Choisir une photo" onPress={pickFromLibrary} fullWidth={false} />
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Prendre la photo"
              onPress={takePicture}
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
    padding: 24,
  },
});
