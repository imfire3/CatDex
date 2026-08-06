import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Button, type ButtonVariant } from '@/components/Button';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

export type EmptyStateIcon = 'cat' | 'search' | 'heart';

export type EmptyStateProps = {
  illustration?: React.ReactNode;
  /** Built-in soft-circle icon when no custom illustration is passed. */
  icon?: EmptyStateIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionVariant?: ButtonVariant;
  /** `page` = full-bleed centered empty (CatDex). `card` = bordered panel. */
  layout?: 'page' | 'card';
};

function CatIcon({ color }: { color: string }) {
  const { iconStroke } = useTheme();
  return (
    <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5.5 10.5 4 5.5l4.2 2.2M18.5 10.5 20 5.5l-4.2 2.2"
        stroke={color}
        strokeWidth={iconStroke.regular}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7 11.5c0 4.2 2.2 7 5 7s5-2.8 5-7c0-2.4-1.3-4.3-3-5.2-.6-.3-1.3-.5-2-.5s-1.4.2-2 .5c-1.7.9-3 2.8-3 5.2Z"
        stroke={color}
        strokeWidth={iconStroke.regular}
        strokeLinejoin="round"
      />
      <Circle cx="10" cy="11.5" r="0.9" fill={color} />
      <Circle cx="14" cy="11.5" r="0.9" fill={color} />
    </Svg>
  );
}

function SearchIcon({ color }: { color: string }) {
  const { iconStroke } = useTheme();
  return (
    <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="6.5" stroke={color} strokeWidth={iconStroke.regular} />
      <Path
        d="M16.2 16.2 20 20"
        stroke={color}
        strokeWidth={iconStroke.regular}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function HeartIcon({ color }: { color: string }) {
  const { iconStroke } = useTheme();
  return (
    <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 19.2S4.8 14.6 4.8 9.8A3.9 3.9 0 0 1 12 7.6a3.9 3.9 0 0 1 7.2 2.2c0 4.8-7.2 9.4-7.2 9.4Z"
        stroke={color}
        strokeWidth={iconStroke.regular}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PawPrint({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="15.5" r="3.2" fill={color} opacity={0.55} />
      <Circle cx="7.2" cy="10.2" r="1.8" fill={color} opacity={0.45} />
      <Circle cx="16.8" cy="10.2" r="1.8" fill={color} opacity={0.45} />
      <Circle cx="9.2" cy="7.2" r="1.5" fill={color} opacity={0.4} />
      <Circle cx="14.8" cy="7.2" r="1.5" fill={color} opacity={0.4} />
    </Svg>
  );
}

function DefaultIcon({ name }: { name: EmptyStateIcon }) {
  const { colors, spacing, radius } = useTheme();
  const tint = name === 'heart' ? colors.rose : colors.brand;
  const soft = name === 'heart' ? colors.roseSoft : colors.brandSoft;

  return (
    <View
      style={{
        width: spacing[96],
        height: spacing[96],
        borderRadius: radius.full,
        backgroundColor: soft,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {name === 'cat' ? <CatIcon color={tint} /> : null}
      {name === 'search' ? <SearchIcon color={tint} /> : null}
      {name === 'heart' ? <HeartIcon color={tint} /> : null}
    </View>
  );
}

/**
 * Empty collection / search / favorites — CatDex white-first DA.
 */
export function EmptyState({
  illustration,
  icon = 'cat',
  title,
  description,
  actionLabel,
  onAction,
  actionVariant = 'primary',
  layout = 'card',
}: EmptyStateProps) {
  const { colors, spacing, radius } = useTheme();
  const isPage = layout === 'page';

  return (
    <View
      accessibilityRole="none"
      style={{
        flexGrow: isPage ? 1 : undefined,
        backgroundColor: isPage ? 'transparent' : colors.surface,
        borderRadius: isPage ? 0 : radius.xl,
        borderWidth: isPage ? 0 : 1,
        borderColor: colors.border,
        padding: spacing[24],
        gap: spacing[16],
        alignItems: 'center',
        justifyContent: isPage ? 'center' : 'flex-start',
        minHeight: isPage ? 360 : undefined,
      }}
    >
      {illustration ?? <DefaultIcon name={icon} />}

      <View style={{ gap: spacing[8], alignItems: 'center', maxWidth: 320 }}>
        <Text variant="h2" color="text" align="center">
          {title}
        </Text>
        <Text variant="body" color="textSecondary" align="center">
          {description}
        </Text>
      </View>

      {icon === 'cat' && isPage ? (
        <View style={{ flexDirection: 'row', gap: spacing[24], opacity: 0.7 }}>
          <PawPrint color={colors.brand} size={28} />
          <PawPrint color={colors.brand} size={28} />
        </View>
      ) : null}

      {actionLabel && onAction ? (
        <Button
          title={actionLabel}
          variant={actionVariant}
          onPress={onAction}
          style={{ alignSelf: 'stretch', marginTop: spacing[8] }}
        />
      ) : null}
    </View>
  );
}
