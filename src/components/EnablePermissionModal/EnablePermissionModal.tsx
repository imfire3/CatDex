import { Modal as RNModal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { ErrorState, type ErrorStateIcon } from '@/components/ErrorState';
import { ERROR_CATALOG } from '@/lib/errorCatalog';
import { useTheme } from '@/theme/ThemeProvider';

export type EnablePermissionKind = 'camera' | 'location';

export type EnablePermissionModalProps = {
  visible: boolean;
  kind: EnablePermissionKind;
  onClose: () => void;
  /** Request OS permission again. */
  onRetry: () => void;
  /** Open system settings when permission is permanently denied. */
  onOpenSettings?: () => void;
  /** Optional escape hatch (e.g. use gallery / Plus tard). */
  onDismissLabel?: string;
  onDismiss?: () => void;
  /** Override catalog title (first-ask friendly copy). */
  title?: string;
  /** Override catalog description. */
  description?: string;
  /** Override primary CTA (e.g. Autoriser vs Réessayer). */
  primaryLabel?: string;
};

const COPY: Record<
  EnablePermissionKind,
  { icon: ErrorStateIcon; title: string; description: string }
> = {
  camera: {
    icon: ERROR_CATALOG.cameraPermission.icon,
    title: ERROR_CATALOG.cameraPermission.title,
    description: ERROR_CATALOG.cameraPermission.description,
  },
  location: {
    icon: ERROR_CATALOG.locationPermission.icon,
    title: ERROR_CATALOG.locationPermission.title,
    description: ERROR_CATALOG.locationPermission.description,
  },
};

/**
 * Centered modal asking the user to enable camera / location.
 */
export function EnablePermissionModal({
  visible,
  kind,
  onClose,
  onRetry,
  onOpenSettings,
  onDismissLabel,
  onDismiss,
  title,
  description,
  primaryLabel,
}: EnablePermissionModalProps) {
  const { colors, spacing, radius, shadow } = useTheme();
  const insets = useSafeAreaInsets();
  const copy = COPY[kind];
  const resolvedTitle = title ?? copy.title;
  const resolvedDescription = description ?? copy.description;
  const resolvedPrimary =
    primaryLabel ??
    (kind === 'camera' ? 'Autoriser la caméra' : 'Autoriser la position');

  const secondaryLabel = onOpenSettings
    ? 'Ouvrir les réglages'
    : onDismissLabel;
  const onSecondary = onOpenSettings ?? onDismiss;

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <View
        style={[
          styles.backdrop,
          {
            backgroundColor: colors.overlay,
            paddingTop: insets.top + spacing[24],
            paddingBottom: Math.max(insets.bottom, spacing[24]),
            paddingHorizontal: spacing[24],
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fermer"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View
          accessibilityRole="summary"
          accessibilityLabel={resolvedTitle}
          style={[
            {
              width: '100%',
              maxWidth: 400,
              alignSelf: 'center',
              backgroundColor: colors.surfaceElevated,
              borderRadius: radius.xl,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing[24],
              gap: spacing[8],
            },
            shadow.floating,
          ]}
        >
          <ErrorState
            compact
            icon={copy.icon}
            title={resolvedTitle}
            description={resolvedDescription}
            primaryLabel={resolvedPrimary}
            onPrimary={onRetry}
            secondaryLabel={secondaryLabel}
            onSecondary={onSecondary}
            secondaryVariant="ghost"
          />
          {onOpenSettings && onDismissLabel && onDismiss ? (
            <Button
              title={onDismissLabel}
              variant="secondary"
              onPress={onDismiss}
              accessibilityLabel={onDismissLabel}
            />
          ) : null}
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
  },
});
