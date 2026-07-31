import { Image, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Marker } from 'react-native-maps';
import { useEffect } from 'react';

import { rarityFromCat, rarityTokens } from '@/lib/catTheme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

type Props = {
  cat: Cat;
  onPress: (cat: Cat) => void;
};

/** Circular photo pin with rarity-colored ring + soft pulse */
export function CatMapMarker({ cat, onPress }: Props) {
  const { colors, spacing } = useTheme();
  const reduceMotion = useReducedMotion();
  const size = spacing[48];
  const rarity = rarityFromCat(cat.analysis.color, cat.analysis.coat, cat.number);
  const ring = rarityTokens[rarity].ring;
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(
      withTiming(1.08, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [pulse, reduceMotion]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 2 - pulse.value,
  }));

  return (
    <Marker
      coordinate={{ latitude: cat.latitude, longitude: cat.longitude }}
      onPress={() => onPress(cat)}
      tracksViewChanges={false}
    >
      <View style={{ width: size + spacing[16], height: size + spacing[16], alignItems: 'center', justifyContent: 'center' }}>
        {!reduceMotion ? (
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: size + spacing[8],
                height: size + spacing[8],
                borderRadius: radiusPill(size + spacing[8]),
                backgroundColor: `${ring}33`,
              },
              pulseStyle,
            ]}
          />
        ) : null}
        <View
          style={[
            styles.pin,
            {
              width: size,
              height: size,
              borderRadius: radiusPill(size),
              borderWidth: 3,
              borderColor: ring,
              backgroundColor: colors.surfaceSecondary,
            },
          ]}
        >
          <Image source={{ uri: cat.photoUri }} style={styles.photo} />
        </View>
      </View>
    </Marker>
  );
}

function radiusPill(size: number) {
  return size / 2;
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
