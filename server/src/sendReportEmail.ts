type ReportEmailResult =
  | { ok: true; id: string }
  | { ok: false; reason: string };

const DEFAULT_TO = 'vincentgiacalonepro@gmail.com';

/**
 * Send a plain-text / JSON error report via Resend (optional RESEND_API_KEY).
 * https://resend.com/docs/api-reference/emails/send-email
 */
export async function sendReportEmail(input: {
  subject: string;
  text: string;
  to?: string;
}): Promise<ReportEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, reason: 'RESEND_API_KEY manquant' };
  }

  const to = (input.to ?? process.env.REPORT_EMAIL_TO ?? DEFAULT_TO).trim();
  const from =
    process.env.RESEND_FROM?.trim() ||
    'CatDex Reports <onboarding@resend.dev>';

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: input.subject.slice(0, 200),
        text: input.text.slice(0, 100_000),
      }),
    });

    const body = (await response.json().catch(() => null)) as {
      id?: string;
      message?: string;
      name?: string;
    } | null;

    if (!response.ok) {
      return {
        ok: false,
        reason:
          body?.message ||
          body?.name ||
          `Resend HTTP ${response.status}`,
      };
    }

    return { ok: true, id: body?.id ?? 'sent' };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : 'fetch failed',
    };
  }
}
