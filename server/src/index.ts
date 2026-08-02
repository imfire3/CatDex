import { config as loadEnv } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import OpenAI from 'openai';
import { z } from 'zod';

import {
  CAT_ANALYSIS_SYSTEM_PROMPT,
  CAT_ANALYSIS_USER_PROMPT,
} from './prompt.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.join(__dirname, '../.env') });

const app = new Hono();
const port = Number(process.env.PORT ?? 8787);

function openaiApiKey() {
  const key = process.env.OPENAI_API_KEY?.trim() ?? '';
  if (!key || key === 'sk-your-key-here') return '';
  return key;
}

function openaiModel() {
  return process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini';
}

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
    openaiConfigured: Boolean(openaiApiKey()),
    model: openaiModel(),
  }),
);

const analyzeSchema = z.object({
  imageBase64: z.string().min(32),
  mimeType: z.string().default('image/jpeg'),
});

const fallbackAnalysis = {
  color: 'Noir',
  breed: 'Européen',
  coat: 'Court',
  description:
    'Un chat noir élégant avec des yeux ambre perçants. Observé près d’un café en fin d’après-midi.',
  suggestedName: 'Nori',
  gender: 'male' as const,
  eyes: 'Ambre',
  size: 'Moyenne',
  tags: ['Ombre', 'Mystère'],
};

type AnalysisJson = {
  color?: string;
  breed?: string;
  coat?: string;
  description?: string;
  suggestedName?: string;
  gender?: string;
  eyes?: string;
  size?: string;
  tags?: string[] | string;
};

function normalizeGender(value?: string) {
  const v = value?.trim().toLowerCase();
  if (v === 'male' || v === 'm' || v === 'mâle') return 'male' as const;
  if (v === 'female' || v === 'f' || v === 'femelle') return 'female' as const;
  return 'unknown' as const;
}

function normalizeTags(tags?: string[] | string) {
  if (Array.isArray(tags)) {
    return tags.map((t) => String(t).trim()).filter(Boolean).slice(0, 2);
  }
  if (typeof tags === 'string' && tags.trim()) {
    return tags
      .split(/[,;/]/)
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 2);
  }
  return undefined;
}

function normalizeAnalysis(json: AnalysisJson) {
  return {
    color: json.color?.trim() || 'Inconnue',
    breed: json.breed?.trim() || 'Indéterminée',
    coat: json.coat?.trim() || 'Indéterminée',
    description: json.description?.trim() || 'Chat découvert dans la rue.',
    suggestedName: json.suggestedName?.trim() || undefined,
    gender: normalizeGender(json.gender),
    eyes: json.eyes?.trim() || undefined,
    size: json.size?.trim() || undefined,
    tags: normalizeTags(json.tags),
  };
}

app.post('/analyze-cat', async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = analyzeSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Payload invalide' }, 400);
  }

  const apiKey = openaiApiKey();
  if (!apiKey) {
    console.warn('[analyze-cat] OPENAI_API_KEY manquante — réponse mock');
    return c.json({ analysis: fallbackAnalysis, mocked: true });
  }

  const openai = new OpenAI({ apiKey });
  const { imageBase64, mimeType } = parsed.data;
  const dataUrl = `data:${mimeType};base64,${imageBase64}`;

  try {
    const completion = await openai.chat.completions.create({
      model: openaiModel(),
      response_format: { type: 'json_object' },
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content: CAT_ANALYSIS_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: CAT_ANALYSIS_USER_PROMPT,
            },
            {
              type: 'image_url',
              image_url: {
                url: dataUrl,
                detail: 'high',
              },
            },
          ],
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    const json = JSON.parse(raw) as AnalysisJson;

    return c.json({
      analysis: normalizeAnalysis(json),
      mocked: false,
      model: openaiModel(),
    });
  } catch (error) {
    console.error('[analyze-cat]', error);
    return c.json(
      {
        error: 'Échec analyse OpenAI',
        analysis: fallbackAnalysis,
        mocked: true,
      },
      502,
    );
  }
});

serve({ fetch: app.fetch, port, hostname: '0.0.0.0' }, () => {
  const configured = Boolean(openaiApiKey());
  console.log(`CatDex API ready on http://0.0.0.0:${port}`);
  console.log(
    configured
      ? `OpenAI Vision ON · model=${openaiModel()}`
      : 'OpenAI Vision OFF · set OPENAI_API_KEY in server/.env (mock mode)',
  );
});
