import { catsService } from "@/services/cats.service";
import { getJson, queueStorage, setJson } from "@/lib/storage/mmkv";
import { supabase } from "@/lib/supabase";
import type { CreateCatInput, UploadQueueItem } from "@/types/database";

const QUEUE_KEY = "upload_queue";

async function isOnline() {
  try {
    const { error } = await supabase.from("zones").select("id").limit(1);
    return !error;
  } catch {
    return false;
  }
}

export const syncService = {
  getQueue(): UploadQueueItem[] {
    return getJson<UploadQueueItem[]>(queueStorage, QUEUE_KEY) ?? [];
  },

  saveQueue(queue: UploadQueueItem[]) {
    setJson(queueStorage, QUEUE_KEY, queue);
  },

  enqueue(item: Omit<UploadQueueItem, "id" | "createdAt" | "retries">) {
    const queue = syncService.getQueue();
    const next: UploadQueueItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString(),
      retries: 0,
    };
    queue.push(next);
    syncService.saveQueue(queue);
    return next;
  },

  async processQueue() {
    const online = await isOnline();
    if (!online) return { processed: 0, failed: 0 };

    const queue = syncService.getQueue();
    if (queue.length === 0) return { processed: 0, failed: 0 };

    const remaining: UploadQueueItem[] = [];
    let processed = 0;
    let failed = 0;

    for (const item of queue) {
      try {
        if (item.type === "create_cat") {
          await catsService.createFromCapture(item.payload as unknown as CreateCatInput);
        } else if (item.type === "add_capture") {
          const { catId, photoUri } = item.payload as { catId: string; photoUri?: string };
          await catsService.addCaptureForExistingCat(catId, photoUri);
        }
        processed += 1;
      } catch {
        if (item.retries < 3) {
          remaining.push({ ...item, retries: item.retries + 1 });
        }
        failed += 1;
      }
    }

    syncService.saveQueue(remaining);
    return { processed, failed };
  },

  startAutoSync(intervalMs = 30000) {
    const id = setInterval(() => {
      syncService.processQueue().catch(() => undefined);
    }, intervalMs);
    return () => clearInterval(id);
  },
};
