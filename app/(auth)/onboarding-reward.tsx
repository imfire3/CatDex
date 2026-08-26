import { Redirect } from 'expo-router';

import { useAuthStore } from '@/store/auth';

/** Legacy intro step 3/3 — cinema cut; first reward is a real capture. */
export default function OnboardingRewardScreen() {
  const user = useAuthStore((state) => state.user);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }
  if (!onboardingCompleted) {
    return <Redirect href="/(auth)/intro" />;
  }
  return <Redirect href="/(tabs)/map" />;
}
