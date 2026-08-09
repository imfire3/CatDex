/**
 * Durable product counts from Supabase (service_role).
 */

export type SupabaseProductStats = {
  available: boolean;
  error?: string;
  profiles?: number;
  cats?: number;
  sightings?: number;
  analyses?: number;
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

async function countTable(
  supabaseUrl: string,
  serviceKey: string,
  table: string,
): Promise<number | null> {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/${table}?select=id`,
    {
      method: 'HEAD',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: 'count=exact',
      },
    },
  );

  if (!response.ok) return null;
  const range = response.headers.get('content-range');
  // content-range: 0-0/12 or */12
  const match = /\/(\d+|\*)\s*$/.exec(range ?? '');
  if (!match || match[1] === '*') return null;
  return Number(match[1]);
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

  try {
    const [profiles, cats, sightings, analyses] = await Promise.all([
      countTable(supabaseUrl, serviceKey, 'profiles'),
      countTable(supabaseUrl, serviceKey, 'cats'),
      countTable(supabaseUrl, serviceKey, 'sightings'),
      countTable(supabaseUrl, serviceKey, 'cat_analysis'),
    ]);

    return {
      available: true,
      profiles: profiles ?? undefined,
      cats: cats ?? undefined,
      sightings: sightings ?? undefined,
      analyses: analyses ?? undefined,
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
