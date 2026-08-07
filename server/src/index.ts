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
  isProductionRuntime,
  verifySupabaseAccessToken,
} from './analyzeAuth';
import {
  CATDEX_VISION_PROMPT,
  CATDEX_VISION_USER_TEXT,
} from './catdexVisionPrompt';
import { CATDEX_ANALYSIS_RESPONSE_FORMAT } from './catdexAnalysisSchema';
import {
  NOT_A_CAT_MESSAGE,
  NOT_A_CAT_TITLE,
  normalizeAnalysis,
  type VisionJson,
} from './normalizeVisionAnalysis';

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

app.get('/health', (c) => c.json({ ok: true, service: 'catdex-api' }));

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
  const body = await c.req.json().catch(() => null);
  const parsed = analyzeSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Payload invalide' }, 400);
  }

  let { imageBase64, mimeType } = stripDataUrl(parsed.data.imageBase64, parsed.data.mimeType);

  if (!isAllowedMime(mimeType)) {
    return c.json(
      {
        error: 'Format image non supporté. Utilise JPEG, PNG ou WebP.',
      },
      400,
    );
  }

  const decodedBytes = estimateDecodedBytes(imageBase64);
  if (decodedBytes > getAnalyzeMaxBytes()) {
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
      response_format: CATDEX_ANALYSIS_RESPONSE_FORMAT,
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
                detail: 'high',
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
    console.log('[analyze-cat] Vision raw JSON', raw);
    const json = JSON.parse(raw) as VisionJson;
    const analysis = normalizeAnalysis(json);
    console.log('[analyze-cat] Mapped analysis', {
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
