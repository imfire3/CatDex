import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/Input';
import { Text } from '@/components/Text';
import { formatCatDefaultName, formatDexNumber } from '@/lib/constants';
import {
  rarityFromCat,
  rarityTokens,
  themeFromColorLabel,
  themeSoft,
} from '@/lib/catTheme';
import { useCatsStore } from '@/store/cats';
import { useTheme } from '@/theme/ThemeProvider';

export default function DiscoveryScreen() {
  const { colors, fonts, spacing, radius, motion, scheme, shadow } = useTheme();
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
    suggestedName?: string;
    mocked?: string;
  }>();

  const nextNumber = useCatsStore((state) => state.nextNumber);
  const addCat = useCatsStore((state) => state.addCat);
  const scale = useSharedValue(0.92);
  const opacity = useSharedValue(0);

  const defaultName =
    params.name?.trim() ||
    params.suggestedName?.trim() ||
    formatCatDefaultName(nextNumber);
  const [name, setName] = useState(defaultName);
  const theme = themeFromColorLabel(params.color ?? '', nextNumber);
  const rarity = rarityTokens[
    rarityFromCat(params.color ?? '', params.coat ?? '', nextNumber)
  ];
  const dexLabel = formatDexNumber(nextNumber);

  useEffect(() => {
    scale.value = withSpring(1, motion.easing.spring);
    opacity.value = withTiming(1, { duration: motion.duration.slow });
  }, [motion.duration.slow, motion.easing.spring, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
    alignItems: 'center' as const,
    width: '100%' as const,
  }));

  const confirm = () => {
    addCat({
      photoUri: params.photoUri,
      latitude: Number(params.latitude),
      longitude: Number(params.longitude),
      name,
      notes: params.notes,
      analysis: {
        color: params.color,
        breed: params.breed,
        coat: params.coat,
        description: params.description,
        suggestedName: params.suggestedName,
      },
    });
    router.replace('/(tabs)/map');
  };

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing[24],
          paddingHorizontal: spacing[24],
        },
      ]}
    >
      <View style={{ alignItems: 'center', gap: spacing[8], marginBottom: spacing[24] }}>
        <Text variant="label" color="accent" align="center">
          {params.mocked === '1' ? 'Analyse de secours' : 'Nouveau CatDex'}
        </Text>
        <Text
          variant="h1"
          align="center"
          style={{ fontFamily: fonts.display, color: colors.brand }}
        >
          {dexLabel}
        </Text>
      </View>

      <Animated.View style={animatedStyle}>
        <View
          style={[
            {
              width: '100%',
              padding: spacing[16],
              borderRadius: radius.card,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: rarity.border,
              alignItems: 'center',
              gap: spacing[16],
            },
            shadow.medium,
          ]}
        >
          <View
            style={{
              padding: spacing[8],
              borderRadius: radius.card,
              backgroundColor: themeSoft(theme, scheme),
            }}
          >
            <Image
              source={{ uri: params.photoUri }}
              style={{
                width: spacing[96] * 2,
                height: spacing[96] * 2,
                borderRadius: radius.md,
              }}
            />
          </View>

          <View style={{ width: '100%', gap: spacing[8] }}>
            <TextInput
              label="Nom"
              value={name}
              onChangeText={setName}
              placeholder="Nom du chat"
            />
          </View>

          <Badge
            label={rarity.label}
            color={rarity.foreground}
            backgroundColor={rarity.background}
          />

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: spacing[8],
            }}
          >
            <Badge label={params.breed} color={theme.badge} backgroundColor={`${theme.hex}33`} />
            <Badge label={params.color} color={theme.badge} backgroundColor={`${theme.hex}33`} />
            <Badge label={params.coat} color={theme.badge} backgroundColor={`${theme.hex}33`} />
          </View>

          <Text
            variant="body"
            color="textBody"
            align="center"
            style={{ paddingHorizontal: spacing[8] }}
          >
            {params.description}
          </Text>
        </View>
      </Animated.View>

      <View
        style={{
          marginTop: 'auto',
          paddingBottom: Math.max(insets.bottom, spacing[16]),
          gap: spacing[8],
        }}
      >
        <Button title="Ajouter au CatDex" onPress={confirm} />
        <Button
          title="Annuler"
          variant="secondary"
          onPress={() => router.replace('/(tabs)/map')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
