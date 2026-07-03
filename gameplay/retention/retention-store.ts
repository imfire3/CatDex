import { getJson, setJson, storage } from "@/lib/storage/mmkv";

const RETENTION_KEY = "retention_state";

export type RetentionState = {
  dailyBonusClaimedDate: string | null;
  dailyBonusPromptDismissedDate: string | null;
  streakFreezeUsedWeek: string | null;
  firstDiscoveryDate: string | null;
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function weekKey() {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
}

function read(): RetentionState {
  return (
    getJson<RetentionState>(storage, RETENTION_KEY) ?? {
      dailyBonusClaimedDate: null,
      dailyBonusPromptDismissedDate: null,
      streakFreezeUsedWeek: null,
      firstDiscoveryDate: null,
    }
  );
}

function write(state: RetentionState) {
  setJson(storage, RETENTION_KEY, state);
}

export const retentionStore = {
  canClaimDailyBonus() {
    return read().dailyBonusClaimedDate !== todayKey();
  },

  claimDailyBonus() {
    const state = read();
    state.dailyBonusClaimedDate = todayKey();
    write(state);
  },

  shouldShowDailyBonusPrompt() {
    return read().dailyBonusPromptDismissedDate !== todayKey();
  },

  dismissDailyBonusPrompt() {
    const state = read();
    state.dailyBonusPromptDismissedDate = todayKey();
    write(state);
  },

  isFirstDiscoveryToday() {
    return read().firstDiscoveryDate !== todayKey();
  },

  markFirstDiscoveryToday() {
    const state = read();
    state.firstDiscoveryDate = todayKey();
    write(state);
  },

  canUseStreakFreeze() {
    const state = read();
    return state.streakFreezeUsedWeek !== weekKey();
  },

  useStreakFreeze() {
    const state = read();
    state.streakFreezeUsedWeek = weekKey();
    write(state);
  },
};
