import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '@/lib/supabase';
import type { AnalysisFieldCorrection } from '@/types/cat';

const QUEUE_KEY = '@catdex/analysis-feedback-queue';

export type AnalysisFeedbackPayload = {
  catId?: string;
  predicted: {
    type: string;
    color: string;
    coat: string;
    pattern: string;
  };
  corrections: AnalysisFieldCorrection[];
  confirmed: boolean;
  createdAt: string;
};

async function readQueue(): Promise<AnalysisFeedbackPayload[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AnalysisFeedbackPayload[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeQueue(items: AnalysisFeedbackPayload[]) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(items));
}

/** Persist labeled corrections for the future CatDex vision model. */
export async function recordAnalysisFeedback(
  payload: Omit<AnalysisFeedbackPayload, 'createdAt'> & { createdAt?: string },
) {
  const entry: AnalysisFeedbackPayload = {
    ...payload,
    createdAt: payload.createdAt ?? new Date().toISOString(),
  };

  if (supabase) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error } = await supabase.from('analysis_feedback').insert({
        user_id: user?.id ?? null,
        cat_id: payload.catId ?? null,
        predicted: payload.predicted,
        corrections: payload.corrections,
        confirmed: payload.confirmed,
      });
      if (!error) return { queued: false as const };
    } catch {
      // Fall through to local queue.
    }
  }

  const queue = await readQueue();
  await writeQueue([...queue, entry].slice(-200));
  return { queued: true as const };
}

export async function flushAnalysisFeedbackQueue() {
  if (!supabase) return { flushed: 0 };

  const queue = await readQueue();
  if (queue.length === 0) return { flushed: 0 };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let flushed = 0;
  const remaining: AnalysisFeedbackPayload[] = [];

  for (const item of queue) {
    const { error } = await supabase.from('analysis_feedback').insert({
      user_id: user?.id ?? null,
      cat_id: item.catId ?? null,
      predicted: item.predicted,
      corrections: item.corrections,
      confirmed: item.confirmed,
      created_at: item.createdAt,
    });
    if (error) remaining.push(item);
    else flushed += 1;
  }

  await writeQueue(remaining);
  return { flushed };
}
