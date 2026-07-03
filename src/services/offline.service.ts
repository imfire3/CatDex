import NetInfo from '@react-native-community/netinfo';
import { offlineStorage, getJson, setJson, StorageKeys } from '@/lib/mmkv';
import { catsService } from './cats.service';
import type { NearbyCat, CreateCatInput, UploadQueueItem } from '@/types';

let syncInProgress = false;

export const offlineService = {
  cacheNearbyCats(cats: NearbyCat[]): void {
    setJson(StorageKeys.NEARBY_CATS, cats, offlineStorage);
    offlineStorage.set(StorageKeys.LAST_SYNC, new Date().toISOString());
  },

  getCachedNearbyCats(): NearbyCat[] {
    return getJson<NearbyCat[]>(StorageKeys.NEARBY_CATS, offlineStorage) ?? [];
  },

  getLastSyncTime(): string | null {
    return offlineStorage.getString(StorageKeys.LAST_SYNC) ?? null;
  },

  addToUploadQueue(item: Omit<UploadQueueItem, 'id' | 'createdAt' | 'retryCount'>): void {
    const queue = this.getUploadQueue();
    const newItem: UploadQueueItem = {
      ...item,
      id: `local_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      retryCount: 0,
      createdAt: new Date().toISOString(),
    };
    queue.push(newItem);
    setJson(StorageKeys.UPLOAD_QUEUE, queue, offlineStorage);
  },

  getUploadQueue(): UploadQueueItem[] {
    return getJson<UploadQueueItem[]>(StorageKeys.UPLOAD_QUEUE, offlineStorage) ?? [];
  },

  removeFromQueue(itemId: string): void {
    const queue = this.getUploadQueue().filter((item) => item.id !== itemId);
    setJson(StorageKeys.UPLOAD_QUEUE, queue, offlineStorage);
  },

  async processUploadQueue(userId: string): Promise<{ success: number; failed: number }> {
    if (syncInProgress) return { success: 0, failed: 0 };

    const netState = await NetInfo.fetch();
    if (!netState.isConnected) return { success: 0, failed: 0 };

    syncInProgress = true;
    const queue = this.getUploadQueue();
    let success = 0;
    let failed = 0;

    for (const item of queue) {
      try {
        if (item.type === 'cat_creation') {
          await catsService.createCat(userId, item.payload as CreateCatInput);
        }
        this.removeFromQueue(item.id);
        success++;
      } catch {
        item.retryCount++;
        if (item.retryCount >= 3) {
          this.removeFromQueue(item.id);
          failed++;
        } else {
          const updatedQueue = this.getUploadQueue().map((q) =>
            q.id === item.id ? item : q
          );
          setJson(StorageKeys.UPLOAD_QUEUE, updatedQueue, offlineStorage);
          failed++;
        }
      }
    }

    syncInProgress = false;
    return { success, failed };
  },

  setupAutoSync(userId: string, onSync?: (result: { success: number; failed: number }) => void): () => void {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      if (state.isConnected) {
        const result = await this.processUploadQueue(userId);
        if (result.success > 0 || result.failed > 0) {
          onSync?.(result);
        }
      }
    });
    return unsubscribe;
  },

  getPendingUploadCount(): number {
    return this.getUploadQueue().length;
  },
};
