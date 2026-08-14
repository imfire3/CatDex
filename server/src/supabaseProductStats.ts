/**
 * Durable product counts from Supabase (service_role).
 */

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
  recentProfiles?: RecentProfileRow[];
};

function getSupabaseUrl(): string | null {
  const url =
    process.env.SUPABASE_URL?.trim() ||
    process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  return url ? url.replace(/\/+$/, '') : null;
}

function getServiceRoleKey(): string | null {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || null;
}

function authHeaders(serviceKey: string): Record<string, string> {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    Prefer: 'count=exact',
    Range: '0-0',
  };
}

function parseCount(response: Response): number | null {
  if (!response.ok && response.status !== 206) return null;
  const range = response.headers.get('content-range');
  // content-range: 0-0/12 or */12
  const match = /\/(\d+|\*)\s*$/.exec(range ?? '');
  if (!match || match[1] === '*') return null;
  return Number(match[1]);
}

async function countTable(
  supabaseUrl: string,
  serviceKey: string,
  table: string,
  query = 'select=id',
): Promise<{ count: number | null; status: number; detail?: string }> {
  // GET + Range is more reliable than HEAD (some stacks drop Content-Range on HEAD).
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
    method: 'GET',
    headers: authHeaders(serviceKey),
  });
  const count = parseCount(response);
  if (count != null) return { count, status: response.status };

  let detail: string | undefined;
  try {
    detail = (await response.text()).slice(0, 180);
  } catch {
    detail = undefined;
  }
  return { count: null, status: response.status, detail };
}

async function fetchRecentProfiles(
  supabaseUrl: string,
  serviceKey: string,
  limit = 20,
): Promise<RecentProfileRow[]> {
  const params = new URLSearchParams({
    select: 'id,display_name,email,created_at',
    order: 'created_at.desc',
    limit: String(limit),
  });
  const response = await fetch(`${supabaseUrl}/rest/v1/profiles?${params}`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });
  if (!response.ok) return [];
  const rows = (await response.json()) as RecentProfileRow[];
  return rows.map((row) => ({
    id: row.id,
    display_name: row.display_name ?? null,
    email: row.email ?? null,
    created_at: row.created_at,
  }));
}

async function fetchRecentCats(
  supabaseUrl: string,
  serviceKey: string,
  limit = 20,
): Promise<RecentCatRow[]> {
  const withEmbed = new URLSearchParams({
    select:
      'id,name,photo_url,owner_id,lifestyle,created_at,profiles!cats_owner_id_fkey(display_name)',
    order: 'created_at.desc',
    limit: String(limit),
  });
  const response = await fetch(`${supabaseUrl}/rest/v1/cats?${withEmbed}`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });

  type RawCat = {
    id: string;
    name: string;
    photo_url: string | null;
    owner_id: string;
    lifestyle?: string | null;
    created_at: string;
    profiles?: { display_name?: string | null } | null;
  };

  const mapRows = (rows: RawCat[]): RecentCatRow[] =>
    rows.map((row) => ({
      id: row.id,
      name: row.name,
      photo_url: row.photo_url,
      owner_id: row.owner_id,
      owner_display_name: row.profiles?.display_name ?? null,
      lifestyle: row.lifestyle ?? null,
      created_at: row.created_at,
    }));

  if (response.ok) {
    return mapRows((await response.json()) as RawCat[]);
  }

  // Fallback without lifestyle / embed (older schemas).
  const fallback = new URLSearchParams({
    select: 'id,name,photo_url,owner_id,created_at',
    order: 'created_at.desc',
    limit: String(limit),
  });
  const retry = await fetch(`${supabaseUrl}/rest/v1/cats?${fallback}`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });
  if (!retry.ok) return [];
  return mapRows((await retry.json()) as RawCat[]);
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
        'select=id&photo_url=not.is.null',
      ),
      countTable(
        supabaseUrl,
        serviceKey,
        'cats',
        `select=id&created_at=gte.${iso24h}`,
      ),
      countTable(
        supabaseUrl,
        serviceKey,
        'cats',
        `select=id&created_at=gte.${iso7d}`,
      ),
      countTable(
        supabaseUrl,
        serviceKey,
        'profiles',
        `select=id&created_at=gte.${iso7d}`,
      ),
      countTable(
        supabaseUrl,
        serviceKey,
        'cats',
        'select=id&lifestyle=eq.domestique',
      ),
      countTable(
        supabaseUrl,
        serviceKey,
        'cats',
        'select=id&lifestyle=eq.sauvage',
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
      // Lifestyle counts may be null before migration — omit rather than 0.
      domestique: domestique.count ?? undefined,
      sauvage: sauvage.count ?? undefined,
      sightings: sightings.count ?? undefined,
      analyses: analyses.count ?? undefined,
      recentCats,
      recentProfiles,
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
