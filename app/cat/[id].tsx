import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useCat, useToggleFavorite } from '@/hooks';
import { colors, spacing, typography, borderRadius } from '@/theme';
import { BadgeChip, LoadingSpinner } from '@/components';
import { RARITY_COLORS, formatDistance } from '@/lib/constants';
import { useLocationStore } from '@/stores/location.store';

export default function CatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: cat, isLoading } = useCat(id);
  const toggleFavorite = useToggleFavorite();
  const { coords } = useLocationStore();

  if (isLoading || !cat) return <LoadingSpinner message="Loading cat..." />;

  const distance = coords
    ? formatDistance(
        Math.sqrt(
          ((cat.approximate_lat - coords.latitude) * 111) ** 2 +
          ((cat.approximate_lng - coords.longitude) * 111 * Math.cos((coords.latitude * Math.PI) / 180)) ** 2
        )
      )
    : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {cat.primary_photo_url ? (
        <Image source={{ uri: cat.primary_photo_url }} style={styles.heroImage} contentFit="cover" />
      ) : (
        <View style={styles.heroPlaceholder}>
          <Text style={styles.heroEmoji}>🐱</Text>
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{cat.name}</Text>
          <TouchableOpacity onPress={() => toggleFavorite.mutate(cat.id)}>
            <Ionicons
              name={cat.is_favorite ? 'heart' : 'heart-outline'}
              size={28}
              color={cat.is_favorite ? colors.primary : colors.text}
            />
          </TouchableOpacity>
        </View>
        <BadgeChip label={cat.rarity} color={RARITY_COLORS[cat.rarity]} />
      </View>

      {cat.description && <Text style={styles.description}>{cat.description}</Text>}

      <View style={styles.detailsGrid}>
        {cat.breed && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Breed</Text>
            <Text style={styles.detailValue}>{cat.breed}</Text>
          </View>
        )}
        {cat.color && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Color</Text>
            <Text style={styles.detailValue}>{cat.color}</Text>
          </View>
        )}
        {cat.location_name && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>{cat.location_name}</Text>
          </View>
        )}
        {distance && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Distance</Text>
            <Text style={styles.detailValue}>~{distance}</Text>
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>Gallery</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {(cat.photos ?? []).map((photo) => (
          <Image
            key={photo.id}
            source={{ uri: photo.public_url ?? '' }}
            style={styles.galleryImage}
            contentFit="cover"
          />
        ))}
        {(cat.photos ?? []).length === 0 && (
          <Text style={styles.noPhotos}>No additional photos</Text>
        )}
      </ScrollView>

      <Text style={styles.approxNote}>
        📍 Location shown is approximate for privacy
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40 },
  heroImage: { width: '100%', height: 300 },
  heroPlaceholder: {
    width: '100%',
    height: 300,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: { fontSize: 80 },
  header: { padding: spacing.lg, gap: spacing.sm },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { ...typography.h1, color: colors.text, flex: 1 },
  description: { color: colors.textSecondary, fontSize: 16, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  detailItem: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    minWidth: '45%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailLabel: { color: colors.textMuted, fontSize: 12, marginBottom: 2 },
  detailValue: { color: colors.text, fontSize: 16, fontWeight: '600' },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  galleryImage: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.md,
    marginLeft: spacing.lg,
  },
  noPhotos: { color: colors.textMuted, paddingHorizontal: spacing.lg, fontSize: 14 },
  approxNote: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
});
