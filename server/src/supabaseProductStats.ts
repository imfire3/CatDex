/**
 * Durable product counts from Supabase (service_role).
 */

export type RecentCatRow = {
  id: string;
  name: string;
  photo_url: string | null;
  owner_id: string;
  lifestyle: string | null;
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
  };
}

function parseCount(response: Response): number | null {
  if (!response.ok) return null;
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
): Promise<number | null> {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
    method: 'HEAD',
    headers: authHeaders(serviceKey),
  });
  return parseCount(response);
}

async function fetchRecentCats(
  supabaseUrl: string,
  serviceKey: string,
  limit = 20,
): Promise<RecentCatRow[]> {
  const params = new URLSearchParams({
    select: 'id,name,photo_url,owner_id,lifestyle,created_at',
    order: 'created_at.desc',
    limit: String(limit),
  });
  const response = await fetch(`${supabaseUrl}/rest/v1/cats?${params}`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });

  if (!response.ok) {
    // Column lifestyle may be missing before migration — retry without it.
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
    const rows = (await retry.json()) as Array<Omit<RecentCatRow, 'lifestyle'> & { lifestyle?: string }>;
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      photo_url: row.photo_url,
      owner_id: row.owner_id,
      lifestyle: row.lifestyle ?? null,
      created_at: row.created_at,
    }));
  }

  const rows = (await response.json()) as RecentCatRow[];
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    photo_url: row.photo_url,
    owner_id: row.owner_id,
    lifestyle: row.lifestyle ?? null,
    created_at: row.created_at,
  }));
}

export async function fetchSupabaseProductStats(): Promise<SupabaseProductStats> {
  const supabaseUrl = getSupabaseUrl();
  const serviceKey = getServiceRoleKey();

  if (!supabaseUrl || !serviceKey) {
    return {
      available: false,
      error:
        'Configure SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY pour les counts produit.',
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
    ]);

    return {
      available: true,
      profiles: profiles ?? undefined,
      cats: cats ?? undefined,
      catsWithPhoto: catsWithPhoto ?? undefined,
      catsLast24h: catsLast24h ?? undefined,
      catsLast7d: catsLast7d ?? undefined,
      profilesLast7d: profilesLast7d ?? undefined,
      // Lifestyle counts may be null before migration — omit rather than 0.
      domestique: domestique ?? undefined,
      sauvage: sauvage ?? undefined,
      sightings: sightings ?? undefined,
      analyses: analyses ?? undefined,
      recentCats,
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
