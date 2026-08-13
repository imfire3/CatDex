import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { Text } from '@/components/Text';
import { PASSWORD_RULES, getPasswordRuleStatus, type PasswordRuleId } from '@/lib/authValidation';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  password: string;
};

function RuleIcon({ met }: { met: boolean }) {
  const { colors, iconStroke } = useTheme();
  const scale = useSharedValue(met ? 1 : 0.85);
  const opacity = useSharedValue(met ? 1 : 0.7);

  useEffect(() => {
    if (met) {
      scale.value = withSequence(
        withTiming(1.2, { duration: 120 }),
        withSpring(1, { damping: 10, stiffness: 260 }),
      );
      opacity.value = withTiming(1, { duration: 160 });
    } else {
      scale.value = withTiming(0.9, { duration: 140 });
      opacity.value = withTiming(0.75, { duration: 140 });
    }
  }, [met, opacity, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animStyle}>
      {met ? (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" fill={colors.brandSoft} />
          <Path
            d="M8 12.5 11 15.5 16 9.5"
            stroke={colors.brand}
            strokeWidth={iconStroke.regular}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ) : (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
          <Circle
            cx="12"
            cy="12"
            r="9"
            stroke={colors.textMuted}
            strokeWidth={iconStroke.regular}
          />
        </Svg>
      )}
    </Animated.View>
  );
}

function RuleLabel({ met, label }: { met: boolean; label: string }) {
  const match = /^(\d+)\s*(.*)$/.exec(label);
  const color = met ? ('textBrand' as const) : ('textMuted' as const);

  if (!match) {
    return (
      <Text variant="caption" color={color}>
        {label}
      </Text>
    );
  }

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
      <Text variant="caption" weight="bold" color={color}>
        {match[1]}
      </Text>
      {match[2] ? (
        <Text variant="caption" color={color}>
          {` ${match[2]}`}
        </Text>
      ) : null}
    </View>
  );
}

function RuleRow({
  ruleId,
  met,
  label,
}: {
  ruleId: PasswordRuleId;
  met: boolean;
  label: string;
}) {
  const { spacing, motion } = useTheme();
  const translateX = useSharedValue(0);
  const prevMet = useRef(false);

  useEffect(() => {
    if (met && !prevMet.current) {
      translateX.value = withSequence(
        withTiming(-2, { duration: motion.duration.fast }),
        withSpring(0, { damping: 12, stiffness: 220 }),
      );
    }
    prevMet.current = met;
  }, [met, motion.duration.fast, translateX]);

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View
      key={ruleId}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing[8],
        },
        rowStyle,
      ]}
    >
      <RuleIcon met={met} />
      <RuleLabel met={met} label={label} />
    </Animated.View>
  );
}

/**
 * Inline password rules under the field — animate when a rule flips to met.
 */
export function PasswordRequirements({ password }: Props) {
  const { colors, spacing, radius } = useTheme();
  const status = getPasswordRuleStatus(password);

  if (!password) return null;

  return (
    <View
      accessibilityRole="summary"
      style={{
        gap: spacing[8],
        paddingVertical: spacing[8],
        paddingHorizontal: spacing[16],
        borderRadius: radius[8],
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {PASSWORD_RULES.map((rule) => (
        <RuleRow
          key={rule.id}
          ruleId={rule.id}
          met={status[rule.id]}
          label={rule.label}
        />
      ))}
    </View>
  );
}
