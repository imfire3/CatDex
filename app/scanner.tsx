import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { analyzeCatPhoto } from '@/lib/api';
import { isInParis20e, PARIS_20E } from '@/lib/constants';
import { useTheme } from '@/theme/ThemeProvider';
import type { CatAnalysis } from '@/types/cat';

type Step = 'camera' | 'review';

export default function ScannerScreen() {
  const { colors, fonts } = useTheme();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [step, setStep] = useState<Step>(Platform.OS === 'web' ? 'camera' : 'camera');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const ensureLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        return Location.getCurrentPositionAsync({});
      }
    } catch {
      // fall through to Paris 20e default for local web testing
    }

    return {
      coords: {
        latitude: PARIS_20E.center.latitude,
        longitude: PARIS_20E.center.longitude,
      },
    } as Location.LocationObject;
  };

  const goToDiscovery = async (analysis: CatAnalysis) => {
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
        photoUri: photoUri ?? '',
        name,
        notes,
        latitude: String(latitude),
        longitude: String(longitude),
        color: analysis.color,
        breed: analysis.breed,
        coat: analysis.coat,
        description: analysis.description,
      },
    });
  };

  const runAnalysis = async (base64: string) => {
    setAnalyzing(true);
    try {
      const { analysis } = await analyzeCatPhoto(base64);
      await goToDiscovery(analysis);
    } catch (error) {
      Alert.alert(
        'Analyse indisponible',
        error instanceof Error
          ? `${error.message}\n\nVérifie que le serveur tourne et que OPENAI_API_KEY est défini.`
          : 'Impossible d’analyser la photo.',
      );
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
          { backgroundColor: colors.background, paddingTop: insets.top },
        ]}
      >
        <Text style={[styles.message, { color: colors.text, fontFamily: fonts.bodySemi }]}>
          Autorise la caméra pour scanner un chat.
        </Text>
        <Button title="Autoriser la caméra" onPress={requestPermission} />
        <Button title="Choisir une photo" variant="secondary" onPress={pickFromLibrary} />
        <Button title="Fermer" variant="ghost" onPress={() => router.back()} />
      </View>
    );
  }

  if (Platform.OS === 'web' && step === 'camera') {
    return (
      <View
        style={[
          styles.root,
          styles.centered,
          { backgroundColor: colors.background, paddingTop: insets.top },
        ]}
      >
        <Text style={[styles.message, { color: colors.text, fontFamily: fonts.bodySemi }]}>
          Sur le web, choisis une photo de chat depuis ton ordinateur.
        </Text>
        <Button title="Choisir une photo" onPress={pickFromLibrary} />
        <Button title="Fermer" variant="ghost" onPress={() => router.back()} />
      </View>
    );
  }

  if (step === 'review' && photoUri) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text, fontFamily: fonts.display }]}>
            Validation
          </Text>
          <Text style={[styles.sub, { color: colors.textMuted, fontFamily: fonts.body }]}>
            Nom et notes sont optionnels. Le reste sera détecté par l’IA.
          </Text>
        </View>

        <Image source={{ uri: photoUri }} style={styles.preview} />

        <View style={styles.form}>
          <TextInput
            placeholder="Nom du chat (optionnel)"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
                fontFamily: fonts.body,
              },
            ]}
          />
          <TextInput
            placeholder="Notes (optionnel)"
            placeholderTextColor={colors.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            style={[
              styles.input,
              styles.notes,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
                fontFamily: fonts.body,
              },
            ]}
          />
        </View>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          {analyzing ? (
            <View style={styles.analyzing}>
              <ActivityIndicator color={colors.accent} />
              <Text style={{ color: colors.textMuted, fontFamily: fonts.bodyMedium }}>
                Analyse IA en cours…
              </Text>
            </View>
          ) : (
            <>
              <Button
                title="Analyser et découvrir"
                onPress={() => photoBase64 && runAnalysis(photoBase64)}
              />
              <Button title="Reprendre" variant="ghost" onPress={() => setStep('camera')} />
            </>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: '#000' }]}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
      <View style={[styles.cameraUi, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }]}>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.close, { fontFamily: fonts.bodySemi }]}>Fermer</Text>
        </Pressable>
        <View style={styles.viewfinder} />
        <View style={styles.cameraActions}>
          <Pressable onPress={pickFromLibrary}>
            <Text style={[styles.secondaryAction, { fontFamily: fonts.bodyMedium }]}>Galerie</Text>
          </Pressable>
          <Pressable onPress={takePicture} style={styles.shutter} />
          <View style={{ width: 64 }} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  title: {
    fontSize: 30,
    letterSpacing: -0.6,
  },
  sub: {
    marginTop: 6,
    fontSize: 14,
  },
  preview: {
    marginHorizontal: 20,
    height: 280,
    borderRadius: 20,
  },
  form: {
    padding: 20,
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
  },
  notes: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: 20,
    gap: 8,
  },
  analyzing: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 18,
  },
  cameraUi: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  close: {
    color: '#FFF',
    fontSize: 16,
  },
  viewfinder: {
    alignSelf: 'center',
    width: 260,
    height: 260,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  cameraActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shutter: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#FF6A3D',
    borderWidth: 4,
    borderColor: '#FFF',
  },
  secondaryAction: {
    color: '#FFF',
    width: 64,
    fontSize: 14,
  },
});
