/**
 * Beta Vision endpoint on Netlify (bypasses broken Render JWT gate).
 * Same contract as server POST /analyze-cat.
 *
 * CatDex Vision prompt has a single source of truth.
 * Do not duplicate the prompt in this file.
 */

import {
  CATDEX_VISION_SYSTEM_PROMPT,
  CATDEX_VISION_USER_PROMPT,
  CATDEX_VISION_PROMPT_VERSION,
} from '../../shared/catdexVisionPrompt.mjs';
import { CATDEX_FORM_RESPONSE_FORMAT } from '../../shared/catdexFormSchema.mjs';
import { normalizeCatGender } from '../../shared/normalizeCatGender.mjs';
import {
  getServiceRoleKey,
  getSupabaseUrl,
  insertRow,
  userIdFromAuthHeader,
} from '../lib/supabase.mjs';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const GENERIC_NAMES = new Set([
  '',
  'chat',
  'minou',
  'minet',
  'chaton',
  'felix',
  'félix',
  'garfield',
  'ombre',
  'roux',
  'noir',
  'blanc',
  'gris',
  'miaou',
  'cat',
  'kitty',
  'unknown',
  'inconnu',
  'grisou',
  'tigrou',
  'neige',
  'cendre',
  'mistigri',
  'minette',
]);

function pickFunnyName(form) {
  const hay = `${form.coatColor || ''} ${form.coatPattern || ''} ${form.breed || ''} ${form.description || ''} ${(form.personalityTraits || []).join(' ')}`.toLowerCase();
  if (/roux|orange|ginger/.test(hay)) return 'Flambyx';
  if (/noir et blanc|bicolor|tuxedo/.test(hay)) return 'Oreon';
  if (/calico|tricolore|écaille|tortie/.test(hay)) return 'Patchou';
  if (/noir|black/.test(hay)) return 'Noctix';
  if (/blanc|white|neige|crème|cream/.test(hay)) return 'Mochix';
  if (/gris|grey|gray|bleu|argent/.test(hay)) return 'Brumix';
  if (/brun|chocolat|noisette/.test(hay)) return 'Mokax';
  if (/tigr|tabby|rayure/.test(hay)) return 'Stripion';
  if (/persan/.test(hay)) return 'Soufflix';
  if (/maine coon/.test(hay)) return 'Coonax';
  if (/siamois/.test(hay)) return 'Noodlix';
  return 'Sparkit';
}

function isGenericName(name) {
  const trimmed = (name || '').trim();
  if (trimmed.length < 3 || trimmed.length > 18) return true;
  if (GENERIC_NAMES.has(trimmed.toLowerCase())) return true;
  if (/\s/.test(trimmed)) return true;
  if (/^(roux|noir|blanc|gris|ombre|neige|cendre|tigré|tigre)$/i.test(trimmed)) {
    return true;
  }
  return /^(chat|minou|kitty|noir|roux|blanc|gris)\b/i.test(trimmed);
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...cors },
    body: JSON.stringify(body),
  };
}

function mapFormToAnalysis(form) {
  if (!form || form.isCat === false) {
    return {
      analysis: {
        color: '',
        breed: '',
        coat: '',
        description: form?.reason || 'Pas un chat clairement visible.',
        notACat: true,
        errorCode: 'NOT_A_CAT',
        errorTitle: 'Ce n’est pas un chat',
        errorMessage:
          form?.reason || 'Aucun chat clairement visible sur cette photo.',
      },
      mocked: false,
    };
  }

  const rawConf = Number(form.breedConfidence) || 0;
  const confidence = Math.round(
    Math.min(100, Math.max(0, rawConf <= 1 ? rawConf * 100 : rawConf)),
  );

  return {
    analysis: {
      color: form.coatColor || '',
      breed: form.breed || 'Race inconnue',
      coat: form.furLength || '',
      description: form.description || '',
      suggestedName: isGenericName(form.name) ? pickFunnyName(form) : form.name,
      gender: normalizeCatGender(form.sex || 'inconnu'),
      eyes: form.eyeColor || undefined,
      size: form.size || undefined,
      estimatedAge: form.estimatedAge || undefined,
      coatPattern: form.coatPattern || undefined,
      tags: Array.isArray(form.personalityTraits)
        ? form.personalityTraits.slice(0, 3)
        : [],
      distinctiveFeatures: Array.isArray(form.distinctiveFeatures)
        ? form.distinctiveFeatures
        : [],
      confidence,
      notACat: false,
    },
    mocked: false,
  };
}

async function logVisionRun(row) {
  const supabaseUrl = getSupabaseUrl();
  const serviceKey = getServiceRoleKey();
  if (!supabaseUrl || !serviceKey) {
    console.warn(
      '[netlify analyze-cat] skip vision_runs — missing SUPABASE_URL / SERVICE_ROLE',
    );
    return;
  }
  try {
    await insertRow(supabaseUrl, serviceKey, 'vision_runs', row);
  } catch (error) {
    console.error('[netlify analyze-cat] vision_runs insert failed', error);
  }
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey || apiKey.includes('your-key') || apiKey === 'sk-your-key-here') {
    return json(503, {
      error:
        'Service d’analyse indisponible. Configure OPENAI_API_KEY pour analyser les photos.',
      mocked: false,
    });
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'JSON invalide' });
  }

  let imageBase64 = typeof body.imageBase64 === 'string' ? body.imageBase64 : '';
  let mimeType = typeof body.mimeType === 'string' ? body.mimeType : 'image/jpeg';
  const dataUrl = /^data:([^;]+);base64,(.+)$/s.exec(imageBase64);
  if (dataUrl) {
    mimeType = dataUrl[1] || mimeType;
    imageBase64 = dataUrl[2];
  }
  imageBase64 = imageBase64.replace(/\s/g, '');
  if (imageBase64.length < 32) {
    return json(400, { error: 'Payload invalide' });
  }

  const model = process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini';
  const userId = userIdFromAuthHeader(
    event.headers?.authorization || event.headers?.Authorization,
  );
  const startedAt = Date.now();

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 1400,
        response_format: CATDEX_FORM_RESPONSE_FORMAT,
        messages: [
          {
            role: 'system',
            content: CATDEX_VISION_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: CATDEX_VISION_USER_PROMPT,
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
      }),
    });

    const latencyMs = Date.now() - startedAt;
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const errMsg =
        payload?.error?.message ||
        payload?.error?.code ||
        `openai_http_${response.status}`;
      console.error('[netlify analyze-cat] OpenAI error', errMsg);
      await logVisionRun({
        user_id: userId,
        ok: false,
        latency_ms: latencyMs,
        model,
        error: String(errMsg).slice(0, 500),
        prompt_version: CATDEX_VISION_PROMPT_VERSION,
      });
      return json(502, {
        error: 'Analyse Vision indisponible. Réessaie dans un instant.',
        detail: errMsg,
      });
    }

    const raw = payload?.choices?.[0]?.message?.content ?? '{}';
    let form;
    try {
      form = JSON.parse(raw);
    } catch (parseError) {
      await logVisionRun({
        user_id: userId,
        ok: false,
        latency_ms: latencyMs,
        model,
        error: 'invalid_json_from_model',
        prompt_version: CATDEX_VISION_PROMPT_VERSION,
        response_json: { raw: String(raw).slice(0, 2000) },
      });
      return json(502, {
        error: 'Analyse Vision indisponible. Réessaie dans un instant.',
      });
    }

    const mapped = mapFormToAnalysis(form);
    await logVisionRun({
      user_id: userId,
      ok: true,
      latency_ms: latencyMs,
      model,
      prompt_version: CATDEX_VISION_PROMPT_VERSION,
      response_json: form,
      normalized_json: mapped.analysis,
      suggested_name: mapped.analysis?.suggestedName || form?.name || null,
      breed: mapped.analysis?.breed || form?.breed || null,
      coat_color: mapped.analysis?.color || form?.coatColor || null,
    });
    return json(200, mapped);
  } catch (error) {
    console.error('[netlify analyze-cat] failure', error);
    await logVisionRun({
      user_id: userId,
      ok: false,
      latency_ms: Date.now() - startedAt,
      model,
      error: error instanceof Error ? error.message.slice(0, 500) : 'unknown',
      prompt_version: CATDEX_VISION_PROMPT_VERSION,
    });
    return json(502, {
      error: 'Analyse Vision indisponible. Réessaie dans un instant.',
    });
  }
}
