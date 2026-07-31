/**
 * PhotoCard adapter — coat theme border + CatDex number.
 */
import { memo } from 'react';

import { PhotoCard } from '@/components/Card/PhotoCard';
import { formatCaptureTime, formatDexNumber } from '@/lib/constants';
import { themeFromColorLabel, themeSoft } from '@/lib/catTheme';
import type { Cat } from '@/types/cat';

type Props = {
  cat: Cat;
  onPress: () => void;
};

function CatDexCardComponent({ cat, onPress }: Props) {
  const theme = themeFromColorLabel(cat.analysis.color, cat.number);
  const dexLabel = formatDexNumber(cat.number);

  return (
    <PhotoCard
      source={{ uri: cat.photoUri }}
      title={cat.name}
      subtitle={cat.analysis.breed}
      meta={formatCaptureTime(cat.discoveredAt)}
      dexLabel={dexLabel}
      badges={[cat.analysis.coat, cat.analysis.color].filter(Boolean)}
      tint={themeSoft(theme)}
      accentColor={`${theme.hex}88`}
      badgeColor={theme.badge}
      badgeBackground={`${theme.hex}33`}
      onPress={onPress}
      accessibilityLabel={`${dexLabel}, ${cat.name}, ${cat.analysis.breed}`}
    />
  );
}

export const CatDexCard = memo(CatDexCardComponent);
