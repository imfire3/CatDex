/**
 * Secret-gated admin ops dashboard (HTML) on Netlify.
 * Auth: ADMIN_STATS_SECRET via ?key= or x-admin-secret.
 * Data: live Supabase rows via service_role.
 */

import {
  countTable,
  getServiceRoleKey,
  getSupabaseUrl,
  selectRows,
  supabaseHeaders,
} from '../lib/supabase.mjs';

function esc(value) {
  return String(value ?? '—')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getAdminSecret() {
  return process.env.ADMIN_STATS_SECRET?.trim() || null;
}

function isAuthorized(event) {
  const secret = getAdminSecret();
  if (!secret) return false;
  const header =
    event.headers?.['x-admin-secret']?.trim() ||
    event.headers?.['X-Admin-Secret']?.trim();
  const params = new URLSearchParams(event.queryStringParameters || {});
  // Netlify may pass queryStringParameters as object already
  const query =
    event.queryStringParameters?.key?.trim() || params.get('key')?.trim();
  return header === secret || query === secret;
}

function unauthorizedHtml() {
  return `<!DOCTYPE html><html lang="fr"><body style="font-family:system-ui;padding:24px">
    <h1>CatDex · Admin</h1>
    <p>Accès refusé. Ajoute <code>?key=TON_ADMIN_STATS_SECRET</code> à l’URL
    (secret défini sur Netlify).</p>
  </body></html>`;
}

function fmtDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toISOString().replace('T', ' ').slice(0, 19);
  } catch {
    return String(value);
  }
}

function shortId(id) {
  if (!id || typeof id !== 'string') return '—';
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

function jsonPreview(value) {
  if (value == null) return '';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

async function fetchOwnerEmails(supabaseUrl, serviceKey, ownerIds) {
  const unique = [...new Set(ownerIds.filter(Boolean))];
  if (unique.length === 0) return new Map();
  const inList = unique.join(',');
  const rows = await selectRows(
    supabaseUrl,
    serviceKey,
    'profiles',
    `select=id,email&id=in.(${inList})`,
  );
  const map = new Map();
  for (const row of rows || []) {
    map.set(row.id, row.email);
  }
  return map;
}

function renderDashboard(data) {
  const countCards = `
    <div class="grid">
      <div class="card"><div class="label">Profils</div><div class="value">${esc(data.counts.profiles ?? '—')}</div></div>
      <div class="card"><div class="label">Chats</div><div class="value">${esc(data.counts.cats ?? '—')}</div></div>
      <div class="card"><div class="label">Vision runs</div><div class="value">${esc(data.counts.visionRuns ?? '—')}</div></div>
      <div class="card"><div class="label">Feedback</div><div class="value">${esc(data.counts.feedback ?? '—')}</div></div>
      <div class="card"><div class="label">Vision OK</div><div class="value">${esc(data.counts.visionOk ?? '—')}</div></div>
      <div class="card"><div class="label">Vision fail</div><div class="value">${esc(data.counts.visionFail ?? '—')}</div></div>
    </div>`;

  const profileRows = (data.profiles || [])
    .map(
      (p) => `
      <tr>
        <td>${esc(fmtDate(p.created_at))}</td>
        <td>${esc(p.email)}</td>
        <td>${esc(p.display_name)}</td>
        <td><code>${esc(shortId(p.id))}</code></td>
      </tr>`,
    )
    .join('');

  const catRows = (data.cats || [])
    .map(
      (c) => `
      <tr>
        <td>${esc(fmtDate(c.created_at))}</td>
        <td>${esc(c.name)}</td>
        <td>${esc(c.ownerEmail || shortId(c.owner_id))}</td>
        <td>${
          c.photo_url
            ? `<a href="${esc(c.photo_url)}" target="_blank" rel="noopener">photo</a>`
            : '—'
        }</td>
        <td>${esc(c.breed)}</td>
      </tr>`,
    )
    .join('');

  const visionRows = (data.visionRuns || [])
    .map(
      (r) => `
      <tr>
        <td>${esc(fmtDate(r.created_at))}</td>
        <td>${r.ok ? '✅' : '❌'}</td>
        <td>${esc(r.latency_ms ?? '—')} ms</td>
        <td>${esc(r.suggested_name)}</td>
        <td>${esc(r.breed)}</td>
        <td>${esc(r.coat_color)}</td>
        <td><code>${esc(r.prompt_version)}</code></td>
        <td><code>${esc(shortId(r.user_id))}</code></td>
        <td>${esc(r.error)}</td>
        <td>
          <details>
            <summary>JSON</summary>
            <pre>${esc(jsonPreview({ response: r.response_json, normalized: r.normalized_json }))}</pre>
          </details>
        </td>
      </tr>`,
    )
    .join('');

  const feedbackRows = (data.feedback || [])
    .map(
      (f) => `
      <tr>
        <td>${esc(fmtDate(f.created_at))}</td>
        <td>${f.confirmed ? 'oui' : 'non'}</td>
        <td><code>${esc(shortId(f.user_id))}</code></td>
        <td><code>${esc(shortId(f.cat_id))}</code></td>
        <td>
          <details>
            <summary>détails</summary>
            <pre>${esc(jsonPreview({ predicted: f.predicted, corrections: f.corrections }))}</pre>
          </details>
        </td>
      </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="refresh" content="30" />
  <title>CatDex — Admin ops</title>
  <style>
    :root { color-scheme: light; font-family: ui-sans-serif, system-ui, sans-serif; }
    body { margin: 0; padding: 24px; background: #F9F9FB; color: #15172B; }
    h1 { margin: 0 0 4px; font-size: 24px; color: #6A69F8; }
    h2 { margin: 28px 0 12px; font-size: 18px; }
    .muted { color: #667085; font-size: 14px; }
    .err { color: #E5484D; font-size: 14px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; margin: 16px 0 8px; }
    .card { background: #fff; border: 1px solid #EEF0F2; border-radius: 12px; padding: 16px; }
    .label { font-size: 12px; color: #98A2B3; text-transform: uppercase; letter-spacing: 0.04em; }
    .value { font-size: 28px; font-weight: 700; margin-top: 6px; }
    table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #EEF0F2; margin-bottom: 8px; }
    th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #EEF0F2; font-size: 13px; vertical-align: top; }
    th { background: #EEF0F2; font-size: 11px; text-transform: uppercase; color: #667085; }
    code { font-size: 12px; }
    pre { max-width: 420px; max-height: 240px; overflow: auto; font-size: 11px; background: #F9F9FB; padding: 8px; border-radius: 8px; }
    a { color: #6A69F8; }
    details summary { cursor: pointer; color: #6A69F8; }
  </style>
</head>
<body>
  <h1>CatDex · Admin ops</h1>
  <p class="muted">Généré ${esc(data.generatedAt)} · refresh auto 30s · Netlify + Supabase live</p>
  ${data.error ? `<p class="err">${esc(data.error)}</p>` : ''}

  <h2>Compteurs</h2>
  ${countCards}

  <h2>Comptes</h2>
  <table>
    <thead><tr><th>Créé</th><th>Email</th><th>Nom</th><th>Id</th></tr></thead>
    <tbody>${profileRows || '<tr><td colspan="4" class="muted">Aucun profil</td></tr>'}</tbody>
  </table>

  <h2>Photos / imports</h2>
  <table>
    <thead><tr><th>Date</th><th>Nom</th><th>Owner</th><th>Photo</th><th>Race</th></tr></thead>
    <tbody>${catRows || '<tr><td colspan="5" class="muted">Aucun chat</td></tr>'}</tbody>
  </table>

  <h2>Retours GPT</h2>
  <table>
    <thead><tr><th>Quand</th><th>OK</th><th>Latence</th><th>Nom</th><th>Race</th><th>Pelage</th><th>Prompt</th><th>User</th><th>Erreur</th><th>JSON</th></tr></thead>
    <tbody>${visionRows || '<tr><td colspan="10" class="muted">Aucun vision_run — lance une analyse scanner</td></tr>'}</tbody>
  </table>

  <h2>Feedback corrections</h2>
  <table>
    <thead><tr><th>Quand</th><th>Confirmé</th><th>User</th><th>Cat</th><th>Détails</th></tr></thead>
    <tbody>${feedbackRows || '<tr><td colspan="5" class="muted">Aucun feedback</td></tr>'}</tbody>
  </table>
</body>
</html>`;
}

async function countWhere(supabaseUrl, serviceKey, table, filter) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/${table}?select=id&${filter}`,
    {
      method: 'HEAD',
      headers: supabaseHeaders(serviceKey, 'count=exact'),
    },
  );
  if (!response.ok) return null;
  const range = response.headers.get('content-range');
  const match = /\/(\d+|\*)\s*$/.exec(range ?? '');
  if (!match || match[1] === '*') return null;
  return Number(match[1]);
}

async function loadDashboardData() {
  const supabaseUrl = getSupabaseUrl();
  const serviceKey = getServiceRoleKey();
  if (!supabaseUrl || !serviceKey) {
    return {
      generatedAt: new Date().toISOString(),
      error:
        'Configure SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY sur Netlify.',
      counts: {},
      profiles: [],
      cats: [],
      visionRuns: [],
      feedback: [],
    };
  }

  try {
    const [
      profilesCount,
      catsCount,
      visionCount,
      feedbackCount,
      visionOk,
      visionFail,
      profiles,
      cats,
      visionRuns,
      feedback,
    ] = await Promise.all([
      countTable(supabaseUrl, serviceKey, 'profiles'),
      countTable(supabaseUrl, serviceKey, 'cats'),
      countTable(supabaseUrl, serviceKey, 'vision_runs'),
      countTable(supabaseUrl, serviceKey, 'analysis_feedback'),
      countWhere(supabaseUrl, serviceKey, 'vision_runs', 'ok=eq.true'),
      countWhere(supabaseUrl, serviceKey, 'vision_runs', 'ok=eq.false'),
      selectRows(
        supabaseUrl,
        serviceKey,
        'profiles',
        'select=id,email,display_name,created_at&order=created_at.desc&limit=100',
      ),
      selectRows(
        supabaseUrl,
        serviceKey,
        'cats',
        'select=id,name,breed,photo_url,owner_id,created_at&order=created_at.desc&limit=80',
      ),
      selectRows(
        supabaseUrl,
        serviceKey,
        'vision_runs',
        'select=id,created_at,user_id,ok,latency_ms,model,error,prompt_version,response_json,normalized_json,suggested_name,breed,coat_color&order=created_at.desc&limit=80',
      ),
      selectRows(
        supabaseUrl,
        serviceKey,
        'analysis_feedback',
        'select=id,created_at,user_id,cat_id,predicted,corrections,confirmed&order=created_at.desc&limit=50',
      ),
    ]);

    const emailMap = await fetchOwnerEmails(
      supabaseUrl,
      serviceKey,
      (cats || []).map((c) => c.owner_id),
    );
    const catsWithEmail = (cats || []).map((c) => ({
      ...c,
      ownerEmail: emailMap.get(c.owner_id) || null,
    }));

    return {
      generatedAt: new Date().toISOString(),
      counts: {
        profiles: profilesCount,
        cats: catsCount,
        visionRuns: visionCount,
        feedback: feedbackCount,
        visionOk,
        visionFail,
      },
      profiles: profiles || [],
      cats: catsWithEmail,
      visionRuns: visionRuns || [],
      feedback: feedback || [],
    };
  } catch (error) {
    return {
      generatedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Erreur Supabase',
      counts: {},
      profiles: [],
      cats: [],
      visionRuns: [],
      feedback: [],
    };
  }
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: { 'Access-Control-Allow-Origin': '*' }, body: '' };
  }
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Method not allowed',
    };
  }

  if (!isAuthorized(event)) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body: unauthorizedHtml(),
    };
  }

  const data = await loadDashboardData();
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
    body: renderDashboard(data),
  };
}
