import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { formatCatDefaultName } from '@/lib/constants';
import { useCatsStore } from '@/store/cats';
import { useTheme } from '@/theme/ThemeProvider';

export default function DiscoveryScreen() {
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    photoUri: string;
    name?: string;
    notes?: string;
    latitude: string;
    longitude: string;
    color: string;
    breed: string;
    coat: string;
    description: string;
  }>();

  const nextNumber = useCatsStore((state) => state.nextNumber);
  const addCat = useCatsStore((state) => state.addCat);
  const scale = useSharedValue(0.86);
  const opacity = useSharedValue(0);

  const displayName = params.name?.trim() || formatCatDefaultName(nextNumber);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 14, stiffness: 160 });
    opacity.value = withTiming(1, { duration: 420 });
  }, [opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
    alignItems: 'center' as const,
  }));

  const confirm = () => {
    const cat = addCat({
      photoUri: params.photoUri,
      latitude: Number(params.latitude),
      longitude: Number(params.longitude),
      name: params.name,
      notes: params.notes,
      analysis: {
        color: params.color,
        breed: params.breed,
        coat: params.coat,
        description: params.description,
      },
    });

    router.replace(`/cat/${cat.id}`);
  };

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing[16],
          paddingHorizontal: spacing[24],
        },
      ]}
    >
      <Text variant="label" color="accent" align="center" style={{ marginBottom: spacing[24] }}>
        Nouveau chat découvert
      </Text>

      <Animated.View style={animatedStyle}>
        <Image
          source={{ uri: params.photoUri }}
          style={[styles.photo, { borderRadius: radius['2xl'] }]}
        />
        <Text variant="h1" style={{ marginTop: spacing[24] }}>
          {displayName}
        </Text>
        <Text variant="bodySmall" color="textSecondary" style={{ marginTop: spacing[8] }}>
          {params.breed} · {params.color} · {params.coat}
        </Text>
        <Text
          variant="body"
          color="textSecondary"
          align="center"
          style={{ marginTop: spacing[16], paddingHorizontal: spacing[8] }}
        >
          {params.description}
        </Text>
      </Animated.View>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, spacing[16]), gap: spacing[8] },
        ]}
      >
        <Button title="Ajouter au CatDex" onPress={confirm} />
        <Button title="Retour à la carte" variant="ghost" onPress={() => router.replace('/(tabs)/map')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  photo: {
    width: 192,
    height: 192,
  },
  footer: {
    marginTop: 'auto',
  },
});
