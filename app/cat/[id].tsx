import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { Badge } from '@/components/Badge';
import { StatCard } from '@/components/Card/StatCard';
import { MiniMap } from '@/components/maps/CatMap';
import { Text } from '@/components/Text';
import { formatCaptureTime } from '@/lib/constants';
import { themeFromColorLabel } from '@/lib/catTheme';
import { useCatsStore } from '@/store/cats';
import { useTheme } from '@/theme/ThemeProvider';

export default function CatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, fonts, spacing, radius, shadow } = useTheme();
  const insets = useSafeAreaInsets();
  const cat = useCatsStore((state) => state.cats.find((item) => item.id === id));
  const incrementViews = useCatsStore((state) => state.incrementViews);

  useEffect(() => {
    if (id) incrementViews(id);
  }, [id, incrementViews]);

  if (!cat) {
    return (
      <View style={[styles.missing, { backgroundColor: colors.background }]}>
        <Text variant="body" color="textSecondary">
          Chat introuvable
        </Text>
      </View>
    );
  }

  const theme = themeFromColorLabel(cat.analysis.color, cat.number);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ paddingBottom: spacing[48] }}>
        <View style={{ height: 380, backgroundColor: colors.surfaceSecondary }}>
          <Image source={{ uri: cat.photoUri }} style={StyleSheet.absoluteFill} />
          <LinearGradient
            colors={['transparent', colors.background]}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 140 }}
          />
          <View
            style={{
              position: 'absolute',
              top: insets.top + spacing[8],
              left: spacing[16],
              right: spacing[16],
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Retour"
              onPress={() => router.back()}
              style={({ pressed }) => [
                {
                  width: spacing[48],
                  height: spacing[48],
                  borderRadius: radius.full,
                  backgroundColor: colors.glassFill,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.85 : 1,
                },
                shadow.small,
              ]}
            >
              <Text variant="h3">‹</Text>
            </Pressable>
          </View>
        </View>

        <View
          style={{
            marginTop: -spacing[32],
            paddingHorizontal: spacing[24],
            gap: spacing[24],
          }}
        >
          <View
            style={[
              {
                backgroundColor: colors.surface,
                borderRadius: radius.xl,
                borderWidth: 1,
                borderColor: colors.border,
                padding: spacing[24],
                gap: spacing[16],
                overflow: 'hidden',
              },
              shadow.medium,
            ]}
          >
            <LinearGradient
              colors={[`${theme.hex}33`, 'transparent']}
              style={StyleSheet.absoluteFill}
            />
            <Text variant="h1">{cat.name}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[8] }}>
              <Badge label={cat.analysis.breed} color={theme.badge} backgroundColor={`${theme.hex}33`} />
              <Badge label={cat.analysis.color} color={theme.badge} backgroundColor={`${theme.hex}33`} />
              <Badge label={cat.analysis.coat} color={theme.badge} backgroundColor={`${theme.hex}33`} />
            </View>
            <Text variant="body" color="textBody">
              {cat.analysis.description}
            </Text>
            <Text variant="caption" color="textSecondary" style={{ fontFamily: fonts.bodySemi }}>
              Capturé le {formatCaptureTime(cat.discoveredAt)} · {cat.views} vues
            </Text>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[16] }}>
            <StatCard label="Race" value={cat.analysis.breed} />
            <StatCard label="Couleur" value={cat.analysis.color} />
            <StatCard label="Robe" value={cat.analysis.coat} />
            <StatCard label="Vues" value={String(cat.views)} />
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
              Position GPS
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
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
