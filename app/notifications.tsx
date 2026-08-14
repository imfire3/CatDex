import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { SettingsScreen } from '@/components/Settings';
import { Text } from '@/components/Text';
import { useMapExploreStore } from '@/store/mapExplore';
import {
  selectUnreadCount,
  useNotificationsStore,
  type AppNotification,
} from '@/store/notifications';
import { useCatsStore } from '@/store/cats';
import { useTheme } from '@/theme/ThemeProvider';

function formatWhen(createdAt: number): string {
  const diffMs = Date.now() - createdAt;
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'À l’instant';
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days} j`;
}

function NotificationRow({
  item,
  onPress,
}: {
  item: AppNotification;
  onPress: () => void;
}) {
  const { colors, spacing, radius, shadow } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.title}
      onPress={onPress}
      style={({ pressed }) => [
        {
          padding: spacing[16],
          borderRadius: radius[8],
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: item.read ? colors.border : colors.brand,
          opacity: pressed ? 0.88 : 1,
          gap: spacing[4],
        },
        shadow.low,
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing[8] }}
      >
        <Text
          variant="body" weight="semibold"
          color={item.read ? 'text' : 'textBrand'}
          numberOfLines={1}
          style={{ flex: 1 }}
        >
          {item.title}
        </Text>
        {!item.read ? (
          <View
            style={{
              width: spacing[8],
              height: spacing[8],
              borderRadius: radius.full,
              backgroundColor: colors.brand }}
          />
        ) : null}
      </View>
      <Text variant="bodySmall" color="textSecondary">
        {item.body}
      </Text>
      <Text variant="caption" color="textMuted">
        {formatWhen(item.createdAt)}
      </Text>
    </Pressable>
  );
}

/**
 * Inbox of in-app alerts (proximity, etc.) — not notification settings.
 */
export default function NotificationsScreen() {
  const { spacing } = useTheme();
  const items = useNotificationsStore((state) => state.items);
  const markRead = useNotificationsStore((state) => state.markRead);
  const markAllRead = useNotificationsStore((state) => state.markAllRead);
  const requestFocusOnCat = useMapExploreStore((state) => state.requestFocusOnCat);
  const cats = useCatsStore((state) => state.cats);
  const unread = selectUnreadCount(items);

  const openNotification = (item: AppNotification) => {
    markRead(item.id);
    if (!item.catId) return;

    const fromStore = cats.find(
      (cat) => cat.id === item.catId || cat.remoteId === item.catId,
    );
    const latitude = item.latitude ?? fromStore?.latitude;
    const longitude = item.longitude ?? fromStore?.longitude;
    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      router.push('/(tabs)/map');
      return;
    }

    requestFocusOnCat({
      catId: item.catId,
      latitude,
      longitude,
    });
    router.push('/(tabs)/map');
  };

  return (
    <SettingsScreen
      title="Notifications"
      subtitle="Alertes de proximité et d’exploration — pas les réglages push."
      footer={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Préférences d’alertes"
          onPress={() => router.push('/settings/notifications')}
        >
          <Text
            variant="bodySmall" weight="semibold"
            color="textBrand"
            style={{ textAlign: 'center' }}
          >
            Préférences d’alertes
          </Text>
        </Pressable>
      }
    >
      {items.length === 0 ? (
        <EmptyState
          title="Rien pour l’instant"
          description="Quand tu passes près d’un chat, l’alerte apparaît ici — par ex. « Tu es passé à côté de Ysys · Persan »."
          icon="cat"
        />
      ) : (
        <View style={{ gap: spacing[16] }}>
          {unread > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tout marquer comme lu"
              onPress={markAllRead}
              style={{ alignSelf: 'flex-end' }}
            >
              <Text
                variant="bodySmall" weight="semibold"
                color="textBrand"
              >
                Tout marquer comme lu
              </Text>
            </Pressable>
          ) : null}

          {items.map((item) => (
            <NotificationRow
              key={item.id}
              item={item}
              onPress={() => openNotification(item)}
            />
          ))}
        </View>
      )}
    </SettingsScreen>
  );
}
