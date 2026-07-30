import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

export type HeaderProps = {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  onBack?: () => void;
  style?: StyleProp<ViewStyle>;
  transparent?: boolean;
};

export function Header({
  title,
  subtitle,
  left,
  right,
  onBack,
  style,
  transparent,
}: HeaderProps) {
  const { colors, fonts, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        {
          paddingTop: insets.top + spacing[8],
          paddingHorizontal: spacing[16],
          paddingBottom: spacing[16],
          backgroundColor: transparent ? 'transparent' : colors.background,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing[16],
        },
        style,
      ]}
    >
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour"
          onPress={onBack}
          hitSlop={spacing[8]}
        >
          <Text variant="body" color="primary" style={{ fontFamily: fonts.bodySemi }}>
            Retour
          </Text>
        </Pressable>
      ) : (
        left
      )}
      <View style={{ flex: 1 }}>
        <Text variant="h1">{title}</Text>
        {subtitle ? (
          <Text variant="bodySmall" color="textSecondary">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}
