/**
 * In-process analytics for CatDex API (survives until process restart).
 * Free Render dynos reset on sleep — pair with Supabase counts for durable product stats.
 */

export type AnalyzeEvent = {
  at: string;
  ok: boolean;
  userId: string;
  latencyMs: number;
  error?: string;
  imageBytes?: number;
  model?: string;
};

const MAX_RECENT = 200;

type StatsState = {
  startedAt: string;
  analyzeTotal: number;
  analyzeOk: number;
  analyzeErrors: number;
  latencySumMs: number;
  recent: AnalyzeEvent[];
};

const state: StatsState = {
  startedAt: new Date().toISOString(),
  analyzeTotal: 0,
  analyzeOk: 0,
  analyzeErrors: 0,
  latencySumMs: 0,
  recent: [],
};

export function recordAnalyzeEvent(event: Omit<AnalyzeEvent, 'at'> & { at?: string }) {
  const full: AnalyzeEvent = {
    at: event.at ?? new Date().toISOString(),
    ok: event.ok,
    userId: event.userId,
    latencyMs: event.latencyMs,
    error: event.error,
    imageBytes: event.imageBytes,
    model: event.model,
  };

  state.analyzeTotal += 1;
  if (full.ok) state.analyzeOk += 1;
  else state.analyzeErrors += 1;
  state.latencySumMs += Math.max(0, full.latencyMs);
  state.recent.unshift(full);
  if (state.recent.length > MAX_RECENT) {
    state.recent.length = MAX_RECENT;
  }
}

function countSince(isoCutoff: string): { ok: number; errors: number } {
  const cutoff = Date.parse(isoCutoff);
  let ok = 0;
  let errors = 0;
  for (const event of state.recent) {
    if (Date.parse(event.at) < cutoff) break;
    if (event.ok) ok += 1;
    else errors += 1;
  }
  return { ok, errors };
}

export function getRuntimeAnalyzeStats() {
  const last24hCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const last24h = countSince(last24hCutoff);
  const avgLatencyMs =
    state.analyzeTotal > 0
      ? Math.round(state.latencySumMs / state.analyzeTotal)
      : null;

  return {
    processStartedAt: state.startedAt,
    total: state.analyzeTotal,
    ok: state.analyzeOk,
    errors: state.analyzeErrors,
    avgLatencyMs,
    last24h,
    recent: state.recent.slice(0, 40),
  };
}
