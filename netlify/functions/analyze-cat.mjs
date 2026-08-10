/**
 * Beta Vision endpoint on Netlify (bypasses broken Render JWT gate).
 * Same contract as server POST /analyze-cat.
 */

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SYSTEM_PROMPT = `Tu es le moteur Vision de CatDex. Analyse UNIQUEMENT ce qui est visible sur la photo.
Réponds en français. N'invente pas d'histoire, de propriétaire, ni de traits invisibles.
Si ce n'est pas un chat clairement visible, isCat=false et explique dans reason.`;

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
        errorMessage: form?.reason || 'Aucun chat clairement visible sur cette photo.',
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
      suggestedName: form.name || undefined,
      gender: form.sex || 'inconnu',
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
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              SYSTEM_PROMPT +
              '\nRéponds UNIQUEMENT en JSON avec les clés: isCat, reason, name, breed, breedConfidence (0-100), coatColor, coatPattern, furLength, eyeColor, size, estimatedAge, sex (mâle|femelle|inconnu), distinctiveFeatures (string[]), personalityTraits (string[]), description.',
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyse ce chat pour la fiche CatDex.',
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

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const errMsg =
        payload?.error?.message ||
        payload?.error?.code ||
        `openai_http_${response.status}`;
      console.error('[netlify analyze-cat] OpenAI error', errMsg);
      return json(502, {
        error: 'Analyse Vision indisponible. Réessaie dans un instant.',
        detail: errMsg,
      });
    }

    const raw = payload?.choices?.[0]?.message?.content ?? '{}';
    const form = JSON.parse(raw);
    return json(200, mapFormToAnalysis(form));
  } catch (error) {
    console.error('[netlify analyze-cat] failure', error);
    return json(502, {
      error: 'Analyse Vision indisponible. Réessaie dans un instant.',
    });
  }
}
