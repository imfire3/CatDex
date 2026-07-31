import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { StatCard } from '@/components/Card/StatCard';
import { EmptyState } from '@/components/EmptyState';
import { GlassIconButton } from '@/components/GlassIconButton';
import { TextInput } from '@/components/Input';
import { PageLoading } from '@/components/Loader';
import { Modal } from '@/components/Modal';
import { Text } from '@/components/Text';
import { MiniMap } from '@/components/maps/CatMap';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { formatCaptureTime, formatDexNumber } from '@/lib/constants';
import { themeFromColorLabel, themeSoft } from '@/lib/catTheme';
import { useCatsStore } from '@/store/cats';
import { useToastStore } from '@/store/toast';
import { useTheme } from '@/theme/ThemeProvider';

export default function CatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, radius, shadow, motion, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();

  const cat = useCatsStore((state) => state.cats.find((item) => item.id === id));
  const hydrated = useCatsStore((state) => state.hydrated);
  const incrementViews = useCatsStore((state) => state.incrementViews);
  const updateCat = useCatsStore((state) => state.updateCat);
  const removeCat = useCatsStore((state) => state.removeCat);
  const showToast = useToastStore((state) => state.show);

  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const cardScale = useSharedValue(reduceMotion ? 1 : 0.92);
  const cardOpacity = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (id) incrementViews(id);
  }, [id, incrementViews]);

  useEffect(() => {
    if (!cat || reduceMotion) {
      cardScale.value = 1;
      cardOpacity.value = 1;
      return;
    }
    cardScale.value = withSpring(1, motion.easing.spring);
    cardOpacity.value = withTiming(1, { duration: motion.duration.slow });
  }, [cat, cardOpacity, cardScale, motion.duration.slow, motion.easing.spring, reduceMotion]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  if (!hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Stack.Screen options={{ headerShown: false }} />
        <PageLoading label="Chargement de la fiche…" />
      </View>
    );
  }

  if (!cat) {
    return (
      <View
        style={[
          styles.missing,
          {
            backgroundColor: colors.background,
            paddingHorizontal: spacing[24],
            paddingTop: insets.top + spacing[24],
          },
        ]}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <EmptyState
          title="Chat introuvable"
          description="Cette fiche n’existe plus dans ton CatDex."
          actionLabel="Retour au CatDex"
          onAction={() => router.replace('/(tabs)/catdex')}
        />
      </View>
    );
  }

  const theme = themeFromColorLabel(cat.analysis.color, cat.number);
  const dexLabel = formatDexNumber(cat.number);
  const heroHeight = spacing[96] * 3 + spacing[64];
  const fadeHeight = spacing[96] + spacing[48];

  const handleOpenEdit = () => {
    setEditName(cat.name);
    setEditNotes(cat.notes ?? '');
    setEditVisible(true);
  };

  const handleCloseEdit = () => {
    if (saving) return;
    setEditVisible(false);
  };

  const handleSaveEdit = () => {
    if (saving) return;
    setSaving(true);
    updateCat(cat.id, {
      name: editName.trim() || cat.name,
      notes: editNotes.trim() || undefined,
    });
    setSaving(false);
    setEditVisible(false);
    showToast({
      title: 'Fiche mise à jour',
      description: 'Tes modifications sont enregistrées.',
      tone: 'success',
    });
  };

  const handleViewOnMap = () => {
    router.push('/(tabs)/map');
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer ce chat ?',
      `${cat.name} sera retiré de ton CatDex. Cette action est définitive.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            removeCat(cat.id);
            showToast({
              title: 'Chat supprimé',
              description: `${cat.name} a quitté ton CatDex.`,
              tone: 'warning',
            });
            router.replace('/(tabs)/catdex');
          },
        },
      ],
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing[48] + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: heroHeight, backgroundColor: themeSoft(theme, scheme) }}>
          <Image
            source={{ uri: cat.photoUri }}
            style={StyleSheet.absoluteFill}
            blurRadius={28}
            accessibilityIgnoresInvertColors
          />
          <LinearGradient
            colors={[`${theme.hex}55`, 'transparent', colors.background]}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={['transparent', colors.background]}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: fadeHeight,
            }}
          />

          <View
            style={{
              position: 'absolute',
              top: insets.top + spacing[8],
              left: spacing[16],
              right: spacing[16],
              flexDirection: 'row',
              justifyContent: 'space-between',
              zIndex: 2,
            }}
          >
            <GlassIconButton
              accessibilityLabel="Retour"
              onPress={() => router.back()}
            >
              <Text variant="h3">‹</Text>
            </GlassIconButton>
            <GlassIconButton
              accessibilityLabel="Modifier"
              label="Modifier"
              onPress={handleOpenEdit}
            />
          </View>

          <View
            style={{
              flex: 1,
              justifyContent: 'flex-end',
              paddingHorizontal: spacing[24],
              paddingBottom: spacing[16],
            }}
          >
            <Animated.View
              style={[
                cardAnimatedStyle,
                {
                  borderRadius: radius['2xl'],
                  overflow: 'hidden',
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                },
                shadow.large,
              ]}
            >
              <View style={{ aspectRatio: 1, backgroundColor: themeSoft(theme, scheme) }}>
                <Image
                  source={{ uri: cat.photoUri }}
                  style={StyleSheet.absoluteFill}
                  accessibilityLabel={`Photo de ${cat.name}`}
                />
                <LinearGradient
                  colors={['transparent', colors.overlay]}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: spacing[96],
                  }}
                />
                <View
                  style={{
                    position: 'absolute',
                    left: spacing[16],
                    right: spacing[16],
                    bottom: spacing[16],
                    gap: spacing[4],
                  }}
                >
                  <Text variant="label" color="accent">
                    CatDex {dexLabel}
                  </Text>
                  <Text variant="h2" numberOfLines={1}>
                    {cat.name}
                  </Text>
                </View>
              </View>
            </Animated.View>
          </View>
        </View>

        <View
          style={{
            paddingHorizontal: spacing[24],
            gap: spacing[24],
            marginTop: spacing[8],
          }}
        >
          <View style={{ gap: spacing[8] }}>
            <Text variant="label" color="textSecondary">
              Première rencontre
            </Text>
            <Text variant="body" color="textBody">
              {formatCaptureTime(cat.discoveredAt)}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[8] }}>
            <Badge
              label={cat.analysis.breed}
              color={theme.badge}
              backgroundColor={`${theme.hex}33`}
            />
            <Badge
              label={cat.analysis.color}
              color={theme.badge}
              backgroundColor={`${theme.hex}33`}
            />
            <Badge
              label={cat.analysis.coat}
              color={theme.badge}
              backgroundColor={`${theme.hex}33`}
            />
          </View>

          <View style={{ gap: spacing[8] }}>
            <Text variant="label" color="textSecondary">
              Portrait
            </Text>
            <Text variant="body" color="textBody">
              {cat.analysis.description}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[16] }}>
            <StatCard label="Race" value={cat.analysis.breed} />
            <StatCard label="Couleur" value={cat.analysis.color} />
            <StatCard label="Robe" value={cat.analysis.coat} />
            <StatCard
              label="Observations"
              value={String(cat.views)}
              hint="Consultations de la fiche"
            />
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[16] }}>
            <StatCard label="Photos" value="1" hint="Capture d’origine" />
            <StatCard
              label="N° CatDex"
              value={dexLabel}
              hint="Index de collection"
            />
          </View>

          {cat.notes ? (
            <View
              style={[
                {
                  backgroundColor: colors.surface,
                  borderRadius: radius.xl,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: spacing[24],
                  gap: spacing[8],
                },
                shadow.small,
              ]}
            >
              <Text variant="label" color="textSecondary">
                Notes
              </Text>
              <Text variant="bodySmall" color="textBody">
                {cat.notes}
              </Text>
            </View>
          ) : null}

          <View style={{ gap: spacing[8] }}>
            <Text variant="label" color="textSecondary">
              Lieu approximatif
            </Text>
            <View
              style={[
                {
                  borderRadius: radius.xl,
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: colors.border,
                },
                shadow.small,
              ]}
            >
              <MiniMap latitude={cat.latitude} longitude={cat.longitude} />
            </View>
          </View>

          <View style={{ gap: spacing[8] }}>
            <Button title="Voir sur la carte" variant="secondary" onPress={handleViewOnMap} />
            <Button title="Supprimer" variant="ghost" onPress={handleDelete} />
          </View>
        </View>
      </ScrollView>

      <Modal visible={editVisible} title="Modifier la fiche" onClose={handleCloseEdit}>
        <View style={{ gap: spacing[16] }}>
          <TextInput
            label="Nom"
            value={editName}
            onChangeText={setEditName}
            placeholder="Nom du chat"
          />
          <TextInput
            label="Notes"
            value={editNotes}
            onChangeText={setEditNotes}
            placeholder="Souvenirs, lieux, anecdotes…"
            multiline
            style={{ minHeight: spacing[96], textAlignVertical: 'top' }}
          />
          <Button title="Enregistrer" loading={saving} onPress={handleSaveEdit} />
          <Button title="Annuler" variant="ghost" disabled={saving} onPress={handleCloseEdit} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  missing: {
    flex: 1,
    justifyContent: 'center',
  },
});
