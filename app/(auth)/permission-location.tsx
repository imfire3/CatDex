import { Redirect } from 'expo-router';

import { useAuthStore } from '@/store/auth';

/**
 * Legacy route — location is requested in-game via EnablePermissionModal
 * when the user lands on the map.
 */
export default function PermissionLocationScreen() {
  const user = useAuthStore((state) => state.user);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }
  if (!onboardingCompleted) {
    return <Redirect href="/(auth)/onboarding-reward" />;
  }
  return <Redirect href="/(tabs)/map" />;
}
