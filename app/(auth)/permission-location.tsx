import { Redirect } from 'expo-router';

import { useAuthStore } from '@/store/auth';

/**
 * Legacy GPS wall before the map.
 * Location is requested from the map banner / recenter / capture.
 */
export default function PermissionLocationScreen() {
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
