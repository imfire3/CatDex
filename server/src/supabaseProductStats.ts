/**
 * Durable product counts from Supabase (service_role).
 */

const SUPABASE_FETCH_TIMEOUT_MS = 10_000;

export type RecentCatRow = {
  id: string;
  name: string;
  photo_url: string | null;
  owner_id: string;
  owner_display_name: string | null;
  lifestyle: string | null;
  created_at: string;
};

export type RecentProfileRow = {
  id: string;
  display_name: string | null;
  email: string | null;
  created_at: string;
};

export type SupabaseProductStats = {
  available: boolean;
  error?: string;
  profiles?: number;
  cats?: number;
  catsWithPhoto?: number;
  catsLast24h?: number;
  catsLast7d?: number;
  profilesLast7d?: number;
  domestique?: number;
  sauvage?: number;
  sightings?: number;
  analyses?: number;
  recentCats?: RecentCatRow[];
  recentCatsError?: string;
  recentProfiles?: RecentProfileRow[];
  recentProfilesError?: string;
};

type RecentListResult<T> = {
  rows: T[];
  error?: string;
};

type RawCat = {
  id: string;
  name: string;
  photo_url: string | null;
  owner_id: string;
  lifestyle?: string | null;
  created_at: string;
  profiles?: { display_name?: string | null } | null;
};

const CAT_SELECTS = [
  'id,name,photo_url,owner_id,lifestyle,created_at,profiles!cats_owner_id_fkey(display_name)',
  'id,name,photo_url,owner_id,created_at,profiles!cats_owner_id_fkey(display_name)',
  'id,name,photo_url,owner_id,lifestyle,created_at',
  'id,name,photo_url,owner_id,created_at',
] as const;

function getSupabaseUrl(): string | null {
  const url =
    process.env.SUPABASE_URL?.trim() ||
    process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  return url ? url.replace(/\/+$/, '') : null;
}

function getServiceRoleKey(): string | null {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || null;
}

function countHeaders(serviceKey: string): Record<string, string> {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    Prefer: 'count=exact',
    Range: '0-0',
  };
}

function rowHeaders(serviceKey: string): Record<string, string> {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
  };
}

function parseCount(response: Response): number | null {
  if (!response.ok) return null;
  const range = response.headers.get('content-range');
  const match = /\/(\d+|\*)\s*$/.exec(range ?? '');
  if (!match || match[1] === '*') return null;
  return Number(match[1]);
}

function httpError(status: number, body: string): string {
  const snippet = body.replace(/\s+/g, ' ').trim().slice(0, 120);
  return snippet ? `HTTP ${status} ${snippet}` : `HTTP ${status}`;
}

async function readBody(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return '';
  }
}

async function supabaseGet(
  url: string,
  headers: Record<string, string>,
): Promise<Response> {
  return fetch(url, {
    method: 'GET',
    headers,
    signal: AbortSignal.timeout(SUPABASE_FETCH_TIMEOUT_MS),
  });
}

function countQuery(filters: Record<string, string> = {}): string {
  return new URLSearchParams({ select: 'id', ...filters }).toString();
}

async function countTable(
  supabaseUrl: string,
  serviceKey: string,
  table: string,
  query = countQuery(),
): Promise<{ count: number | null; status: number; detail?: string }> {
  // GET + Range is more reliable than HEAD (some stacks drop Content-Range on HEAD).
  const response = await supabaseGet(
    `${supabaseUrl}/rest/v1/${table}?${query}`,
    countHeaders(serviceKey),
  );
  const count = parseCount(response);
  const body = await readBody(response);
  if (count != null) return { count, status: response.status };
  return { count: null, status: response.status, detail: httpError(response.status, body) };
}

function mapCatRows(rows: RawCat[]): RecentCatRow[] {
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    photo_url: row.photo_url,
    owner_id: row.owner_id,
    owner_display_name: row.profiles?.display_name ?? null,
    lifestyle: row.lifestyle ?? null,
    created_at: row.created_at,
  }));
}

async function fetchRecentProfiles(
  supabaseUrl: string,
  serviceKey: string,
  limit = 20,
): Promise<RecentListResult<RecentProfileRow>> {
  const params = new URLSearchParams({
    select: 'id,display_name,email,created_at',
    order: 'created_at.desc',
    limit: String(limit),
  });
  const response = await supabaseGet(
    `${supabaseUrl}/rest/v1/profiles?${params}`,
    rowHeaders(serviceKey),
  );
  const body = await readBody(response);
  if (!response.ok) {
    return { rows: [], error: httpError(response.status, body) };
  }
  try {
    const rows = JSON.parse(body) as RecentProfileRow[];
    return {
      rows: rows.map((row) => ({
        id: row.id,
        display_name: row.display_name ?? null,
        email: row.email ?? null,
        created_at: row.created_at,
      })),
    };
  } catch {
    return { rows: [], error: 'Réponse profils invalide' };
  }
}

async function fetchRecentCats(
  supabaseUrl: string,
  serviceKey: string,
  limit = 20,
): Promise<RecentListResult<RecentCatRow>> {
  let lastError: string | undefined;

  for (const select of CAT_SELECTS) {
    const params = new URLSearchParams({
      select,
      order: 'created_at.desc',
      limit: String(limit),
    });
    const response = await supabaseGet(
      `${supabaseUrl}/rest/v1/cats?${params}`,
      rowHeaders(serviceKey),
    );
    const body = await readBody(response);
    if (!response.ok) {
      lastError = httpError(response.status, body);
      continue;
    }
    try {
      return { rows: mapCatRows(JSON.parse(body) as RawCat[]) };
    } catch {
      lastError = 'Réponse captures invalide';
    }
  }

  return { rows: [], error: lastError };
}

export async function fetchSupabaseProductStats(): Promise<SupabaseProductStats> {
  const supabaseUrl = getSupabaseUrl();
  const serviceKey = getServiceRoleKey();

  if (!supabaseUrl || !serviceKey) {
    return {
      available: false,
      error:
        'Configure SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY sur ce service Render (Settings → Environment), puis redeploy.',
    };
  }

  const now = Date.now();
  const iso24h = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const iso7d = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

  try {
    const [
      profiles,
      cats,
      catsWithPhoto,
      catsLast24h,
      catsLast7d,
      profilesLast7d,
      domestique,
      sauvage,
      sightings,
      analyses,
      recentCats,
      recentProfiles,
    ] = await Promise.all([
      countTable(supabaseUrl, serviceKey, 'profiles'),
      countTable(supabaseUrl, serviceKey, 'cats'),
      countTable(
        supabaseUrl,
        serviceKey,
        'cats',
        countQuery({ photo_url: 'not.is.null' }),
      ),
      countTable(
        supabaseUrl,
        serviceKey,
        'cats',
        countQuery({ created_at: `gte.${iso24h}` }),
      ),
      countTable(
        supabaseUrl,
        serviceKey,
        'cats',
        countQuery({ created_at: `gte.${iso7d}` }),
      ),
      countTable(
        supabaseUrl,
        serviceKey,
        'profiles',
        countQuery({ created_at: `gte.${iso7d}` }),
      ),
      countTable(
        supabaseUrl,
        serviceKey,
        'cats',
        countQuery({ lifestyle: 'eq.domestique' }),
      ),
      countTable(
        supabaseUrl,
        serviceKey,
        'cats',
        countQuery({ lifestyle: 'eq.sauvage' }),
      ),
      countTable(supabaseUrl, serviceKey, 'sightings'),
      countTable(supabaseUrl, serviceKey, 'cat_analysis'),
      fetchRecentCats(supabaseUrl, serviceKey, 20),
      fetchRecentProfiles(supabaseUrl, serviceKey, 20),
    ]);

    const coreOk = profiles.count != null || cats.count != null;
    if (!coreOk) {
      const hint =
        profiles.detail ||
        cats.detail ||
        `HTTP profiles=${profiles.status} cats=${cats.status}`;
      return {
        available: false,
        error: `Supabase counts indisponibles (${hint}). Vérifie SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (service_role, pas anon) sur Render.`,
      };
    }

    return {
      available: true,
      profiles: profiles.count ?? undefined,
      cats: cats.count ?? undefined,
      catsWithPhoto: catsWithPhoto.count ?? undefined,
      catsLast24h: catsLast24h.count ?? undefined,
      catsLast7d: catsLast7d.count ?? undefined,
      profilesLast7d: profilesLast7d.count ?? undefined,
      domestique: domestique.count ?? undefined,
      sauvage: sauvage.count ?? undefined,
      sightings: sightings.count ?? undefined,
      analyses: analyses.count ?? undefined,
      recentCats: recentCats.rows,
      recentCatsError: recentCats.error,
      recentProfiles: recentProfiles.rows,
      recentProfilesError: recentProfiles.error,
    };
  } catch (error) {
    return {
      available: false,
      error:
        error instanceof Error
          ? error.message
          : 'Impossible de lire Supabase',
    };
  }
}
