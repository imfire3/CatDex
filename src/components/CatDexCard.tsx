/**
 * PhotoCard adapter — coat theme + rarity for CatDex collection.
 */
import { PhotoCard } from '@/components/Card/PhotoCard';
import { formatCaptureTime, formatDexNumber } from '@/lib/constants';
import {
  rarityFromCat,
  rarityTokens,
  themeFromColorLabel,
  themeSoft,
} from '@/lib/catTheme';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

type Props = {
  cat: Cat;
  onPress: () => void;
};

export function CatDexCard({ cat, onPress }: Props) {
  const { scheme } = useTheme();
  const theme = themeFromColorLabel(cat.analysis.color, cat.number);
  const rarity = rarityFromCat(cat.analysis.color, cat.analysis.coat, cat.number);
  const rarityUi = rarityTokens[rarity];
  const dexLabel = formatDexNumber(cat.number);

  return (
    <PhotoCard
      source={{ uri: cat.photoUri }}
      title={cat.name}
      subtitle={`${cat.analysis.breed} · ${cat.analysis.color}`}
      meta={formatCaptureTime(cat.discoveredAt)}
      location="Paris 20e"
      dexLabel={dexLabel}
      badges={[cat.analysis.coat].filter(Boolean)}
      rarityLabel={rarityUi.label}
      rarityColor={rarityUi.foreground}
      rarityBackground={rarityUi.background}
      tint={themeSoft(theme, scheme)}
      accentColor={rarityUi.border}
      badgeColor={theme.badge}
      badgeBackground={`${theme.hex}33`}
      onPress={onPress}
      accessibilityLabel={`${dexLabel}, ${cat.name}, ${rarityUi.label}`}
    />
  );
}
