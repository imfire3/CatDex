import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCameraStore } from '@/stores';
import { colors, spacing, typography, borderRadius } from '@/theme';
import { Button } from '@/components';

export default function CameraScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const { capturedUri, setCapturedUri, reset } = useCameraStore();

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionEmoji}>📷</Text>
        <Text style={styles.permissionTitle}>Camera Access</Text>
        <Text style={styles.permissionText}>CatDex needs camera access to photograph cats</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
    if (photo?.uri) {
      setCapturedUri(photo.uri);
    }
  };

  const handleRetry = () => {
    reset();
  };

  const handleContinue = () => {
    if (capturedUri) {
      router.push({ pathname: '/create-cat', params: { photoUri: capturedUri } });
    }
  };

  if (capturedUri) {
    return (
      <View style={styles.container}>
        <View style={styles.previewHeader}>
          <Text style={styles.previewTitle}>Preview</Text>
        </View>
        <Image source={{ uri: capturedUri }} style={styles.preview} contentFit="contain" />
        <View style={styles.previewActions}>
          <Button title="Retake" onPress={handleRetry} variant="outline" style={styles.previewBtn} />
          <Button title="Continue" onPress={handleContinue} style={styles.previewBtn} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        <View style={styles.overlay}>
          <View style={styles.topBar}>
            <Text style={styles.captureTitle}>Capture a Cat</Text>
            <TouchableOpacity
              style={styles.flipBtn}
              onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
            >
              <Ionicons name="camera-reverse" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.frameContainer}>
            <View style={styles.frame} />
            <Text style={styles.frameHint}>Position the cat in the frame</Text>
          </View>

          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.captureBtn} onPress={takePicture}>
              <View style={styles.captureBtnInner} />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  permissionEmoji: { fontSize: 64 },
  permissionTitle: { ...typography.h2, color: colors.text },
  permissionText: { color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.md },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'space-between' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: spacing.lg,
  },
  captureTitle: { ...typography.h3, color: colors.text },
  flipBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background + '80',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameContainer: { alignItems: 'center', gap: spacing.md },
  frame: {
    width: 280,
    height: 280,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  frameHint: { color: colors.text, fontSize: 14, opacity: 0.8 },
  bottomBar: { alignItems: 'center', paddingBottom: 100 },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.text + '30',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.text,
  },
  captureBtnInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.text,
  },
  previewHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  previewTitle: { ...typography.h2, color: colors.text },
  preview: { flex: 1, margin: spacing.md, borderRadius: borderRadius.lg },
  previewActions: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: 100,
  },
  previewBtn: { flex: 1 },
});
