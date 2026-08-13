import { router } from 'expo-router';

import { AuthHeader } from '@/components/Auth/AuthChrome';

type Props = {
  onBack?: () => void;
  title?: string;
};

/** Signup sticky header — back + centered title (Figma auth chrome). */
export function SignupHeader({
  onBack = () => router.replace('/(auth)/welcome'),
  title = 'Rejoins CatDex',
}: Props) {
  return <AuthHeader inline showBack onBack={onBack} title={title} />;
}
