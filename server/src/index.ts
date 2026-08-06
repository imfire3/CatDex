import 'dotenv/config';

import { serve } from '@hono/node-server';
import { removeBackground } from '@imgly/background-removal-node';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import OpenAI from 'openai';
import { z } from 'zod';

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

const app = new Hono();
const port = Number(process.env.PORT ?? 8787);
const apiSecret = process.env.API_SECRET?.trim();

app.use(
  '*',
  cors({
    origin: '*',
  }),
);

app.get('/health', (c) => c.json({ ok: true, service: 'catdex-api' }));

/** Lightweight shared-secret gate for /analyze-cat (optional in local dev). */
app.use('/analyze-cat', async (c, next) => {
  if (!apiSecret) {
    await next();
    return;
  }

  const header =
    c.req.header('x-api-key')?.trim() ||
    c.req.header('authorization')?.replace(/^Bearer\s+/i, '').trim();

  if (header !== apiSecret) {
    return c.json({ error: 'Non autorisé' }, 401);
  }

  await next();
});

const analyzeSchema = z.object({
  imageBase64: z.string().min(32),
  mimeType: z.string().default('image/jpeg'),
});

const COLORS = [
  'Noir',
  'Roux',
  'Roux tigré',
  'Gris',
  'Gris tigré',
  'Blanc',
  'Écaille de tortue',
  'Bicolore',
  'Crème',
  'Siamois',
] as const;

const BREEDS = [
  'Européen',
  'Chartreux',
  'Siamois',
  'Maine Coon',
  'Persan',
  'British Shorthair',
  'Bengal',
  'Ragdoll',
  'Norvégien',
  'Sphynx',
] as const;

const COATS = ['Court', 'Mi-long', 'Long', 'Bouclé'] as const;
const EYES = ['Ambre', 'Verts', 'Bleus', 'Dorés', 'Noisette', 'Cuivre'] as const;
const SIZES = ['Petite', 'Moyenne', 'Grande'] as const;
const GENDERS = ['male', 'female', 'unknown'] as const;
const NAMES = [
  'Nori',
  'Caramel',
  'Mistral',
  'Suki',
  'Olive',
  'Pixel',
  'Moka',
  'Luna',
  'Tigrou',
  'Cendre',
  'Wasabi',
  'Praline',
  'Ziggy',
  'Félix',
  'Mina',
  'Gus',
  'Nala',
  'Biscuit',
  'Shadow',
  'Pêche',
] as const;
const TAG_SETS = [
  ['Ombre', 'Mystère', 'Discret'],
  ['Soleil', 'Curieux', 'Vif'],
  ['Velours', 'Doux', 'Câlin'],
  ['Éclair', 'Audacieux', 'Joueur'],
  ['Nuit', 'Furtif', 'Calme'],
  ['Miel', 'Gourmand', 'Affectueux'],
  ['Brume', 'Poète', 'Observateur'],
  ['Flamme', 'Têtu', 'Explorateur'],
] as const;

function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function pick<T>(items: readonly T[], seed: number, salt: number): T {
  return items[(seed + salt * 97) % items.length]!;
}

/** Varied mock analysis when OpenAI is unavailable — always has breed/color/name/traits. */
function buildFallbackAnalysis(seedInput: string) {
  const seed = hashSeed(seedInput || 'fallback');
  const color = pick(COLORS, seed, 1);
  const breed = pick(BREEDS, seed, 2);
  const coat = pick(COATS, seed, 3);
  const eyes = pick(EYES, seed, 4);
  const size = pick(SIZES, seed, 5);
  const gender = pick(GENDERS, seed, 6);
  const suggestedName = pick(NAMES, seed, 7);
  const tags = [...pick(TAG_SETS, seed, 8)];
  return {
    color,
    breed,
    coat,
    eyes,
    size,
    gender,
    tags,
    suggestedName,
    description: `Un chat ${color.toLowerCase()} de type ${breed}, air ${tags[0]!.toLowerCase()}. ${suggestedName} a été repéré dans le quartier — prêt à rejoindre ton CatDex.`,
  };
}

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
  const analysisSeed = imageBase64.slice(0, 1200);

  const normalizedMime = mimeType.toLowerCase();
  if (
    normalizedMime.includes('heic') ||
    normalizedMime.includes('heif') ||
    normalizedMime.includes('tiff')
  ) {
    // Always 200 + analysis when mocking — Cloudflare quick tunnels strip non-200 bodies.
    return c.json({
      error: 'Format image non supporté. Utilise JPEG ou PNG.',
      analysis: buildFallbackAnalysis(analysisSeed),
      mocked: true,
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  // Mock path: respond immediately — cutout is optional polish, not required for detection.
  if (keyLooksPlaceholder(apiKey)) {
    return c.json({
      analysis: buildFallbackAnalysis(analysisSeed),
      mocked: true,
    });
  }

  const openai = new OpenAI({ apiKey: apiKey!.trim() });

  try {
    // Vision first for snappy detection — attach cutout only if it finishes in time.
    const cutoutPromise = cutoutWithinBudget(imageBase64, mimeType);
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
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
                detail: 'low',
              },
            },
          ],
        },
      ],
    });

    // Use cutout only if it already finished during Vision — never wait extra.
    const cutoutBase64 = await Promise.race([
      cutoutPromise,
      Promise.resolve(null as string | null),
    ]);

    const raw = completion.choices[0]?.message?.content ?? '{}';
    const json = JSON.parse(raw) as VisionJson;
    const analysis = normalizeAnalysis(json, buildFallbackAnalysis(analysisSeed));

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
    console.error('[analyze-cat]', error);
    // Prefer 200 so public tunnels (Cloudflare) do not replace the JSON body.
    return c.json({
      error: 'Échec analyse OpenAI',
      analysis: buildFallbackAnalysis(analysisSeed),
      mocked: true,
    });
  }
});

serve({ fetch: app.fetch, port, hostname: '0.0.0.0' }, () => {
  console.log(`CatDex API ready on http://0.0.0.0:${port}`);
});
