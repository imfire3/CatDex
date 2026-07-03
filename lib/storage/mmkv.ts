import Constants, { ExecutionEnvironment } from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type KeyValueStore = {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  remove(key: string): void;
};

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
  Constants.appOwnership === "expo";

function createAsyncBackedStore(namespace: string): KeyValueStore {
  const mem = new Map<string, string>();

  AsyncStorage.getItem(`@catdex/kv/${namespace}`).then((raw) => {
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Record<string, string>;
      for (const [k, v] of Object.entries(parsed)) mem.set(k, v);
    } catch {
      /* ignore corrupt cache */
    }
  });

  const persist = () => {
    const obj = Object.fromEntries(mem);
    AsyncStorage.setItem(`@catdex/kv/${namespace}`, JSON.stringify(obj)).catch(() => undefined);
  };

  return {
    getString(key: string) {
      return mem.get(key);
    },
    set(key: string, value: string) {
      mem.set(key, value);
      persist();
    },
    remove(key: string) {
      mem.delete(key);
      persist();
    },
  };
}

function createMMKVStore(id: string): KeyValueStore {
  const { createMMKV } = require("react-native-mmkv") as typeof import("react-native-mmkv");
  const instance = createMMKV({ id });
  return {
    getString(key: string) {
      return instance.getString(key);
    },
    set(key: string, value: string) {
      instance.set(key, value);
    },
    remove(key: string) {
      instance.remove(key);
    },
  };
}

function createStore(id: string): KeyValueStore {
  if (isExpoGo) return createAsyncBackedStore(id);
  try {
    return createMMKVStore(id);
  } catch {
    return createAsyncBackedStore(id);
  }
}

export const storage = createStore("catdex");
export const cacheStorage = createStore("catdex-cache");
export const queueStorage = createStore("catdex-queue");

export function getJson<T>(store: KeyValueStore, key: string): T | null {
  const raw = store.getString(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setJson(store: KeyValueStore, key: string, value: unknown) {
  store.set(key, JSON.stringify(value));
}
