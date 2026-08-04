import 'dotenv/config';

import { serve } from '@hono/node-server';
import { removeBackground } from '@imgly/background-removal-node';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import OpenAI from 'openai';
import { z } from 'zod';

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
    return tags.map((t) => String(t).trim()).filter(Boolean).slice(0, 3);
  }
  if (typeof tags === 'string' && tags.trim()) {
    return tags
      .split(/[,;/]/)
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 3);
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

function stripDataUrl(imageBase64: string, mimeType: string) {
  const dataUrl = /^data:([^;]+);base64,(.+)$/s.exec(imageBase64);
  if (!dataUrl) return { imageBase64, mimeType };
  return {
    mimeType: dataUrl[1] || mimeType,
    imageBase64: dataUrl[2],
  };
}

async function cutoutCatPng(imageBase64: string, mimeType: string): Promise<string | null> {
  try {
    const input = Buffer.from(imageBase64, 'base64');
    const blob = await removeBackground(new Blob([input], { type: mimeType }), {
      model: 'small',
      output: { format: 'image/png', quality: 0.9, type: 'foreground' },
    });
    const buffer = Buffer.from(await blob.arrayBuffer());
    return buffer.toString('base64');
  } catch (error) {
    console.error('[cutout]', error);
    return null;
  }
}

app.post('/analyze-cat', async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = analyzeSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Payload invalide' }, 400);
  }

  let { imageBase64, mimeType } = stripDataUrl(parsed.data.imageBase64, parsed.data.mimeType);

  const normalizedMime = mimeType.toLowerCase();
  if (
    normalizedMime.includes('heic') ||
    normalizedMime.includes('heif') ||
    normalizedMime.includes('tiff')
  ) {
    return c.json(
      {
        error: 'Format image non supporté. Utilise JPEG ou PNG.',
        analysis: fallbackAnalysis,
        mocked: true,
      },
      415,
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const cutoutPromise = cutoutCatPng(imageBase64, mimeType);

  if (!apiKey) {
    const cutoutBase64 = await cutoutPromise;
    return c.json({
      analysis: fallbackAnalysis,
      mocked: true,
      cutoutBase64: cutoutBase64 ?? undefined,
      cutoutMimeType: cutoutBase64 ? 'image/png' : undefined,
    });
  }

  const openai = new OpenAI({ apiKey });

  try {
    const [completion, cutoutBase64] = await Promise.all([
      openai.chat.completions.create({
        model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: [
              'Tu es le naturaliste urbain de CatDex.',
              'Tu analyses UNIQUEMENT des photos de chats (ou clairement dominées par un chat).',
              'Réponds uniquement en JSON valide avec les clés:',
              'color (couleur principale, ex: "Noir", "Roux tigré"),',
              'breed (race ou type probable, ex: "Européen", "Siamois"),',
              'coat (longueur/type de poil, ex: "Court", "Long"),',
              'eyes (couleur des yeux, ex: "Ambre", "Verts"),',
              'size (Petite | Moyenne | Grande),',
              'gender (male | female | unknown),',
              'tags (tableau de 2 à 3 mots d’ambiance, ex: ["Ombre","Mystère"]),',
              'description (2 phrases max, ton chaleureux, français, sans inventer de lieux),',
              'suggestedName (un seul prénom court et mignon adapté à l’apparence).',
              'Si la photo ne montre pas de chat, mets breed="Inconnu", color="Indéterminée",',
              'description="Aucun chat clairement visible sur cette photo.", suggestedName="".',
            ].join(' '),
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyse ce chat pour le CatDex.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
      }),
      cutoutPromise,
    ]);

    const raw = completion.choices[0]?.message?.content ?? '{}';
    const json = JSON.parse(raw) as AnalysisJson;

    return c.json({
      analysis: normalizeAnalysis(json),
      mocked: false,
      cutoutBase64: cutoutBase64 ?? undefined,
      cutoutMimeType: cutoutBase64 ? 'image/png' : undefined,
    });
  } catch (error) {
    console.error('[analyze-cat]', error);
    const cutoutBase64 = await cutoutPromise.catch(() => null);
    return c.json(
      {
        error: 'Échec analyse OpenAI',
        analysis: fallbackAnalysis,
        mocked: true,
        cutoutBase64: cutoutBase64 ?? undefined,
        cutoutMimeType: cutoutBase64 ? 'image/png' : undefined,
      },
      502,
    );
  }
});

serve({ fetch: app.fetch, port, hostname: '0.0.0.0' }, () => {
  console.log(`CatDex API ready on http://0.0.0.0:${port}`);
});
