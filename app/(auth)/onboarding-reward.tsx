import { Redirect } from 'expo-router';

import { useAuthStore } from '@/store/auth';

/** Legacy route kept for old links; rewards now follow a real first capture. */
export default function OnboardingRewardScreen() {
  const user = useAuthStore((state) => state.user);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }
  if (onboardingCompleted) {
    return <Redirect href="/(tabs)/map" />;
  }

  return <Redirect href="/(auth)/permission-location" />;
}
