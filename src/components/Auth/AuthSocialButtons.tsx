import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { AuthDivider } from '@/components/Auth/AuthChrome';
import { Button } from '@/components/Button';
import { useTheme } from '@/theme/ThemeProvider';

function GoogleGlyph() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" accessibilityElementsHidden>
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </Svg>
  );
}

function AppleGlyph({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" accessibilityElementsHidden>
      <Path
        d="M16.7 12.6c0-2.2 1.8-3.2 1.9-3.3-1-1.5-2.6-1.7-3.2-1.7-1.3-.1-2.6.8-3.3.8-.7 0-1.8-.8-3-.7-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.9 2.2 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.2.9-1.3 1.3-2.5 1.3-2.6-.1 0-2.5-1-2.5-3.8ZM14.5 6.5c.6-.8 1.1-1.9.9-3-1 .1-2.2.7-2.9 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.2-.5 3-1.4Z"
        fill={color}
      />
    </Svg>
  );
}

type AuthSocialButtonsProps = {
  disabled?: boolean;
  onGoogle: () => void;
  onApple: () => void;
  hideGoogle?: boolean;
  hideApple?: boolean;
  dividerLabel?: string;
  /** Show the OU divider above the social buttons. */
  showDivider?: boolean;
};

/** Full-width Google / Apple as true alternatives — not icon tiles. */
export function AuthSocialButtons({
  disabled = false,
  onGoogle,
  onApple,
  hideGoogle = false,
  hideApple = false,
  dividerLabel = 'OU',
  showDivider = true,
}: AuthSocialButtonsProps) {
  const { colors, spacing } = useTheme();
  const showGoogle = !hideGoogle;
  const showApple = !hideApple;

  if (!showGoogle && !showApple) return null;

  return (
    <View style={{ gap: spacing[16], alignSelf: 'stretch' }}>
      {showDivider ? <AuthDivider label={dividerLabel} /> : null}
      <View style={{ gap: spacing[8] }}>
        {showGoogle ? (
          <Button
            variant="google"
            title="Continuer avec Google"
            disabled={disabled}
            onPress={onGoogle}
            icon={<GoogleGlyph />}
          />
        ) : null}
        {showApple ? (
          <Button
            variant="apple"
            title="Continuer avec Apple"
            disabled={disabled}
            onPress={onApple}
            icon={<AppleGlyph color={colors.authAppleLabel} />}
          />
        ) : null}
      </View>
    </View>
  );
}
