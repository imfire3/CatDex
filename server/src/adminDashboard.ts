/**
 * Tiny HTML dashboard for operators (secret-gated).
 */

import type { AnalyzeEvent } from './statsStore';
import type { RecentCatRow, SupabaseProductStats } from './supabaseProductStats';

type DashboardPayload = {
  generatedAt: string;
  analyze: {
    processStartedAt: string;
    total: number;
    ok: number;
    errors: number;
    avgLatencyMs: number | null;
    last24h: { ok: number; errors: number };
    recent: AnalyzeEvent[];
  };
  product: SupabaseProductStats;
};

function esc(value: unknown): string {
  return String(value ?? '—')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function shortId(id: string): string {
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

function formatWhen(iso: string): string {
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return iso;
  return new Date(ms).toLocaleString('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function lifestyleLabel(value: string | null): string {
  if (value === 'domestique') return 'Domestique';
  if (value === 'sauvage') return 'Sauvage';
  return '—';
}

function renderRecentCats(rows: RecentCatRow[] | undefined): string {
  if (!rows || rows.length === 0) {
    return `<tr><td colspan="5" class="muted">Aucune capture récente.</td></tr>`;
  }

  return rows
    .map((cat) => {
      const thumb = cat.photo_url
        ? `<img class="thumb" src="${esc(cat.photo_url)}" alt="" loading="lazy" />`
        : `<span class="muted">pas de photo</span>`;
      return `
      <tr>
        <td>${thumb}</td>
        <td>${esc(cat.name)}</td>
        <td>${esc(lifestyleLabel(cat.lifestyle))}</td>
        <td><code>${esc(shortId(cat.owner_id))}</code></td>
        <td>${esc(formatWhen(cat.created_at))}</td>
      </tr>`;
    })
    .join('');
}

export function renderAdminDashboardHtml(data: DashboardPayload): string {
  const rows = data.analyze.recent
    .map(
      (event) => `
      <tr>
        <td>${esc(event.at)}</td>
        <td>${event.ok ? '✅' : '❌'}</td>
        <td>${esc(event.latencyMs)} ms</td>
        <td><code>${esc(shortId(event.userId))}</code></td>
        <td>${esc(event.error ?? '—')}</td>
      </tr>`,
    )
    .join('');

  const product = data.product.available
    ? `
      <div class="grid">
        <div class="card"><div class="label">Profils</div><div class="value">${esc(data.product.profiles)}</div></div>
        <div class="card"><div class="label">Nouveaux 7j</div><div class="value">${esc(data.product.profilesLast7d)}</div></div>
        <div class="card"><div class="label">Chats</div><div class="value">${esc(data.product.cats)}</div></div>
        <div class="card"><div class="label">Avec photo</div><div class="value">${esc(data.product.catsWithPhoto)}</div></div>
        <div class="card"><div class="label">Captures 24h</div><div class="value">${esc(data.product.catsLast24h)}</div></div>
        <div class="card"><div class="label">Captures 7j</div><div class="value">${esc(data.product.catsLast7d)}</div></div>
        <div class="card"><div class="label">Sauvage</div><div class="value">${esc(data.product.sauvage)}</div></div>
        <div class="card"><div class="label">Domestique</div><div class="value">${esc(data.product.domestique)}</div></div>
        <div class="card"><div class="label">Sightings</div><div class="value">${esc(data.product.sightings)}</div></div>
        <div class="card"><div class="label">Analyses DB</div><div class="value">${esc(data.product.analyses)}</div></div>
      </div>

      <h2>Dernières captures</h2>
      <table>
        <thead>
          <tr>
            <th>Photo</th>
            <th>Nom</th>
            <th>Type</th>
            <th>Owner</th>
            <th>Quand</th>
          </tr>
        </thead>
        <tbody>${renderRecentCats(data.product.recentCats)}</tbody>
      </table>`
    : `<p class="muted">${esc(data.product.error ?? 'Supabase indisponible')}</p>`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="refresh" content="30" />
  <title>CatDex — Stats admin</title>
  <style>
    :root { color-scheme: light; font-family: ui-sans-serif, system-ui, sans-serif; }
    body { margin: 0; padding: 24px; background: #F9F9FB; color: #15172B; }
    h1 { margin: 0 0 4px; font-size: 24px; color: #6A69F8; }
    h2 { margin: 28px 0 12px; font-size: 18px; }
    .muted { color: #667085; font-size: 14px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; margin: 16px 0 28px; }
    .card { background: #fff; border: 1px solid #EEF0F2; border-radius: 12px; padding: 16px; }
    .label { font-size: 12px; color: #98A2B3; text-transform: uppercase; letter-spacing: 0.04em; }
    .value { font-size: 28px; font-weight: 700; margin-top: 6px; }
    table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #EEF0F2; margin-bottom: 28px; }
    th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #EEF0F2; font-size: 13px; vertical-align: middle; }
    th { background: #EEF0F2; font-size: 11px; text-transform: uppercase; color: #667085; }
    code { font-size: 12px; }
    .thumb { width: 48px; height: 48px; object-fit: cover; border-radius: 8px; background: #EEF0F2; display: block; }
  </style>
</head>
<body>
  <h1>CatDex · Stats</h1>
  <p class="muted">Généré ${esc(data.generatedAt)} · refresh auto 30s · process depuis ${esc(data.analyze.processStartedAt)}</p>

  <h2>Produit (Supabase)</h2>
  ${product}

  <h2>API analyse (ce process)</h2>
  <div class="grid">
    <div class="card"><div class="label">Total</div><div class="value">${esc(data.analyze.total)}</div></div>
    <div class="card"><div class="label">OK</div><div class="value">${esc(data.analyze.ok)}</div></div>
    <div class="card"><div class="label">Erreurs</div><div class="value">${esc(data.analyze.errors)}</div></div>
    <div class="card"><div class="label">Latence moy.</div><div class="value">${esc(data.analyze.avgLatencyMs ?? '—')}</div></div>
    <div class="card"><div class="label">OK 24h</div><div class="value">${esc(data.analyze.last24h.ok)}</div></div>
    <div class="card"><div class="label">Err 24h</div><div class="value">${esc(data.analyze.last24h.errors)}</div></div>
  </div>

  <h2>Dernières analyses</h2>
  <table>
    <thead><tr><th>Quand</th><th>Statut</th><th>Latence</th><th>User</th><th>Erreur</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="5" class="muted">Aucune analyse depuis le dernier démarrage du service.</td></tr>'}</tbody>
  </table>
</body>
</html>`;
}
