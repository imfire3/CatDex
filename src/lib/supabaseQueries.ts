import { requireSupabase } from './supabase';
import type { CatAnalysis } from '@/types/cat';

export type CreateCatInput = {
  name: string;
  description?: string;
  coatType: string;
  breed?: string;
  gender?: 'male' | 'female' | 'unknown';
  dexNumber?: number;
  latitude: number;
  longitude: number;
  address?: string;
  photoUrl?: string;
  analysis: CatAnalysis;
};

export type UpdateCatInput = Partial<CreateCatInput>;

export type RemoteCatRow = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  coat_type: string;
  breed: string | null;
  gender: string | null;
  dex_number: number | null;
  latitude: number;
  longitude: number;
  address: string | null;
  photo_url: string | null;
  sighting_count: number;
  views: number | null;
  created_at: string;
  updated_at: string;
  cat_analysis:
    | {
        color: string;
        breed: string;
        coat: string;
        description: string;
        suggested_name: string | null;
        gender: string | null;
        eyes: string | null;
        size: string | null;
        tags: string[] | null;
      }
    | {
        color: string;
        breed: string;
        coat: string;
        description: string;
        suggested_name: string | null;
        gender: string | null;
        eyes: string | null;
        size: string | null;
        tags: string[] | null;
      }[]
    | null;
};

type AnalysisRow = NonNullable<
  Exclude<RemoteCatRow['cat_analysis'], unknown[] | null>
>;

function isMissingRelationshipError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return (
    error.code === 'PGRST200' ||
    /could not find a relationship between ['"]cats['"] and ['"]cat_analysis['"]/i.test(
      error.message ?? '',
    )
  );
}

/**
 * Prefer PostgREST embed `cat_analysis (*)`.
 * If the live DB lacks the FK (PGRST200), fetch analysis in a second query.
 */
async function attachCatAnalysis(rows: RemoteCatRow[]): Promise<RemoteCatRow[]> {
  if (rows.length === 0) return rows;

  const client = requireSupabase();
  const ids = rows.map((row) => row.id);
  const { data, error } = await client
    .from('cat_analysis')
    .select(
      'cat_id, color, breed, coat, description, suggested_name, gender, eyes, size, tags',
    )
    .in('cat_id', ids);

  if (error) {
    // Table missing or RLS — keep cats usable with local fallbacks in analysisFromRow.
    console.warn('[supabase] cat_analysis lookup failed', error);
    return rows.map((row) => ({ ...row, cat_analysis: row.cat_analysis ?? null }));
  }

  const byCatId = new Map<string, AnalysisRow>();
  for (const row of data ?? []) {
    const catId = (row as { cat_id?: string }).cat_id;
    if (!catId) continue;
    byCatId.set(catId, {
      color: row.color,
      breed: row.breed,
      coat: row.coat,
      description: row.description,
      suggested_name: row.suggested_name,
      gender: row.gender,
      eyes: row.eyes,
      size: row.size,
      tags: row.tags,
    });
  }

  return rows.map((row) => ({
    ...row,
    cat_analysis: row.cat_analysis ?? byCatId.get(row.id) ?? null,
  }));
}

type CatsQueryResult = {
  data: RemoteCatRow[] | null;
  error: { code?: string; message?: string } | null;
};

async function selectCatsWithAnalysis(
  build: (select: string) => PromiseLike<CatsQueryResult>,
): Promise<RemoteCatRow[]> {
  const embedded = await build(`
      *,
      cat_analysis (*)
    `);

  if (!embedded.error) {
    return (embedded.data ?? []) as RemoteCatRow[];
  }

  if (!isMissingRelationshipError(embedded.error)) {
    throw embedded.error;
  }

  const plain = await build('*');
  if (plain.error) throw plain.error;
  return attachCatAnalysis((plain.data ?? []) as RemoteCatRow[]);
}

function analysisFromRow(row: RemoteCatRow): CatAnalysis {
  const raw = Array.isArray(row.cat_analysis) ? row.cat_analysis[0] : row.cat_analysis;
  return {
    color: raw?.color || 'Inconnue',
    breed: raw?.breed || row.breed || 'Indéterminée',
    coat: raw?.coat || row.coat_type || 'Indéterminée',
    description: raw?.description || row.description || '',
    suggestedName: raw?.suggested_name || undefined,
    gender: (raw?.gender as CatAnalysis['gender']) || (row.gender as CatAnalysis['gender']) || 'unknown',
    eyes: raw?.eyes || undefined,
    size: raw?.size || undefined,
    tags: raw?.tags || undefined,
  };
}

export function mapRemoteCatToLocal(row: RemoteCatRow, fallbackNumber: number) {
  return {
    id: row.id,
    remoteId: row.id,
    number: row.dex_number ?? fallbackNumber,
    name: row.name,
    photoUri: row.photo_url || '',
    latitude: row.latitude,
    longitude: row.longitude,
    discoveredAt: row.created_at,
    views: row.views ?? 0,
    notes: row.address || undefined,
    analysis: analysisFromRow(row),
  };
}

export async function createCat(input: CreateCatInput) {
  const client = requireSupabase();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw new Error('User must be authenticated to create a cat');
  }

  const { data: cat, error: catError } = await client
    .from('cats')
    .insert({
      owner_id: user.id,
      name: input.name,
      description: input.description,
      coat_type: input.coatType,
      breed: input.breed,
      gender: input.gender,
      dex_number: input.dexNumber,
      latitude: input.latitude,
      longitude: input.longitude,
      address: input.address,
      photo_url: input.photoUrl,
    })
    .select()
    .single();

  if (catError) throw catError;

  const { error: analysisError } = await client.from('cat_analysis').insert({
    cat_id: cat.id,
    color: input.analysis.color,
    breed: input.analysis.breed,
    coat: input.analysis.coat,
    description: input.analysis.description,
    suggested_name: input.analysis.suggestedName,
    gender: input.analysis.gender,
    eyes: input.analysis.eyes,
    size: input.analysis.size,
    tags: input.analysis.tags,
  });

  if (analysisError) throw analysisError;

  return cat;
}

export async function getCatById(catId: string) {
  const client = requireSupabase();
  const embedded = await client
    .from('cats')
    .select(
      `
      *,
      cat_analysis (*),
      profiles (display_name, avatar_url)
    `,
    )
    .eq('id', catId)
    .maybeSingle();

  if (!embedded.error) {
    return embedded.data;
  }

  if (!isMissingRelationshipError(embedded.error)) {
    throw embedded.error;
  }

  const { data, error } = await client
    .from('cats')
    .select(
      `
      *,
      profiles (display_name, avatar_url)
    `,
    )
    .eq('id', catId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return data;

  const [withAnalysis] = await attachCatAnalysis([data as RemoteCatRow]);
  return withAnalysis;
}

export async function getMyCats(): Promise<RemoteCatRow[]> {
  const client = requireSupabase();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw new Error('User must be authenticated');
  }

  return selectCatsWithAnalysis((select) =>
    client
      .from('cats')
      .select(select)
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false }) as unknown as PromiseLike<CatsQueryResult>,
  );
}

/**
 * All other players' captures (with photos) for the Explorer map.
 * RLS allows public SELECT on cats — no owner filter required for read.
 */
export async function getCommunityCats(): Promise<RemoteCatRow[]> {
  const client = requireSupabase();
  const {
    data: { user },
  } = await client.auth.getUser();

  return selectCatsWithAnalysis((select) => {
    let query = client
      .from('cats')
      .select(select)
      .not('photo_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(500);

    if (user?.id) {
      query = query.neq('owner_id', user.id);
    }

    return query as unknown as PromiseLike<CatsQueryResult>;
  });
}

export async function findNearbyCats(
  latitude: number,
  longitude: number,
  radiusMeters: number = 5000,
) {
  const client = requireSupabase();
  const { data, error } = await client.rpc('find_nearby_cats', {
    user_lat: latitude,
    user_lon: longitude,
    radius_meters: radiusMeters,
  });

  if (error) throw error;
  return data;
}

export async function updateCat(catId: string, input: UpdateCatInput) {
  const client = requireSupabase();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw new Error('User must be authenticated');
  }

  const updateData: Record<string, unknown> = {};

  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.coatType !== undefined) updateData.coat_type = input.coatType;
  if (input.breed !== undefined) updateData.breed = input.breed;
  if (input.gender !== undefined) updateData.gender = input.gender;
  if (input.dexNumber !== undefined) updateData.dex_number = input.dexNumber;
  if (input.latitude !== undefined) updateData.latitude = input.latitude;
  if (input.longitude !== undefined) updateData.longitude = input.longitude;
  if (input.address !== undefined) updateData.address = input.address;
  if (input.photoUrl !== undefined) updateData.photo_url = input.photoUrl;

  const { data, error } = await client
    .from('cats')
    .update(updateData)
    .eq('id', catId)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) throw error;

  if (input.analysis) {
    const { error: analysisError } = await client
      .from('cat_analysis')
      .update({
        color: input.analysis.color,
        breed: input.analysis.breed,
        coat: input.analysis.coat,
        description: input.analysis.description,
        suggested_name: input.analysis.suggestedName,
        gender: input.analysis.gender,
        eyes: input.analysis.eyes,
        size: input.analysis.size,
        tags: input.analysis.tags,
      })
      .eq('cat_id', catId);

    if (analysisError) throw analysisError;
  }

  return data;
}

export async function deleteCat(catId: string) {
  const client = requireSupabase();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw new Error('User must be authenticated');
  }

  const { error } = await client.from('cats').delete().eq('id', catId).eq('owner_id', user.id);

  if (error) throw error;
}

export async function incrementCatViews(catId: string) {
  const client = requireSupabase();
  const { error } = await client.rpc('increment_cat_views', { row_id: catId });

  if (error) {
    const { data } = await client.from('cats').select('views').eq('id', catId).single();
    if (data) {
      await client
        .from('cats')
        .update({ views: (data.views ?? 0) + 1 })
        .eq('id', catId);
    }
  }
}

export async function createSighting(
  catId: string,
  latitude: number,
  longitude: number,
  photoUrl?: string,
  notes?: string,
) {
  const client = requireSupabase();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw new Error('User must be authenticated');
  }

  const { data, error } = await client
    .from('sightings')
    .insert({
      cat_id: catId,
      user_id: user.id,
      latitude,
      longitude,
      photo_url: photoUrl,
      notes,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCatSightings(catId: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('sightings')
    .select(
      `
      *,
      profiles (display_name, avatar_url)
    `,
    )
    .eq('cat_id', catId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getMySightings() {
  const client = requireSupabase();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw new Error('User must be authenticated');
  }

  const { data, error } = await client
    .from('sightings')
    .select(
      `
      *,
      cats (name, photo_url)
    `,
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
