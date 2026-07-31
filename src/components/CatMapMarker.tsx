import { View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';

import { CatSprite } from '@/components/CatSprite';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

type Props = {
  cat: Cat;
  onPress: (cat: Cat) => void;
};

/** Circular cat-face sprite pin — matches Explorer mock markers. */
export function CatMapMarker({ cat, onPress }: Props) {
  const { colors, spacing, shadow } = useTheme();
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
            borderColor: colors.surface,
            backgroundColor: colors.accentSoft,
          },
          shadow.low,
        ]}
      >
        <CatSprite
          colorLabel={cat.analysis.color}
          seed={cat.number}
          size={size - 6}
          faceOnly
        />
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
});
