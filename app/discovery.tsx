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
import { formatCatDefaultName } from '@/lib/constants';
import { themeFromColorLabel, themeSoft } from '@/lib/catTheme';
import { useCatsStore } from '@/store/cats';
import { useTheme } from '@/theme/ThemeProvider';

export default function DiscoveryScreen() {
  const { colors, fonts, spacing, radius, motion, shadow } = useTheme();
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
      <Text variant="label" color="accent" align="center" style={{ marginBottom: spacing[16] }}>
        {params.mocked === '1' ? 'Analyse de secours' : 'Nouveau dans ton CatDex'}
      </Text>

      <Animated.View style={animatedStyle}>
        <View
          style={[
            {
              padding: spacing[8],
              borderRadius: radius['2xl'],
              backgroundColor: themeSoft(theme),
            },
            shadow.medium,
          ]}
        >
          <Image
            source={{ uri: params.photoUri }}
            style={{
              width: spacing[96] * 2,
              height: spacing[96] * 2,
              borderRadius: radius.xl,
            }}
          />
        </View>

        <View style={{ width: '100%', marginTop: spacing[24], gap: spacing[8] }}>
          <TextInput
            label="Nom"
            value={name}
            onChangeText={setName}
            placeholder="Nom du chat"
          />
        </View>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: spacing[8],
            marginTop: spacing[16],
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
          style={{ marginTop: spacing[16], paddingHorizontal: spacing[8], fontFamily: fonts.body }}
        >
          {params.description}
        </Text>
      </Animated.View>

      <View
        style={{
          marginTop: 'auto',
          paddingBottom: Math.max(insets.bottom, spacing[16]),
          gap: spacing[8],
        }}
      >
        <Button title="Ajouter à la carte" onPress={confirm} />
        <Button
          title="Annuler"
          variant="ghost"
          onPress={() => router.replace('/(tabs)/map')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
