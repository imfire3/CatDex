import { View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

/** Post-auth onboarding: Intro → Permissions */
export const ONBOARDING_STEP_COUNT = 2;

type OnboardingStepperProps = {
  /** 0-based current step */
  step: number;
  total?: number;
};

/** Page-control style stepper — active pill + muted dots, on white. */
export function OnboardingStepper({
  step,
  total = ONBOARDING_STEP_COUNT,
}: OnboardingStepperProps) {
  const { colors, spacing, radius } = useTheme();
  const clamped = Math.max(0, Math.min(total - 1, step));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={`Étape ${clamped + 1} sur ${total}`}
      accessibilityValue={{ min: 1, max: total, now: clamped + 1 }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[8],
        paddingVertical: spacing[8],
        backgroundColor: colors.surface,
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
  );
}
