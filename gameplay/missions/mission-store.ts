import { getJson, setJson, storage } from "@/lib/storage/mmkv";
import type { MissionProgress } from "@/gameplay/types";
import { DAILY_MISSIONS, WEEKLY_MISSIONS } from "@/gameplay/missions/mission-definitions";
import { getCurrentSeason } from "@/gameplay/seasons/season-config";

const MISSIONS_KEY = "mission_progress";
const SEASON_KEY = "season_progress";
const SOCIAL_KEY = "social_local";

type MissionStore = {
  daily: MissionProgress[];
  weekly: MissionProgress[];
  lastDailyReset: string;
  lastWeeklyReset: string;
};

type SeasonStore = {
  seasonId: string;
  current: number;
  completed: boolean;
};

type SocialStore = {
  likes: Record<string, boolean>;
  comments: Record<string, { id: string; user: string; text: string; date: string }[]>;
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

function initProgress(ids: string[]): MissionProgress[] {
  return ids.map((id) => ({ missionId: id, current: 0, completed: false, claimed: false }));
}

export const missionStore = {
  getStore(): MissionStore {
    const store = getJson<MissionStore>(storage, MISSIONS_KEY);
    const dailyIds = DAILY_MISSIONS.map((m) => m.id);
    const weeklyIds = WEEKLY_MISSIONS.map((m) => m.id);

    if (!store || store.lastDailyReset !== todayKey()) {
      return {
        daily: initProgress(dailyIds),
        weekly: store?.lastWeeklyReset === weekKey() ? store.weekly : initProgress(weeklyIds),
        lastDailyReset: todayKey(),
        lastWeeklyReset: store?.lastWeeklyReset === weekKey() ? store.lastWeeklyReset : weekKey(),
      };
    }
    return store;
  },

  saveStore(store: MissionStore) {
    setJson(storage, MISSIONS_KEY, store);
  },

  increment(metric: string, amount = 1) {
    const store = missionStore.getStore();
    const all = [...DAILY_MISSIONS, ...WEEKLY_MISSIONS];
    const updateList = (list: MissionProgress[]) =>
      list.map((p) => {
        const def = all.find((m) => m.id === p.missionId);
        if (!def || def.metric !== metric || p.completed) return p;
        const current = p.current + amount;
        return { ...p, current, completed: current >= def.target };
      });

    store.daily = updateList(store.daily);
    store.weekly = updateList(store.weekly);
    missionStore.saveStore(store);
    return store;
  },

  claimMission(missionId: string): { xp: number; claimed: boolean } {
    const store = missionStore.getStore();
    const all = [...DAILY_MISSIONS, ...WEEKLY_MISSIONS];
    const def = all.find((m) => m.id === missionId);
    if (!def) return { xp: 0, claimed: false };

    const updateList = (list: MissionProgress[]) =>
      list.map((p) => {
        if (p.missionId !== missionId || !p.completed || p.claimed) return p;
        return { ...p, claimed: true };
      });

    const before = [...store.daily, ...store.weekly].find((p) => p.missionId === missionId);
    if (!before?.completed || before.claimed) return { xp: 0, claimed: false };

    store.daily = updateList(store.daily);
    store.weekly = updateList(store.weekly);
    missionStore.saveStore(store);
    return { xp: def.xpReward, claimed: true };
  },

  unclaimedCount(): number {
    const store = missionStore.getStore();
    return [...store.daily, ...store.weekly].filter((p) => p.completed && !p.claimed).length;
  },
};

export const seasonStore = {
  getProgress(): SeasonStore {
    const season = getCurrentSeason();
    const stored = getJson<SeasonStore>(storage, SEASON_KEY);
    if (!stored || stored.seasonId !== season.id) {
      return { seasonId: season.id, current: 0, completed: false };
    }
    return stored;
  },

  increment(amount = 1) {
    const season = getCurrentSeason();
    const progress = seasonStore.getProgress();
    const current = progress.current + amount;
    const next = {
      seasonId: season.id,
      current,
      completed: current >= season.target,
    };
    setJson(storage, SEASON_KEY, next);
    return next;
  },
};

export const socialStore = {
  get(): SocialStore {
    return getJson<SocialStore>(storage, SOCIAL_KEY) ?? { likes: {}, comments: {} };
  },

  toggleLike(catId: string) {
    const data = socialStore.get();
    data.likes[catId] = !data.likes[catId];
    setJson(storage, SOCIAL_KEY, data);
    return data.likes[catId];
  },

  addComment(catId: string, user: string, text: string) {
    const data = socialStore.get();
    const list = data.comments[catId] ?? [];
    list.unshift({
      id: `${Date.now()}`,
      user,
      text,
      date: new Date().toLocaleDateString("fr-FR"),
    });
    data.comments[catId] = list.slice(0, 50);
    setJson(storage, SOCIAL_KEY, data);
    return list;
  },

  getComments(catId: string) {
    return socialStore.get().comments[catId] ?? [];
  },

  isLiked(catId: string) {
    return Boolean(socialStore.get().likes[catId]);
  },
};
