import { Image, View } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Skeleton } from '@/components/Loader';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  photoUri: string;
  analyzing: boolean;
  insets: EdgeInsets;
  onRetry: () => void;
  onRetake: () => void;
};

export function ScannerReview({
  photoUri,
  analyzing,
  insets,
  onRetry,
  onRetake,
}: Props) {
  const { colors, spacing, radius } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: spacing[24], paddingTop: spacing[16], gap: spacing[8] }}>
        <Text variant="h2">{analyzing ? 'Préparation…' : 'Presque'}</Text>
        <Text variant="bodySmall" color="textSecondary">
          {analyzing
            ? 'Ta Cat Card se prépare. Un instant.'
            : 'Relance l’analyse ou reprends une photo.'}
        </Text>
      </View>

      <View
        style={{
          marginHorizontal: spacing[24],
          marginTop: spacing[24],
          borderRadius: radius.xl,
          overflow: 'hidden',
          backgroundColor: colors.surfaceSecondary,
        }}
      >
        <Image
          source={{ uri: photoUri }}
          style={{ width: '100%', height: spacing[96] * 2 + spacing[64] }}
        />
        {analyzing ? (
          <View
            style={{
              position: 'absolute',
              left: spacing[16],
              right: spacing[16],
              bottom: spacing[16],
              gap: spacing[8],
            }}
          >
            <Skeleton height={spacing[16]} width="55%" />
            <Skeleton height={spacing[8]} width="80%" />
            <Skeleton height={spacing[8]} width="40%" />
          </View>
        ) : null}
      </View>

      <View
        style={{
          marginTop: 'auto',
          paddingHorizontal: spacing[24],
          paddingBottom: insets.bottom + spacing[16],
          gap: spacing[8],
        }}
      >
        {analyzing ? (
          <View style={{ alignItems: 'center', gap: spacing[16], paddingVertical: spacing[16] }}>
            <Text variant="bodySmall" color="textSecondary">
              Révélation en cours…
            </Text>
          </View>
        ) : (
          <>
            <Button title="Relancer l’analyse" onPress={onRetry} />
            <Button title="Reprendre" variant="ghost" onPress={onRetake} />
          </>
        )}
      </View>
    </View>
  );
}
