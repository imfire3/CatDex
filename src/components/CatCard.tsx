import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

type Props = {
  cat: Cat;
  onPress: () => void;
};

export function CatCard({ cat, onPress }: Props) {
  const { colors, fonts, radii } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <Image source={{ uri: cat.photoUri }} style={styles.photo} />
      <View style={styles.overlay}>
        <Text style={[styles.name, { fontFamily: fonts.bodySemi }]} numberOfLines={1}>
          {cat.name}
        </Text>
        <Text style={[styles.meta, { fontFamily: fonts.body }]} numberOfLines={1}>
          {cat.analysis.breed}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    aspectRatio: 3 / 4,
    overflow: 'hidden',
  },
  photo: {
    ...StyleSheet.absoluteFill,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    backgroundColor: 'rgba(14,15,18,0.55)',
  },
  name: {
    color: '#FFF',
    fontSize: 15,
  },
  meta: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 12,
    marginTop: 2,
  },
});
