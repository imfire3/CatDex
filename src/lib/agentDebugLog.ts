import { pushDebugEvent } from '@/lib/debugReportBuffer';

const INGEST_URL =
  'http://127.0.0.1:7682/ingest/9b913ab7-b762-4a30-bdb2-224f561a8f0a';
const SESSION_ID = 'b20bd9';

/** Local ingest (Cursor debug) + in-app buffer for “Envoyer le rapport”. */
export function agentDebugLog(input: {
  hypothesisId: string;
  location: string;
  message: string;
  data?: Record<string, unknown>;
  runId?: string;
}): void {
  const timestamp = Date.now();
  pushDebugEvent({
    ts: timestamp,
    location: input.location,
    message: input.message,
    hypothesisId: input.hypothesisId,
    data: input.data,
  });

  // #region agent log
  fetch(INGEST_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': SESSION_ID,
    },
    body: JSON.stringify({
      sessionId: SESSION_ID,
      runId: input.runId ?? 'pre-fix',
      hypothesisId: input.hypothesisId,
      location: input.location,
      message: input.message,
      data: input.data ?? {},
      timestamp,
    }),
  }).catch(() => {});
  // #endregion
}
