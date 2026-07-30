/**
 * PhotoCard adapter — pastel coat theme + clear hierarchy.
 */
import { PhotoCard } from '@/components/Card/PhotoCard';
import { formatCaptureTime } from '@/lib/constants';
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

  return (
    <PhotoCard
      source={{ uri: cat.photoUri }}
      title={cat.name}
      subtitle={cat.analysis.breed}
      meta={formatCaptureTime(cat.discoveredAt)}
      badges={[cat.analysis.coat, cat.analysis.color].filter(Boolean)}
      tint={themeSoft(theme, scheme)}
      badgeColor={theme.badge}
      badgeBackground={`${theme.hex}33`}
      onPress={onPress}
      accessibilityLabel={`${cat.name}, ${cat.analysis.breed}`}
    />
  );
}
