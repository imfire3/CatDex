import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Text } from '@/components/Text';
import {
  getPasswordRuleStatus,
  isPasswordStrong,
  PASSWORD_RULES,
} from '@/lib/authValidation';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  password: string;
};

export type PasswordStrengthLevel = 'empty' | 'weak' | 'ok' | 'excellent';

/** Map rule progress to Faible / Correct / Excellent — same rules, softer UI. */
export function getPasswordStrengthLevel(password: string): PasswordStrengthLevel {
  if (!password) return 'empty';
  const status = getPasswordRuleStatus(password);
  const met = PASSWORD_RULES.filter((rule) => status[rule.id]).length;
  if (met <= 1) return 'weak';
  if (!isPasswordStrong(password)) return 'ok';
  if (password.length >= 12) return 'excellent';
  return 'ok';
}

const LEVEL_LABEL: Record<Exclude<PasswordStrengthLevel, 'empty'>, string> = {
  weak: 'Faible',
  ok: 'Correct',
  excellent: 'Excellent',
};

/**
 * Password strength meter — replaces the checklist UI while keeping authValidation rules.
 */
export function PasswordStrengthMeter({ password }: Props) {
  const { colors, fonts, spacing, radius, motion } = useTheme();
  const level = getPasswordStrengthLevel(password);
  const progress = useSharedValue(0);
  const prevLevel = useRef(level);

  const fillRatio =
    level === 'empty' ? 0 : level === 'weak' ? 0.33 : level === 'ok' ? 0.66 : 1;

  const fillColor =
    level === 'weak'
      ? colors.danger
      : level === 'ok'
        ? colors.warning
        : level === 'excellent'
          ? colors.success
          : colors.border;

  const labelColor =
    level === 'weak'
      ? ('danger' as const)
      : level === 'ok'
        ? ('warning' as const)
        : level === 'excellent'
          ? ('success' as const)
          : ('textMuted' as const);

  useEffect(() => {
    progress.value = withSpring(fillRatio, {
      damping: 16,
      stiffness: 180,
    });
    prevLevel.current = level;
  }, [fillRatio, level, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0.04, progress.value) * 100}%`,
  }));

  if (!password) return null;

  return (
    <View
      accessibilityRole="summary"
      accessibilityLabel={`Force du mot de passe : ${
        level === 'empty' ? 'vide' : LEVEL_LABEL[level]
      }`}
      style={{ gap: spacing[8] }}
    >
      <View
        style={{
          height: 8,
          borderRadius: radius.full,
          backgroundColor: colors.surfaceSecondary,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={[
            {
              height: '100%',
              borderRadius: radius.full,
              backgroundColor: fillColor,
            },
            fillStyle,
          ]}
        />
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing[8],
        }}
      >
        <Text
          variant="caption"
          color={labelColor}
          style={{ fontFamily: fonts.bodySemi }}
        >
          {LEVEL_LABEL[level === 'empty' ? 'weak' : level]}
        </Text>
        <Text variant="caption" color="textMuted">
          8+ · chiffre · symbole
        </Text>
      </View>
    </View>
  );
}

/** @deprecated Prefer PasswordStrengthMeter — kept for import stability. */
export { PasswordStrengthMeter as PasswordRequirements };
