import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { Colors, FontSize, Spacing } from '../../constants/theme';
import type { PhotoAnalysisResult } from '@catdex/shared';

export default function CameraScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PhotoAnalysisResult | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [discovering, setDiscovering] = useState(false);

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Camera access needed to photograph cats</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function takePhoto() {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
    if (photo?.uri) {
      setPhotoUri(photo.uri);
      await runAnalysis(photo.uri);
    }
  }

  async function pickFromGallery() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      await runAnalysis(result.assets[0].uri);
    }
  }

  async function runAnalysis(uri: string) {
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const result = await api.analyzePhoto(uri);
      setAnalysis(result);
    } catch (e) {
      console.warn('Analysis failed', e);
    } finally {
      setAnalyzing(false);
    }
  }

  async function discover() {
    if (!photoUri) return;
    setDiscovering(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      let lat = 37.7749;
      let lng = -122.4194;
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        lat = loc.coords.latitude;
        lng = loc.coords.longitude;
      }

      const result = await api.discoverCat(photoUri, lat, lng);
      router.push({ pathname: '/discovery', params: { data: JSON.stringify(result) } });
      setPhotoUri(null);
      setAnalysis(null);
    } catch (e) {
      console.warn('Discovery failed', e);
    } finally {
      setDiscovering(false);
    }
  }

  function reset() {
    setPhotoUri(null);
    setAnalysis(null);
  }

  if (photoUri) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: photoUri }} style={styles.preview} />
        <View style={styles.analysisPanel}>
          {analyzing && <ActivityIndicator color={Colors.primary} size="large" />}
          {analysis && (
            <View style={styles.analysisResults}>
              <Text style={styles.analysisTitle}>AI Analysis</Text>
              <View style={styles.analysisGrid}>
                <AnalysisItem label="Color" value={analysis.color} />
                <AnalysisItem label="Breed" value={analysis.breed.replace(/_/g, ' ')} />
                <AnalysisItem label="Age" value={analysis.estimatedAge} />
                <AnalysisItem label="Fur" value={analysis.furLength} />
                <AnalysisItem label="Confidence" value={`${Math.round(analysis.confidence * 100)}%`} />
                <AnalysisItem label="3D Model" value={analysis.modelId.replace(/_/g, ' ')} />
              </View>
            </View>
          )}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={reset}>
              <Text style={styles.secondaryBtnText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, (!analysis || discovering) && styles.btnDisabled]}
              onPress={discover}
              disabled={!analysis || discovering}
            >
              {discovering ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Discover Cat 🐾</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <View style={styles.overlay}>
          <Text style={styles.hint}>Point at a cat to capture</Text>
          <View style={styles.controls}>
            <TouchableOpacity style={styles.galleryBtn} onPress={pickFromGallery}>
              <Ionicons name="images" size={28} color={Colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.captureBtn} onPress={takePhoto}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
            <View style={{ width: 56 }} />
          </View>
        </View>
      </CameraView>
    </View>
  );
}

function AnalysisItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.analysisItem}>
      <Text style={styles.analysisLabel}>{label}</Text>
      <Text style={styles.analysisValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.lg },
  message: { color: Colors.textSecondary, fontSize: FontSize.lg, textAlign: 'center', marginBottom: Spacing.lg },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'space-between', padding: Spacing.lg, paddingBottom: 40 },
  hint: { color: Colors.text, fontSize: FontSize.lg, textAlign: 'center', marginTop: 60, fontWeight: '600' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xl },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: Colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary },
  galleryBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surface + 'aa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: { flex: 1, resizeMode: 'cover' },
  analysisPanel: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    minHeight: 280,
  },
  analysisTitle: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '800', marginBottom: Spacing.md },
  analysisGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  analysisItem: {
    width: '47%',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 10,
    padding: Spacing.sm,
  },
  analysisLabel: { color: Colors.textSecondary, fontSize: FontSize.sm },
  analysisValue: { color: Colors.text, fontSize: FontSize.md, fontWeight: '600', textTransform: 'capitalize' },
  analysisResults: { marginBottom: Spacing.md },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  btn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: Colors.text, fontWeight: '700', fontSize: FontSize.lg },
  secondaryBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
  },
  secondaryBtnText: { color: Colors.textSecondary, fontWeight: '600', fontSize: FontSize.lg },
});
