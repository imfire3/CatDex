import { Redirect } from 'expo-router';

import { useAuthStore } from '@/store/auth';

/** Legacy intro step 2/3 — cinema cut; GPS/camera stay in-map. */
export default function PermissionsScreen() {
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
