import { View } from 'react-native';

import { Text } from '@/components/Text';
import { rarityTokens, type RarityId } from '@/lib/catTheme';
import { useTheme } from '@/theme/ThemeProvider';

export type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'accent'
  | 'info'
  | 'danger'
  | 'common'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'new'
  | 'ai'
  | 'xp'
  | 'level'
  | 'reward'
  | 'custom';

export type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  /** Dominant card color — badge uses a darker shade of the same hue */
  color?: string;
  backgroundColor?: string;
};

const RARITY_VARIANT_MAP: Record<'common' | 'rare' | 'epic' | 'legendary', RarityId> = {
  common: 'common',
  rare: 'uncommon',
  epic: 'rare',
  legendary: 'exceptional',
};

/**
 * Small pill badges — height 24, radius full, paddingH 8 (8pt grid).
 * Rarity badges use supporting accents only — they must not compete with primary CTAs.
 */
export function Badge({ label, variant = 'default', color, backgroundColor }: BadgeProps) {
  const { colors, spacing, radius, fonts } = useTheme();

  let resolvedBg = backgroundColor ?? colors.primarySoft;
  let resolvedColor = color ?? colors.textBody;

  if (!backgroundColor && !color) {
    if (variant === 'success') {
      resolvedBg = colors.successSoft;
      resolvedColor = colors.success;
    } else if (variant === 'warning') {
      resolvedBg = colors.warningSoft;
      resolvedColor = colors.warning;
    } else if (variant === 'accent') {
      resolvedBg = colors.accentSoft;
      resolvedColor = colors.accent;
    } else if (variant === 'info') {
      resolvedBg = colors.infoSoft;
      resolvedColor = colors.info;
    } else if (variant === 'danger') {
      resolvedBg = colors.dangerSoft;
      resolvedColor = colors.danger;
    } else if (variant === 'new') {
      resolvedBg = colors.accentSoft;
      resolvedColor = colors.accent;
    } else if (variant === 'ai') {
      resolvedBg = colors.infoSoft;
      resolvedColor = colors.info;
    } else if (variant === 'xp') {
      resolvedBg = colors.successSoft;
      resolvedColor = colors.success;
    } else if (variant === 'level') {
      resolvedBg = colors.brandSoft;
      resolvedColor = colors.brand;
    } else if (variant === 'reward') {
      resolvedBg = colors.warningSoft;
      resolvedColor = colors.warning;
    } else if (variant === 'common' || variant === 'rare' || variant === 'epic' || variant === 'legendary') {
      const rarity = rarityTokens[RARITY_VARIANT_MAP[variant]];
      resolvedBg = rarity.background;
      resolvedColor = rarity.foreground;
    }
  }

  return (
    <View
      accessibilityRole="text"
      style={{
        alignSelf: 'flex-start',
        height: spacing[24],
        backgroundColor: resolvedBg,
        borderRadius: radius.full,
        paddingHorizontal: spacing[8],
        justifyContent: 'center',
      }}
    >
      <Text
        variant="caption"
        style={{ fontFamily: fonts.bodySemi, color: resolvedColor, lineHeight: 16 }}
      >
        {label}
      </Text>
    </View>
  );
}
