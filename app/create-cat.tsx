import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { useCreateCat } from '@/hooks';
import { useLocationStore } from '@/stores/location.store';
import { getApproximateLocation, reverseGeocode } from '@/utils/location';
import { colors, spacing, typography } from '@/theme';
import { Button, Input, Card } from '@/components';

const RARITIES = ['common', 'uncommon', 'rare', 'legendary'] as const;
const COLORS = ['Orange', 'Black', 'White', 'Gray', 'Calico', 'Tabby', 'Tortoiseshell'];

export default function CreateCatScreen() {
  const router = useRouter();
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();
  const { coords } = useLocationStore();
  const createCat = useCreateCat();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('');
  const [breed, setBreed] = useState('');
  const [rarity, setRarity] = useState<typeof RARITIES[number]>('common');
  const [locationName, setLocationName] = useState('');
  const [lat, setLat] = useState(coords?.latitude ?? 0);
  const [lng, setLng] = useState(coords?.longitude ?? 0);

  useEffect(() => {
    (async () => {
      try {
        const location = await getApproximateLocation();
        setLat(location.latitude);
        setLng(location.longitude);
        const place = await reverseGeocode(location.latitude, location.longitude);
        if (place) setLocationName(place);
      } catch {
        if (coords) {
          setLat(coords.latitude);
          setLng(coords.longitude);
        }
      }
    })();
  }, []);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name for the cat');
      return;
    }
    if (!photoUri) {
      Alert.alert('Error', 'No photo provided');
      return;
    }

    try {
      const result = await createCat.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        color: color || undefined,
        breed: breed || undefined,
        rarity,
        location_name: locationName || undefined,
        lat,
        lng,
        photoUri,
      });

      if (result === null) {
        Alert.alert('Queued', 'Cat will be created when you\'re back online', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Success!', `${name} has been added to ChatDex!`, [
          { text: 'View', onPress: () => router.replace(`/cat/${result.id}`) },
        ]);
      }
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to create cat');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {photoUri && (
        <Image source={{ uri: photoUri }} style={styles.photo} contentFit="cover" />
      )}

      <Card style={styles.form}>
        <Input label="Cat Name *" placeholder="Whiskers" value={name} onChangeText={setName} />
        <Input
          label="Description"
          placeholder="A friendly neighborhood cat..."
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <Input label="Breed" placeholder="Domestic Shorthair" value={breed} onChangeText={setBreed} />
        <Input label="Location" placeholder="Near the park" value={locationName} onChangeText={setLocationName} />

        <Text style={styles.label}>Color</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {COLORS.map((c) => (
            <Text
              key={c}
              style={[styles.chip, color === c && styles.chipActive]}
              onPress={() => setColor(color === c ? '' : c)}
            >
              {c}
            </Text>
          ))}
        </ScrollView>

        <Text style={styles.label}>Rarity</Text>
        <View style={styles.chipRow}>
          {RARITIES.map((r) => (
            <Text
              key={r}
              style={[styles.chip, rarity === r && styles.chipActive]}
              onPress={() => setRarity(r)}
            >
              {r}
            </Text>
          ))}
        </View>

        <Text style={styles.locationNote}>
          📍 Approximate location: {lat.toFixed(3)}, {lng.toFixed(3)}
        </Text>
      </Card>

      <Button
        title={createCat.isPending ? 'Creating...' : 'Create Cat'}
        onPress={handleSubmit}
        loading={createCat.isPending}
        style={styles.submitBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 40 },
  photo: { width: '100%', height: 200, borderRadius: 12, marginBottom: spacing.lg },
  form: { gap: spacing.md, marginBottom: spacing.lg },
  label: { color: colors.textSecondary, fontSize: 14, fontWeight: '500' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    color: colors.textSecondary,
    fontSize: 13,
    overflow: 'hidden',
  },
  chipActive: { backgroundColor: colors.primary + '30', color: colors.primary },
  locationNote: { color: colors.textMuted, fontSize: 12 },
  submitBtn: { marginTop: spacing.sm },
});
