import Constants from 'expo-constants';
import { Linking, Platform } from 'react-native';

import { recordAnalysisFeedback } from '@/lib/analysisFeedback';
import { getApiCandidateUrls } from '@/lib/apiUrl';
import { getDebugEvents } from '@/lib/debugReportBuffer';
import { SUPPORT_EMAIL } from '@/lib/supportLinks';
import { supabase } from '@/lib/supabase';

export type AnalysisErrorReportPayload = {
  kind: string;
  detail: string;
  createdAt: string;
  platform: string;
  appVersion: string | null;
  apiCandidates: string[];
  session: {
    hasSupabase: boolean;
    userId: string | null;
    email: string | null;
  };
  logs: ReturnType<typeof getDebugEvents>;
};

async function buildReportPayload(input?: {
  errorKind?: string;
  message?: string;
}): Promise<AnalysisErrorReportPayload> {
  const kind = input?.errorKind?.trim() || 'analysis';
  const detail = input?.message?.trim() || 'Impossible d’identifier ce chat';

  let userId: string | null = null;
  let email: string | null = null;
  if (supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      userId = data.session?.user?.id ?? null;
      email = data.session?.user?.email ?? null;
    } catch {
      // ignore
    }
  }

  return {
    kind,
    detail,
    createdAt: new Date().toISOString(),
    platform: Platform.OS,
    appVersion:
      Constants.expoConfig?.version ??
      Constants.nativeAppVersion ??
      null,
    apiCandidates: getApiCandidateUrls(),
    session: {
      hasSupabase: Boolean(supabase),
      userId,
      email,
    },
    logs: getDebugEvents(),
  };
}

async function postReportToApi(
  payload: AnalysisErrorReportPayload,
): Promise<{ emailed: boolean; reason?: string }> {
  const bases = getApiCandidateUrls();
  for (const apiBase of bases) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12_000);
      const response = await fetch(`${apiBase}/report-error`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        emailed?: boolean;
        reason?: string;
      } | null;
      if (response.ok && data?.emailed) {
        return { emailed: true };
      }
      if (response.ok) {
        return { emailed: false, reason: data?.reason ?? 'not emailed' };
      }
    } catch {
      // try next candidate
    }
  }
  return { emailed: false, reason: 'api unreachable' };
}

/** Zero-config fallback: FormSubmit → SUPPORT_EMAIL (first use may need inbox confirm). */
async function postReportViaFormSubmit(
  payload: AnalysisErrorReportPayload,
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(SUPPORT_EMAIL)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          _subject: `CatDex — rapport erreur (${payload.kind})`,
          _template: 'box',
          message: JSON.stringify(payload, null, 2),
        }),
      },
    );
    return response.ok;
  } catch {
    return false;
  }
}

async function openMailtoFallback(payload: AnalysisErrorReportPayload): Promise<void> {
  const subject = encodeURIComponent(`CatDex — rapport erreur (${payload.kind})`);
  const json = JSON.stringify(payload, null, 2);
  // mailto URLs have length limits — keep a compact body.
  const truncated =
    json.length > 1800 ? `${json.slice(0, 1800)}\n…(tronqué)` : json;
  const body = encodeURIComponent(
    ['Rapport CatDex (JSON) :', '', truncated].join('\n'),
  );
  try {
    await Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`);
  } catch {
    // Report may already be queued / emailed.
  }
}

/** Queue feedback + email JSON logs to support (vincentgiacalonepro@gmail.com). */
export async function sendAnalysisErrorReport(input?: {
  errorKind?: string;
  message?: string;
}): Promise<{ queued: boolean; emailed: boolean }> {
  const payload = await buildReportPayload(input);

  const result = await recordAnalysisFeedback({
    predicted: {
      type: `error:${payload.kind}`,
      color: '',
      coat: '',
      pattern: '',
    },
    corrections: [
      {
        field: 'name',
        predicted: payload.detail,
        corrected: '[rapport erreur utilisateur]',
      },
    ],
    confirmed: false,
  });

  let emailed = false;
  const api = await postReportToApi(payload);
  if (api.emailed) {
    emailed = true;
  } else {
    emailed = await postReportViaFormSubmit(payload);
  }

  if (!emailed) {
    await openMailtoFallback(payload);
  }

  return { queued: result.queued, emailed };
}
