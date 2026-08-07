import { Pressable, Switch, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Badge } from '@/components/Badge';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

export type SettingsRowBadge = 'Nouveau' | 'Bêta';

type SettingsRowBase = {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: SettingsRowBadge;
  showDivider?: boolean;
  destructive?: boolean;
};

type NavProps = SettingsRowBase & {
  kind?: 'nav';
  value?: string;
  onPress: () => void;
};

type SwitchRowProps = SettingsRowBase & {
  kind: 'switch';
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
};

type ValueProps = SettingsRowBase & {
  kind: 'value';
  value: string;
  onPress?: () => void;
};

export type SettingsRowProps = NavProps | SwitchRowProps | ValueProps;

function RowBadge({ label }: { label: SettingsRowBadge }) {
  const { colors } = useTheme();
  if (label === 'Bêta') {
    return (
      <Badge
        label="Bêta"
        color={colors.warning}
        backgroundColor={colors.warningSoft}
      />
    );
  }
  return <Badge label="Nouveau" variant="accent" />;
}

function Chevron() {
  const { colors, iconStroke } = useTheme();
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 6l6 6-6 6"
        stroke={colors.textMuted}
        strokeWidth={iconStroke.regular}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

type RowChromeProps = {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: SettingsRowBadge;
  destructive?: boolean;
  trailing: React.ReactNode;
};

function RowChrome({
  icon,
  title,
  subtitle,
  badge,
  destructive,
  trailing,
}: RowChromeProps) {
  const { colors, fonts, spacing, radius } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[16],
        paddingVertical: spacing[16],
        paddingHorizontal: spacing[16],
      }}
    >
      <View
        style={{
          width: spacing[40],
          height: spacing[40],
          borderRadius: radius.md,
          backgroundColor: destructive ? colors.dangerSoft : colors.surfaceSecondary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1, gap: spacing[4], minWidth: 0 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing[8],
            flexWrap: 'wrap',
          }}
        >
          <Text
            variant="body"
            color={destructive ? 'danger' : 'text'}
            style={{ fontFamily: fonts.bodySemi }}
            numberOfLines={1}
          >
            {title}
          </Text>
          {badge ? <RowBadge label={badge} /> : null}
        </View>
        {subtitle ? (
          <Text variant="caption" color="textSecondary" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
    </View>
  );
}

/**
 * Single settings line: icon · title · optional subtitle · switch | value | chevron.
 */
export function SettingsRow(props: SettingsRowProps) {
  const { colors, spacing, motion } = useTheme();
  const { showDivider = true, destructive = false } = props;

  let body: React.ReactNode;

  if (props.kind === 'switch') {
    const { icon, title, subtitle, badge, value, onValueChange, disabled } = props;
    body = (
      <Pressable
        accessibilityRole="switch"
        accessibilityLabel={title}
        accessibilityState={{ checked: value, disabled }}
        disabled={disabled}
        onPress={() => onValueChange(!value)}
        style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
      >
        <RowChrome
          icon={icon}
          title={title}
          subtitle={subtitle}
          badge={badge}
          destructive={destructive}
          trailing={
            <Switch
              value={value}
              onValueChange={onValueChange}
              disabled={disabled}
              trackColor={{ false: colors.brandSoft, true: colors.success }}
              thumbColor={value ? colors.onAccent : colors.brand}
              ios_backgroundColor={colors.brandSoft}
              accessibilityLabel={title}
            />
          }
        />
      </Pressable>
    );
  } else if (props.kind === 'value') {
    const { icon, title, subtitle, badge, value, onPress } = props;
    const chrome = (
      <RowChrome
        icon={icon}
        title={title}
        subtitle={subtitle}
        badge={badge}
        destructive={destructive}
        trailing={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[8] }}>
            <Text variant="bodySmall" color="textMuted" numberOfLines={1}>
              {value}
            </Text>
            {onPress ? <Chevron /> : null}
          </View>
        }
      />
    );
    body = onPress ? (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        onPress={onPress}
        style={({ pressed }) => ({
          opacity: pressed ? 0.88 : 1,
          transform: [{ scale: pressed ? motion.pressScale : 1 }],
        })}
      >
        {chrome}
      </Pressable>
    ) : (
      <View accessibilityRole="text" accessibilityLabel={`${title}, ${value}`}>
        {chrome}
      </View>
    );
  } else {
    const { icon, title, subtitle, badge, value, onPress } = props;
    body = (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        onPress={onPress}
        style={({ pressed }) => ({
          opacity: pressed ? 0.88 : 1,
          transform: [{ scale: pressed ? motion.pressScale : 1 }],
        })}
      >
        <RowChrome
          icon={icon}
          title={title}
          subtitle={subtitle}
          badge={badge}
          destructive={destructive}
          trailing={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[8] }}>
              {value ? (
                <Text variant="bodySmall" color="textMuted" numberOfLines={1}>
                  {value}
                </Text>
              ) : null}
              <Chevron />
            </View>
          }
        />
      </Pressable>
    );
  }

  return (
    <>
      {body}
      {showDivider ? (
        <View
          style={{
            height: 1,
            backgroundColor: colors.border,
            marginLeft: spacing[16] + spacing[40] + spacing[16],
          }}
        />
      ) : null}
    </>
  );
}
