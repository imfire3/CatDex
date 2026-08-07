import { View } from 'react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

/** Post-auth onboarding: Intro → Permissions */
export const ONBOARDING_STEP_COUNT = 2;

type OnboardingStepperProps = {
  /** 0-based current step */
  step: number;
  total?: number;
  /** Optional short labels under / beside the step indicator */
  labels?: string[];
};

/** Clear step progress: “Étape 1 / 2” + dots (+ optional labels). */
export function OnboardingStepper({
  step,
  total = ONBOARDING_STEP_COUNT,
  labels,
}: OnboardingStepperProps) {
  const { colors, fonts, spacing, radius } = useTheme();
  const clamped = Math.max(0, Math.min(total - 1, step));
  const label = labels?.[clamped];

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={
        label
          ? `Étape ${clamped + 1} sur ${total} : ${label}`
          : `Étape ${clamped + 1} sur ${total}`
      }
      accessibilityValue={{ min: 1, max: total, now: clamped + 1 }}
      style={{
        alignItems: 'center',
        gap: spacing[8],
        paddingVertical: spacing[4],
        backgroundColor: colors.background,
      }}
    >
      <Text variant="caption" color="textSecondary" align="center">
        Étape {clamped + 1} / {total}
        {label ? (
          <Text
            variant="caption"
            color="textBrand"
            style={{ fontFamily: fonts.bodySemi }}
          >
            {' · '}
            {label}
          </Text>
        ) : null}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing[8],
        }}
      >
        {Array.from({ length: total }, (_, index) => {
          const active = index === clamped;
          return (
            <View
              key={index}
              style={{
                height: spacing[8],
                width: active ? spacing[24] : spacing[8],
                borderRadius: radius.full,
                backgroundColor: active ? colors.brand : colors.border,
              }}
            />
          );
        })}
      </View>
    </View>
  );
}
