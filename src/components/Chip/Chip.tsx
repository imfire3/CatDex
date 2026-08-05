import { Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

export type ChipVariant = 'default' | 'filter' | 'removable';

export type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  variant?: ChipVariant;
  static?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
};

/** Filter / selection chip — selected uses solid accent + white label. */
export function Chip({
  label,
  selected,
  onPress,
  onRemove,
  variant = 'default',
  static: isStatic,
  disabled,
  icon,
}: ChipProps) {
  const { colors, fonts, spacing, radius, motion, iconStroke } = useTheme();

  const isSelected = !!selected;
  const isRemovable = variant === 'removable' || !!onRemove;
  const backgroundColor = isSelected ? colors.accent : colors.surface;
  const borderColor = isSelected ? colors.accent : colors.borderDefault;
  const labelColor = isSelected ? 'onAccent' : 'textSecondary';

  const handleRemove = () => {
    if (disabled) return;
    onRemove?.();
  };

  const body = (
    <View
      style={{
        backgroundColor,
        borderRadius: radius.sm,
        paddingHorizontal: spacing[16],
        paddingVertical: spacing[8],
        borderWidth: 1,
        borderColor,
        opacity: disabled ? 0.45 : 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[8],
        minHeight: 40,
      }}
    >
      {icon}
      <Text variant="bodySmall" color={labelColor} style={{ fontFamily: fonts.bodySemi }}>
        {label}
      </Text>
      {isRemovable ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Retirer ${label}`}
          disabled={disabled}
          onPress={handleRemove}
          hitSlop={8}
          style={({ pressed }) => ({
            width: 24,
            height: 24,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path
              d="M6 6l12 12M18 6 6 18"
              stroke={isSelected ? colors.onAccent : colors.textMuted}
              strokeWidth={iconStroke.regular}
              strokeLinecap="round"
            />
          </Svg>
        </Pressable>
      ) : null}
    </View>
  );

  if (isStatic || !onPress) return body;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected, disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          transform: [{ scale: pressed && !disabled ? motion.pressScale : 1 }],
          opacity: pressed && !disabled ? 0.92 : 1,
        },
      ]}
    >
      {body}
    </Pressable>
  );
}
