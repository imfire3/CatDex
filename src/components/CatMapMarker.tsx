import { Image, StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

type Props = {
  cat: Cat;
  onPress: (cat: Cat) => void;
};

export function CatMapMarker({ cat, onPress }: Props) {
  const { colors } = useTheme();

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
            borderColor: colors.mapPinRing,
            backgroundColor: colors.surface2,
          },
        ]}
      >
        {cat.photoUri ? (
          <Image source={{ uri: cat.photoUri }} style={styles.photo} />
        ) : (
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M4 14c1.5-2 3.2-3 5-3 .9 0 1.7.3 2.5.8.8-.5 1.6-.8 2.5-.8 1.8 0 3.5 1 5 3v2.5c0 1.4-1.1 2.5-2.5 2.5h-10A2.5 2.5 0 0 1 4 16.5V14Z"
              stroke={colors.textMuted}
              strokeWidth="1.6"
            />
            <Path
              d="M7.5 8.5 6 5.5M10 7.5 9.2 4.5M14 7.5l.8-3M16.5 8.5 18 5.5"
              stroke={colors.textMuted}
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </Svg>
        )}
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  pin: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  photo: {
    width: '100%',
    height: '100%',
  },
});
