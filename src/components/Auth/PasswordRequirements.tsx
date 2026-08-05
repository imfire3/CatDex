import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Text } from '@/components/Text';
import { PASSWORD_RULES, getPasswordRuleStatus } from '@/lib/authValidation';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  password: string;
};

function RuleIcon({ met }: { met: boolean }) {
  const { colors, iconStroke } = useTheme();
  if (met) {
    return (
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" fill={colors.successSoft} />
        <Path
          d="M8 12.5 11 15.5 16 9.5"
          stroke={colors.success}
          strokeWidth={iconStroke.regular}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="12"
        r="9"
        stroke={colors.textMuted}
        strokeWidth={iconStroke.regular}
      />
    </Svg>
  );
}

/**
 * Live password checklist — grey until met, then green.
 */
export function PasswordRequirements({ password }: Props) {
  const { spacing } = useTheme();
  const status = getPasswordRuleStatus(password);

  return (
    <View style={{ gap: spacing[8] }} accessibilityRole="summary">
      {PASSWORD_RULES.map((rule) => {
        const met = status[rule.id];
        return (
          <View
            key={rule.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing[8],
            }}
          >
            <RuleIcon met={met} />
            <Text variant="caption" color={met ? 'success' : 'textMuted'}>
              {rule.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
