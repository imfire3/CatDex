/**
 * Minimal Supabase REST helpers for Netlify functions (service_role).
 */

export function getSupabaseUrl() {
  const url =
    process.env.SUPABASE_URL?.trim() ||
    process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  return url ? url.replace(/\/+$/, '') : null;
}

export function getServiceRoleKey() {
  // Prefer new secret keys (sb_secret_…) — legacy JWT service_role may be disabled.
  return (
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    null
  );
}

export function supabaseHeaders(serviceKey, prefer) {
  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
  };
  if (prefer) headers.Prefer = prefer;
  return headers;
}

export async function countTable(supabaseUrl, serviceKey, table) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=id`, {
    method: 'HEAD',
    headers: supabaseHeaders(serviceKey, 'count=exact'),
  });
  if (!response.ok) return null;
  const range = response.headers.get('content-range');
  const match = /\/(\d+|\*)\s*$/.exec(range ?? '');
  if (!match || match[1] === '*') return null;
  return Number(match[1]);
}

export async function selectRows(supabaseUrl, serviceKey, table, query) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/${table}?${query}`,
    {
      method: 'GET',
      headers: supabaseHeaders(serviceKey),
    },
  );
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`${table} ${response.status}: ${text.slice(0, 200)}`);
  }
  return response.json();
}

export async function insertRow(supabaseUrl, serviceKey, table, row) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: 'POST',
    headers: supabaseHeaders(serviceKey, 'return=minimal'),
    body: JSON.stringify(row),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`insert ${table} ${response.status}: ${text.slice(0, 300)}`);
  }
}

/** Best-effort user id from Authorization Bearer JWT (payload.sub). */
export function userIdFromAuthHeader(authHeader) {
  if (!authHeader || typeof authHeader !== 'string') return null;
  const match = /^Bearer\s+(.+)$/i.exec(authHeader.trim());
  if (!match) return null;
  const token = match[1];
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString(
        'utf8',
      ),
    );
    const sub = typeof payload.sub === 'string' ? payload.sub : null;
    return sub && /^[0-9a-f-]{36}$/i.test(sub) ? sub : null;
  } catch {
    return null;
  }
}
