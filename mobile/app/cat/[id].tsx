import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, Share, Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Cat3DAvatar } from '../../components/Cat3DAvatar';
import { api, CatProfileResponse } from '../../services/api';
import { Colors, FontSize, Spacing } from '../../constants/theme';

export default function CatProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [cat, setCat] = useState<CatProfileResponse | null>(null);
  const [comment, setComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (id) api.getCat(id).then((data) => {
      setCat(data);
      setIsLiked(data.isLiked);
    }).catch(console.warn);
  }, [id]);

  if (!cat) {
    return <View style={styles.container}><Text style={styles.loading}>Loading...</Text></View>;
  }

  async function handleLike() {
    if (!cat) return;
    const result = await api.likeCat(cat.id);
    setIsLiked(result.liked);
    setCat({ ...cat, likes: result.likes });
  }

  async function handleFavorite() {
    if (!cat) return;
    const result = await api.favoriteCat(cat.id);
    setCat({ ...cat, isFavorite: result.favorited });
  }

  async function handleComment() {
    if (!cat || !comment.trim()) return;
    await api.commentCat(cat.id, comment.trim());
    const updated = await api.getCat(cat.id);
    setCat(updated);
    setComment('');
  }

  async function handleShare() {
    if (!cat) return;
    await Share.share({
      message: `Check out ${cat.name} on CatDex! A ${cat.color} ${cat.breed.replace(/_/g, ' ')} cat in ${cat.district}.`,
    });
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <Image source={{ uri: cat.photoUrl }} style={styles.photo} />
        <View style={styles.avatarOverlay}>
          <Cat3DAvatar
            modelId={cat.modelId}
            size={100}
            goldenAura={cat.isPopular}
          />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{cat.name}</Text>
          {cat.isPopular && <Text style={styles.popular}>⭐ Popular</Text>}
        </View>
        <Text style={styles.details}>
          {cat.breed.replace(/_/g, ' ')} · {cat.color} · {cat.furLength} hair · {cat.estimatedAge}
        </Text>
        <Text style={styles.confidence}>AI Confidence: {Math.round(cat.confidence * 100)}%</Text>
        <Text style={styles.district}>📍 {cat.district}</Text>

        <View style={styles.statsRow}>
          <Stat icon="eye" label="Observations" value={cat.observationCount} />
          <Stat icon="heart" label="Likes" value={cat.likes} />
          <Stat icon="calendar" label="Last Seen" value={new Date(cat.lastObservedAt).toLocaleDateString()} />
        </View>

        <View style={styles.actions}>
          <ActionBtn icon={isLiked ? 'heart' : 'heart-outline'} label="Like" onPress={handleLike} active={isLiked} />
          <ActionBtn icon={cat.isFavorite ? 'star' : 'star-outline'} label="Favorite" onPress={handleFavorite} active={cat.isFavorite} />
          <ActionBtn icon="share-outline" label="Share" onPress={handleShare} />
        </View>

        <Text style={styles.sectionTitle}>Observation History</Text>
        {(cat.observations ?? []).map((obs) => (
          <View key={obs.id} style={styles.observation}>
            <Text style={styles.obsUser}>{obs.username}</Text>
            <Text style={styles.obsDate}>{new Date(obs.observed_at).toLocaleString()}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Gallery</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Image source={{ uri: cat.photoUrl }} style={styles.galleryImg} />
          {(cat.observations ?? []).map((obs) => (
            <Image key={obs.id} source={{ uri: obs.photo_url }} style={styles.galleryImg} />
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Comments</Text>
        {(cat.comments ?? []).map((c) => (
          <View key={c.id} style={styles.comment}>
            <Text style={styles.commentUser}>{c.username}</Text>
            <Text style={styles.commentText}>{c.text}</Text>
          </View>
        ))}
        <View style={styles.commentInput}>
          <TextInput
            style={styles.input}
            value={comment}
            onChangeText={setComment}
            placeholder="Add a comment..."
            placeholderTextColor={Colors.textSecondary}
          />
          <TouchableOpacity onPress={handleComment}>
            <Ionicons name="send" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon as any} size={20} color={Colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionBtn({ icon, label, onPress, active }: { icon: string; label: string; onPress: () => void; active?: boolean }) {
  return (
    <TouchableOpacity style={[styles.actionBtn, active && styles.actionActive]} onPress={onPress}>
      <Ionicons name={icon as any} size={22} color={active ? Colors.primary : Colors.textSecondary} />
      <Text style={[styles.actionLabel, active && { color: Colors.primary }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loading: { color: Colors.textSecondary, textAlign: 'center', marginTop: 100 },
  hero: { height: 240, position: 'relative' },
  photo: { width: '100%', height: '100%', resizeMode: 'cover' },
  avatarOverlay: { position: 'absolute', bottom: -30, right: 20 },
  content: { padding: Spacing.md, paddingTop: 40 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  name: { color: Colors.text, fontSize: FontSize.hero, fontWeight: '800' },
  popular: { color: Colors.gold, fontWeight: '700' },
  details: { color: Colors.textSecondary, fontSize: FontSize.md, marginTop: 4, textTransform: 'capitalize' },
  confidence: { color: Colors.accent, fontSize: FontSize.sm, marginTop: 4 },
  district: { color: Colors.text, fontSize: FontSize.md, marginTop: Spacing.sm },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: Spacing.lg, backgroundColor: Colors.surface, borderRadius: 12, padding: Spacing.md },
  stat: { alignItems: 'center' },
  statValue: { color: Colors.text, fontWeight: '700', fontSize: FontSize.lg, marginTop: 4 },
  statLabel: { color: Colors.textSecondary, fontSize: FontSize.sm },
  actions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: Spacing.lg },
  actionBtn: { alignItems: 'center', padding: Spacing.sm },
  actionActive: {},
  actionLabel: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 4 },
  sectionTitle: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '800', marginTop: Spacing.lg, marginBottom: Spacing.sm },
  observation: { backgroundColor: Colors.surface, borderRadius: 8, padding: Spacing.sm, marginBottom: 4 },
  obsUser: { color: Colors.primary, fontWeight: '600' },
  obsDate: { color: Colors.textSecondary, fontSize: FontSize.sm },
  galleryImg: { width: 100, height: 100, borderRadius: 8, marginRight: Spacing.sm },
  comment: { backgroundColor: Colors.surface, borderRadius: 8, padding: Spacing.sm, marginBottom: 4 },
  commentUser: { color: Colors.primary, fontWeight: '600', fontSize: FontSize.sm },
  commentText: { color: Colors.text, marginTop: 2 },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  input: { flex: 1, color: Colors.text, fontSize: FontSize.md },
});
