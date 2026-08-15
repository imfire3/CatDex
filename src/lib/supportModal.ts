import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'catdex-support-modal-dismissed';

async function readDismissedIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string');
  } catch {
    return [];
  }
}

/** Whether this user already dismissed the free/Revolut support modal on the map. */
export async function hasDismissedSupportModal(
  userId: string | null | undefined,
): Promise<boolean> {
  if (!userId) return true;
  const ids = await readDismissedIds();
  return ids.includes(userId);
}

export async function dismissSupportModal(
  userId: string | null | undefined,
): Promise<void> {
  if (!userId) return;
  const ids = await readDismissedIds();
  if (ids.includes(userId)) return;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...ids, userId]));
}
