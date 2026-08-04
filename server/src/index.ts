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

function normalizeAnalysis(json: AnalysisJson, seedInput: string) {
  const description = json.description?.trim() || '';
  const breedRaw = json.breed?.trim() || '';
  const noCat =
    /aucun chat/i.test(description) ||
    (breedRaw.toLowerCase() === 'inconnu' && !(json.suggestedName ?? '').trim());

  if (noCat) {
    return {
      color: json.color?.trim() || 'Indéterminée',
      breed: 'Inconnu',
      coat: json.coat?.trim() || 'Indéterminée',
      description: description || 'Aucun chat clairement visible sur cette photo.',
      suggestedName: '',
      gender: 'unknown' as const,
      eyes: json.eyes?.trim() || undefined,
      size: json.size?.trim() || undefined,
      tags: [] as string[],
    };
  }

  const fallback = buildFallbackAnalysis(seedInput);
  const color = json.color?.trim() || fallback.color;
  const breed = json.breed?.trim() || fallback.breed;
  const coat = json.coat?.trim() || fallback.coat;
  const suggestedName = json.suggestedName?.trim() || fallback.suggestedName;
  const tags = normalizeTags(json.tags) ?? fallback.tags;
  return {
    color,
    breed,
    coat,
    description:
      description ||
      `Un chat ${color.toLowerCase()} de type ${breed}. ${suggestedName} rejoint ton CatDex.`,
    suggestedName,
    gender: normalizeGender(json.gender),
    eyes: json.eyes?.trim() || fallback.eyes,
    size: json.size?.trim() || fallback.size,
    tags,
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
  const cutoutPromise = cutoutCatPng(imageBase64, mimeType);

  if (keyLooksPlaceholder(apiKey)) {
    const cutoutBase64 = await cutoutPromise;
    return c.json({
      analysis: buildFallbackAnalysis(analysisSeed),
      mocked: true,
      cutoutBase64: cutoutBase64 ?? undefined,
      cutoutMimeType: cutoutBase64 ? 'image/png' : undefined,
    });
  }

  const openai = new OpenAI({ apiKey: apiKey!.trim() });

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
              'Réponds uniquement en JSON valide avec TOUTES les clés suivantes (aucune ne doit être vide si un chat est visible):',
              'color (couleur principale OBLIGATOIRE, ex: "Noir", "Roux tigré", "Gris"),',
              'breed (race ou type probable OBLIGATOIRE, ex: "Européen", "Siamois", "Maine Coon"),',
              'coat (longueur/type de poil, ex: "Court", "Long"),',
              'eyes (couleur des yeux, ex: "Ambre", "Verts"),',
              'size (Petite | Moyenne | Grande),',
              'gender (male | female | unknown),',
              'tags (tableau de 2 à 3 mots d’ambiance OBLIGATOIRE, ex: ["Ombre","Mystère","Vif"]),',
              'description (2 phrases max, ton chaleureux, français, sans inventer de lieux),',
              'suggestedName (OBLIGATOIRE: un seul prénom court et mignon adapté à l’apparence, ex: "Nori", "Caramel").',
              'Si la photo ne montre pas de chat, mets breed="Inconnu", color="Indéterminée",',
              'description="Aucun chat clairement visible sur cette photo.", suggestedName="", tags=[].',
            ].join(' '),
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyse ce chat pour le CatDex. Donne couleur, race, traits et un prénom.',
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
      analysis: normalizeAnalysis(json, analysisSeed),
      mocked: false,
      cutoutBase64: cutoutBase64 ?? undefined,
      cutoutMimeType: cutoutBase64 ? 'image/png' : undefined,
    });
  } catch (error) {
    console.error('[analyze-cat]', error);
    const cutoutBase64 = await cutoutPromise.catch(() => null);
    // Prefer 200 so public tunnels (Cloudflare) do not replace the JSON body.
    return c.json({
      error: 'Échec analyse OpenAI',
      analysis: buildFallbackAnalysis(analysisSeed),
      mocked: true,
      cutoutBase64: cutoutBase64 ?? undefined,
      cutoutMimeType: cutoutBase64 ? 'image/png' : undefined,
    });
  }
});

serve({ fetch: app.fetch, port, hostname: '0.0.0.0' }, () => {
  console.log(`CatDex API ready on http://0.0.0.0:${port}`);
});
