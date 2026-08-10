/** In-memory ring buffer of recent debug events for error reports. */

export type DebugReportEvent = {
  ts: number;
  location: string;
  message: string;
  hypothesisId?: string;
  data?: Record<string, unknown>;
};

const MAX_EVENTS = 48;
let events: DebugReportEvent[] = [];

export function pushDebugEvent(
  event: Omit<DebugReportEvent, 'ts'> & { ts?: number },
): void {
  const next: DebugReportEvent = {
    ts: event.ts ?? Date.now(),
    location: event.location,
    message: event.message,
    ...(event.hypothesisId ? { hypothesisId: event.hypothesisId } : {}),
    ...(event.data ? { data: event.data } : {}),
  };
  events = [...events, next].slice(-MAX_EVENTS);
}

export function getDebugEvents(): DebugReportEvent[] {
  return [...events];
}

export function clearDebugEvents(): void {
  events = [];
}
