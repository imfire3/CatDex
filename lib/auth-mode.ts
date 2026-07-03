import { getJson, setJson, storage } from "@/lib/storage/mmkv";
import type { Session } from "@supabase/supabase-js";

const AUTH_MODE_KEY = "auth_mode";

type AuthModeState = {
  guest: boolean;
};

export const authModeStore = {
  isGuest() {
    return getJson<AuthModeState>(storage, AUTH_MODE_KEY)?.guest ?? false;
  },

  setGuest(value: boolean) {
    setJson(storage, AUTH_MODE_KEY, { guest: value });
  },

  clear() {
    storage.remove(AUTH_MODE_KEY);
  },
};

export function isAnonymousSession(session: Session | null) {
  return Boolean(session?.user?.is_anonymous);
}

export function isAuthenticatedSession(session: Session | null) {
  if (!session) return false;
  if (isAnonymousSession(session)) return authModeStore.isGuest();
  return true;
}
