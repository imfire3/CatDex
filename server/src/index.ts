import 'dotenv/config';

import { serve } from '@hono/node-server';
import { removeBackground } from '@imgly/background-removal-node';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import OpenAI from 'openai';
import { z } from 'zod';

import {
  allowUnauthAnalyze,
  consumeRateLimit,
  estimateDecodedBytes,
  extractBearerToken,
  getAnalyzeMaxBytes,
  isAllowedMime,
  verifySupabaseAccessToken,
} from './analyzeAuth';
import {
  CATDEX_VISION_PROMPT,
  CATDEX_VISION_USER_TEXT,
} from './catdexVisionPrompt';
import { CATDEX_FORM_RESPONSE_FORMAT } from './catdexFormSchema';
import { deleteAccountForBearerToken } from './deleteAccount';
import {
  NOT_A_CAT_MESSAGE,
  NOT_A_CAT_TITLE,
  normalizeAnalysis,
  type VisionJson,
} from './normalizeVisionAnalysis';
import { renderAdminDashboardHtml } from './adminDashboard';
import { sendReportEmail } from './sendReportEmail';
import { getRuntimeAnalyzeStats, recordAnalyzeEvent } from './statsStore';
import { fetchSupabaseProductStats } from './supabaseProductStats';

const app = new Hono<{
  Variables: {
    analyzeUserId: string;
  };
}>();
const port = Number(process.env.PORT ?? 8787);

app.use(
  '*',
  cors({
    origin: '*',
  }),
);

app.get('/health', (c) =>
  c.json({
    ok: true,
    service: 'catdex-api',
    version: 'analyze-auth-v3',
    allowUnauthAnalyze: allowUnauthAnalyze(),
  }),
);

function getAdminStatsSecret(): string | null {
  return process.env.ADMIN_STATS_SECRET?.trim() || null;
}

function isAdminAuthorized(c: { req: { header: (name: string) => string | undefined; query: (name: string) => string | undefined } }): boolean {
  const secret = getAdminStatsSecret();
  if (!secret) return false;
  const header = c.req.header('x-admin-secret')?.trim();
  const query = c.req.query('key')?.trim();
  return header === secret || query === secret;
}

/** JSON stats for operators (ADMIN_STATS_SECRET required). */
app.get('/admin/stats', async (c) => {
  if (!isAdminAuthorized(c)) {
    return c.json(
      {
        error:
          'Non autorisé. Configure ADMIN_STATS_SECRET et passe ?key=… ou le header x-admin-secret.',
      },
      401,
    );
  }

  const [product, analyze] = await Promise.all([
    fetchSupabaseProductStats(),
    Promise.resolve(getRuntimeAnalyzeStats()),
  ]);

  return c.json({
    ok: true,
    generatedAt: new Date().toISOString(),
    product,
    analyze,
  });
});

/** HTML dashboard — open in browser with ?key=ADMIN_STATS_SECRET */
app.get('/admin', async (c) => {
  if (!isAdminAuthorized(c)) {
    return c.html(
      `<!DOCTYPE html><html lang="fr"><body style="font-family:system-ui;padding:24px">
        <h1>CatDex · Stats</h1>
        <p>Accès refusé. Ajoute <code>?key=TON_ADMIN_STATS_SECRET</code> à l’URL
        (secret défini sur Render / <code>server/.env</code>).</p>
      </body></html>`,
      401,
    );
  }

  const [product, analyze] = await Promise.all([
    fetchSupabaseProductStats(),
    Promise.resolve(getRuntimeAnalyzeStats()),
  ]);

  return c.html(
    renderAdminDashboardHtml({
      generatedAt: new Date().toISOString(),
      product,
      analyze,
    }),
  );
});

/** Apple Guideline 5.1.1(v) — in-app account deletion. */
app.delete('/account', async (c) => {
  const result = await deleteAccountForBearerToken(c.req.header('authorization'));
  if (!result.ok) {
    return c.json({ error: result.error }, result.status as 401 | 502 | 503);
  }
  return c.json({ ok: true });
});

const reportErrorSchema = z.object({
  kind: z.string().max(80).optional(),
  detail: z.string().max(2000).optional(),
  createdAt: z.string().max(64).optional(),
  platform: z.string().max(32).optional(),
  appVersion: z.string().max(64).nullable().optional(),
  apiCandidates: z.array(z.string().max(200)).max(8).optional(),
  session: z
    .object({
      hasSupabase: z.boolean().optional(),
      userId: z.string().max(128).nullable().optional(),
      email: z.string().max(320).nullable().optional(),
    })
    .optional(),
  logs: z
    .array(
      z.object({
        ts: z.number().optional(),
        location: z.string().max(200).optional(),
        message: z.string().max(400).optional(),
        hypothesisId: z.string().max(40).optional(),
        data: z.record(z.string(), z.unknown()).optional(),
      }),
    )
    .max(64)
    .optional(),
});

/** Client “Envoyer le rapport” — emails JSON logs to REPORT_EMAIL_TO / Resend. */
app.post('/report-error', async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: 'JSON invalide' }, 400);
  }

  const parsed = reportErrorSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: 'Payload invalide' }, 400);
  }

  const payload = parsed.data;
  const kind = payload.kind?.trim() || 'analysis';
  const subject = `CatDex — rapport erreur (${kind})`;
  const text = JSON.stringify(payload, null, 2);

  console.info('[report-error]', {
    kind,
    platform: payload.platform,
    logCount: payload.logs?.length ?? 0,
    userId: payload.session?.userId ?? null,
  });

  const emailed = await sendReportEmail({ subject, text });
  if (!emailed.ok) {
    return c.json({
      ok: true,
      emailed: false,
      reason: emailed.reason,
    });
  }

  return c.json({ ok: true, emailed: true, id: emailed.id });
});

/** Require Supabase JWT (prod) + rate-limit per user. */
app.use('/analyze-cat', async (c, next) => {
  const token = extractBearerToken(c.req.header('authorization'));
  let userId: string | null = null;

  if (token) {
    const user = await verifySupabaseAccessToken(token);
    userId = user?.id ?? null;
  }

  if (!userId) {
    if (allowUnauthAnalyze()) {
      userId = 'dev-unauth';
    } else {
      return c.json(
        {
          error:
            'Non autorisé. Connecte-toi pour analyser une photo.',
        },
        401,
      );
    }
  }

  const quota = consumeRateLimit(userId);
  c.header('X-RateLimit-Limit', String(process.env.ANALYZE_RATE_LIMIT ?? 20));
  c.header('X-RateLimit-Remaining', String(quota.remaining));
  c.header('X-RateLimit-Reset', String(Math.ceil(quota.resetAt / 1000)));

  if (!quota.ok) {
    return c.json(
      {
        error: 'Trop de demandes. Réessaie dans une heure.',
      },
      429,
    );
  }

  c.set('analyzeUserId', userId);
  await next();
});

const analyzeSchema = z.object({
  imageBase64: z.string().min(32),
  mimeType: z.string().default('image/jpeg'),
});

function stripDataUrl(imageBase64: string, mimeType: string) {
  const dataUrl = /^data:([^;]+);base64,(.+)$/s.exec(imageBase64);
  if (!dataUrl) return { imageBase64, mimeType };
  return {
    mimeType: dataUrl[1] || mimeType,
    imageBase64: dataUrl[2],
  };
}

function keyLooksPlaceholder(apiKey?: string | null): boolean {
  const key = apiKey?.trim();
  return (
    !key ||
    /your[-_]?key|sk-your|changeme|example/i.test(key) ||
    key.length < 20
  );
}

const CUTOUT_BUDGET_MS = Number(process.env.CUTOUT_BUDGET_MS ?? 1200);
const SKIP_CUTOUT = process.env.SKIP_CUTOUT === '1' || process.env.SKIP_CUTOUT === 'true';

async function cutoutCatPng(imageBase64: string, mimeType: string): Promise<string | null> {
  try {
    const input = Buffer.from(imageBase64, 'base64');
    const blob = await removeBackground(new Blob([input], { type: mimeType }), {
      model: 'small',
      output: { format: 'image/png', quality: 0.85, type: 'foreground' },
    });
    const buffer = Buffer.from(await blob.arrayBuffer());
    return buffer.toString('base64');
  } catch (error) {
    console.error('[cutout]', error);
    return null;
  }
}

/** Never block analysis on rembg — drop cutout if it exceeds the budget. */
async function cutoutWithinBudget(
  imageBase64: string,
  mimeType: string,
): Promise<string | null> {
  if (SKIP_CUTOUT || CUTOUT_BUDGET_MS <= 0) return null;

  return Promise.race([
    cutoutCatPng(imageBase64, mimeType),
    new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), CUTOUT_BUDGET_MS);
    }),
  ]);
}

app.post('/analyze-cat', async (c) => {
  const started = Date.now();
  const userId = c.get('analyzeUserId') || 'unknown';
  const body = await c.req.json().catch(() => null);
  const parsed = analyzeSchema.safeParse(body);

  if (!parsed.success) {
    recordAnalyzeEvent({
      ok: false,
      userId,
      latencyMs: Date.now() - started,
      error: 'Payload invalide',
    });
    return c.json({ error: 'Payload invalide' }, 400);
  }

  let { imageBase64, mimeType } = stripDataUrl(parsed.data.imageBase64, parsed.data.mimeType);

  if (!isAllowedMime(mimeType)) {
    recordAnalyzeEvent({
      ok: false,
      userId,
      latencyMs: Date.now() - started,
      error: 'Format image non supporté',
    });
    return c.json(
      {
        error: 'Format image non supporté. Utilise JPEG, PNG ou WebP.',
      },
      400,
    );
  }

  const decodedBytes = estimateDecodedBytes(imageBase64);
  if (decodedBytes > getAnalyzeMaxBytes()) {
    recordAnalyzeEvent({
      ok: false,
      userId,
      latencyMs: Date.now() - started,
      error: 'Image trop lourde',
      imageBytes: decodedBytes,
    });
    return c.json(
      {
        error: 'Image trop lourde. Compresse la photo et réessaie.',
      },
      413,
    );
  }

  const normalizedMime = mimeType.toLowerCase();
  if (
    normalizedMime.includes('heic') ||
    normalizedMime.includes('heif') ||
    normalizedMime.includes('tiff')
  ) {
    recordAnalyzeEvent({
      ok: false,
      userId,
      latencyMs: Date.now() - started,
      error: 'Format image non supporté',
      imageBytes: decodedBytes,
    });
    return c.json(
      {
        error: 'Format image non supporté. Utilise JPEG, PNG ou WebP.',
      },
      400,
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;

  // Mock path DISABLED — form must never be filled with invented data.
  if (keyLooksPlaceholder(apiKey)) {
    console.error('[analyze-cat] OPENAI_API_KEY missing or placeholder');
    recordAnalyzeEvent({
      ok: false,
      userId,
      latencyMs: Date.now() - started,
      error: 'OPENAI_API_KEY missing',
      imageBytes: decodedBytes,
    });
    return c.json(
      {
        error:
          'Service d’analyse indisponible. Configure OPENAI_API_KEY pour analyser les photos.',
        mocked: false,
      },
      503,
    );
  }

  const openai = new OpenAI({ apiKey: apiKey!.trim() });
  const model = process.env.OPENAI_MODEL ?? 'gpt-4o';

  try {
    console.log('[analyze-cat] Vision request', {
      model,
      mimeType,
      imageBytes: estimateDecodedBytes(imageBase64),
      imageBase64Prefix: imageBase64.slice(0, 48),
      promptChars: CATDEX_VISION_PROMPT.length,
      userText: CATDEX_VISION_USER_TEXT,
    });

    const cutoutPromise = cutoutWithinBudget(imageBase64, mimeType);
    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.2,
      max_tokens: 1400,
      response_format: CATDEX_FORM_RESPONSE_FORMAT,
      messages: [
        {
          role: 'system',
          content: CATDEX_VISION_PROMPT,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: CATDEX_VISION_USER_TEXT,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
                // low = faster / cheaper; enough for coat / color / breed heuristics
                detail: 'low',
              },
            },
          ],
        },
      ],
    });

    const cutoutBase64 = await Promise.race([
      cutoutPromise,
      Promise.resolve(null as string | null),
    ]);

    const raw = completion.choices[0]?.message?.content ?? '{}';
    console.log('[CATDEX ANALYSIS] Raw OpenAI response:', raw);
    const json = JSON.parse(raw) as VisionJson;
    console.log('[CATDEX ANALYSIS] Parsed response:', {
      isCat: json.isCat,
      name: json.name,
      breed: json.breed,
      breedConfidence: json.breedConfidence,
      coatColor: json.coatColor,
      furLength: json.furLength,
      distinctiveFeatures: json.distinctiveFeatures,
      personalityTraits: json.personalityTraits,
      description: json.description?.slice(0, 160),
    });
    const analysis = normalizeAnalysis(json);
    console.log('[CATDEX ANALYSIS] API response (after normalization):', {
      suggestedName: analysis.suggestedName,
      breed: analysis.breed,
      color: analysis.color,
      coat: analysis.coat,
      tags: analysis.tags,
      distinctiveFeatures: analysis.distinctiveFeatures,
      description: analysis.description?.slice(0, 160),
      confidence: analysis.confidence,
      notACat: analysis.notACat,
    });

    recordAnalyzeEvent({
      ok: true,
      userId,
      latencyMs: Date.now() - started,
      imageBytes: decodedBytes,
      model,
    });

    return c.json({
      analysis,
      mocked: false,
      cutoutBase64: cutoutBase64 ?? undefined,
      cutoutMimeType: cutoutBase64 ? 'image/png' : undefined,
      ...(analysis.notACat
        ? {
            error: analysis.errorCode ?? 'NOT_A_CAT',
            visionError: {
              code: analysis.errorCode ?? 'NOT_A_CAT',
              title: analysis.errorTitle ?? NOT_A_CAT_TITLE,
              message: analysis.errorMessage ?? NOT_A_CAT_MESSAGE,
            },
          }
        : {}),
    });
  } catch (error) {
    console.error('[analyze-cat] OpenAI failure — no mock fill', error);
    recordAnalyzeEvent({
      ok: false,
      userId,
      latencyMs: Date.now() - started,
      error: 'OpenAI failure',
      imageBytes: decodedBytes,
      model,
    });
    return c.json(
      {
        error: 'Échec analyse OpenAI. Réessaie avec une photo plus nette.',
        mocked: false,
      },
      502,
    );
  }
});

serve({ fetch: app.fetch, port, hostname: '0.0.0.0' }, () => {
  console.log(`CatDex API ready on http://0.0.0.0:${port}`);
});
