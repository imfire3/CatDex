import { View } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

import { Button, type ButtonVariant } from '@/components/Button';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

export type ErrorStateIcon =
  | 'camera'
  | 'location'
  | 'analysis'
  | 'offline'
  | 'server'
  | 'photo';

export type ErrorStateProps = {
  icon?: ErrorStateIcon;
  title: string;
  description: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  primaryVariant?: ButtonVariant;
  secondaryVariant?: ButtonVariant;
  /** Compact layout for modals / sheets. */
  compact?: boolean;
};

function CameraIcon({ color }: { color: string }) {
  const { iconStroke } = useTheme();
  return (
    <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 9.5V8a2 2 0 0 1 2-2h1.5l1-1.5h7L16.5 6H18a2 2 0 0 1 2 2v1.5"
        stroke={color}
        strokeWidth={iconStroke.regular}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect
        x="4"
        y="9.5"
        width="16"
        height="10.5"
        rx="2"
        stroke={color}
        strokeWidth={iconStroke.regular}
      />
      <Circle cx="12" cy="14.5" r="2.75" stroke={color} strokeWidth={iconStroke.regular} />
    </Svg>
  );
}

function LocationIcon({ color }: { color: string }) {
  const { iconStroke } = useTheme();
  return (
    <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z"
        stroke={color}
        strokeWidth={iconStroke.regular}
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="10" r="2.5" stroke={color} strokeWidth={iconStroke.regular} />
    </Svg>
  );
}

function AnalysisIcon({ color }: { color: string }) {
  const { iconStroke } = useTheme();
  return (
    <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
      <Rect
        x="5"
        y="4"
        width="14"
        height="16"
        rx="4"
        stroke={color}
        strokeWidth={iconStroke.regular}
      />
      <Circle cx="9.5" cy="11" r="1.2" fill={color} />
      <Circle cx="14.5" cy="11" r="1.2" fill={color} />
      <Path
        d="M9.5 15.5c.8.9 1.8 1.3 2.5 1.3s1.7-.4 2.5-1.3"
        stroke={color}
        strokeWidth={iconStroke.regular}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function OfflineIcon({ color }: { color: string }) {
  const { iconStroke } = useTheme();
  return (
    <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12.5a9 9 0 0 1 14 0"
        stroke={color}
        strokeWidth={iconStroke.regular}
        strokeLinecap="round"
      />
      <Path
        d="M7.8 15.2a5.5 5.5 0 0 1 8.4 0"
        stroke={color}
        strokeWidth={iconStroke.regular}
        strokeLinecap="round"
      />
      <Circle cx="12" cy="18.5" r="1.3" fill={color} />
      <Line
        x1="5"
        y1="5"
        x2="19"
        y2="19"
        stroke={color}
        strokeWidth={iconStroke.regular}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function ServerIcon({ color }: { color: string }) {
  const { iconStroke } = useTheme();
  return (
    <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
      <Rect
        x="4"
        y="4"
        width="16"
        height="6"
        rx="1.5"
        stroke={color}
        strokeWidth={iconStroke.regular}
      />
      <Rect
        x="4"
        y="14"
        width="16"
        height="6"
        rx="1.5"
        stroke={color}
        strokeWidth={iconStroke.regular}
      />
      <Circle cx="8" cy="7" r="1" fill={color} />
      <Circle cx="8" cy="17" r="1" fill={color} />
    </Svg>
  );
}

function PhotoIcon({ color }: { color: string }) {
  const { iconStroke } = useTheme();
  return (
    <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
      <Rect
        x="3.5"
        y="5"
        width="17"
        height="14"
        rx="2.5"
        stroke={color}
        strokeWidth={iconStroke.regular}
      />
      <Circle cx="9" cy="11" r="2" stroke={color} strokeWidth={iconStroke.regular} />
      <Path
        d="M3.5 16.5 9 12l3 2.5 3.5-4 5 6"
        stroke={color}
        strokeWidth={iconStroke.regular}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function IconBubble({ name }: { name: ErrorStateIcon }) {
  const { colors, spacing, radius } = useTheme();
  const tint = colors.brand;
  const soft = colors.brandSoft;

  return (
    <View
      style={{
        width: spacing[96],
        height: spacing[96],
        borderRadius: radius.full,
        backgroundColor: soft,
        alignItems: 'center',
        justifyContent: 'center' }}
    >
      {name === 'camera' ? <CameraIcon color={tint} /> : null}
      {name === 'location' ? <LocationIcon color={tint} /> : null}
      {name === 'analysis' ? <AnalysisIcon color={tint} /> : null}
      {name === 'offline' ? <OfflineIcon color={tint} /> : null}
      {name === 'server' ? <ServerIcon color={tint} /> : null}
      {name === 'photo' ? <PhotoIcon color={tint} /> : null}
    </View>
  );
}

/**
 * Error / permission empty — CatDex white-first DA (mock « Gestion des erreurs »).
 */
export function ErrorState({
  icon = 'analysis',
  title,
  description,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  primaryVariant = 'primary',
  secondaryVariant = 'ghost',
  compact = false,
}: ErrorStateProps) {
  const { spacing } = useTheme();

  return (
    <View
      accessibilityRole="alert"
      style={{
        alignItems: 'center',
        gap: compact ? spacing[16] : spacing[24],
        paddingHorizontal: compact ? 0 : spacing[8] }}
    >
      <IconBubble name={icon} />

      <View style={{ gap: spacing[8], alignItems: 'center', maxWidth: 320 }}>
        <Text variant="title" color="text" align="center">
          {title}
        </Text>
        <Text variant="body" color="textSecondary" align="center">
          {description}
        </Text>
      </View>

      <View style={{ alignSelf: 'stretch', gap: spacing[8], marginTop: spacing[8] }}>
        <Button
          title={primaryLabel}
          variant={primaryVariant}
          onPress={onPrimary}
          accessibilityLabel={primaryLabel}
        />
        {secondaryLabel && onSecondary ? (
          <Button
            title={secondaryLabel}
            variant={secondaryVariant}
            onPress={onSecondary}
            accessibilityLabel={secondaryLabel}
          />
        ) : null}
      </View>
    </View>
  );
}
