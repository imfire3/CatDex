import { Image, StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';

import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

type Props = {
  cat: Cat;
  onPress: (cat: Cat) => void;
};

/** Circular photo avatar pin — Apple Maps / Mapbox sober style. */
export function CatMapMarker({ cat, onPress }: Props) {
  const { colors, spacing } = useTheme();
  const size = spacing[48];

  return (
    <Marker
      coordinate={{ latitude: cat.latitude, longitude: cat.longitude }}
      onPress={() => onPress(cat)}
      tracksViewChanges={false}
    >
      <View
        style={[
          styles.pin,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 3,
            borderColor: colors.accent,
            backgroundColor: colors.surfaceSecondary,
          },
        ]}
      >
        <Image source={{ uri: cat.photoUri }} style={styles.photo} />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  pin: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
});
