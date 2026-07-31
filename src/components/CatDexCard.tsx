/**
 * PhotoCard adapter — coat theme border + CatDex number.
 */
import { PhotoCard } from '@/components/Card/PhotoCard';
import { formatCaptureTime, formatDexNumber } from '@/lib/constants';
import { themeFromColorLabel, themeSoft } from '@/lib/catTheme';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

type Props = {
  cat: Cat;
  onPress: () => void;
};

export function CatDexCard({ cat, onPress }: Props) {
  const { scheme } = useTheme();
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
      tint={themeSoft(theme, scheme)}
      accentColor={`${theme.hex}88`}
      badgeColor={theme.badge}
      badgeBackground={`${theme.hex}33`}
      onPress={onPress}
      accessibilityLabel={`${dexLabel}, ${cat.name}, ${cat.analysis.breed}`}
    />
  );
}
