import { Image, StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';

import { Text } from '@/components/Text';
import { themeFromColorLabel } from '@/lib/catTheme';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

type Props = {
  cat: Cat;
  selected?: boolean;
  onPress: (cat: Cat) => void;
};

/** Circular photo bubble — coat-themed ring, selected halo. */
export function CatMapMarker({ cat, selected = false, onPress }: Props) {
  const { colors, spacing, shadow } = useTheme();
  const theme = themeFromColorLabel(cat.analysis.color, cat.number);
  const size = selected ? spacing[64] : spacing[48];
  const outer = size + (selected ? spacing[8] : 0);

  return (
    <Marker
      key={`${cat.id}-${selected ? 'on' : 'off'}`}
      coordinate={{ latitude: cat.latitude, longitude: cat.longitude }}
      onPress={() => onPress(cat)}
      tracksViewChanges={false}
      accessibilityLabel={`${cat.name}, marqueur carte`}
    >
      <View
        style={[
          styles.halo,
          {
            width: outer,
            height: outer,
            borderRadius: outer / 2,
            backgroundColor: selected ? `${theme.hex}55` : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
      >
        <View
          style={[
            styles.pin,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: selected ? 3 : 2,
              borderColor: theme.hex,
              backgroundColor: colors.surfaceSecondary,
            },
            selected ? shadow.medium : shadow.small,
          ]}
        >
          {cat.photoUri ? (
            <Image source={{ uri: cat.photoUri }} style={styles.photo} />
          ) : (
            <Text variant="caption" color="accent">
              C
            </Text>
          )}
        </View>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  halo: {},
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
