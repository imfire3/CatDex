import { createCat, getMyCats, mapRemoteCatToLocal } from '@/lib/supabaseQueries';
import { isSupabaseConfigured } from '@/lib/supabase';
import { uploadCatPhoto } from '@/lib/supabaseStorage';
import type { Cat } from '@/types/cat';

/** Push a local cat to Supabase (photo + row + analysis). Returns remote UUID. */
export async function pushCatToSupabase(cat: Cat): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  if (cat.remoteId) return cat.remoteId;

  try {
    let photoUrl: string | undefined;
    if (cat.photoUri) {
      try {
        photoUrl = await uploadCatPhoto(cat.photoUri, cat.id);
      } catch (error) {
        console.warn('[sync] photo upload failed', error);
      }
    }

    const remote = await createCat({
      name: cat.name,
      description: cat.analysis.description,
      coatType: cat.analysis.coat || 'Indéterminée',
      breed: cat.analysis.breed,
      gender: cat.analysis.gender,
      dexNumber: cat.number,
      latitude: cat.latitude,
      longitude: cat.longitude,
      address: cat.notes,
      photoUrl,
      analysis: cat.analysis,
    });

    return remote.id as string;
  } catch (error) {
    console.warn('[sync] pushCatToSupabase failed', error);
    return null;
  }
}

/** Pull the signed-in user's cats and map them into local Cat records. */
export async function pullMyCatsFromSupabase(): Promise<Cat[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const rows = await getMyCats();
    return rows.map((row, index) =>
      mapRemoteCatToLocal(row, rows.length - index),
    );
  } catch (error) {
    console.warn('[sync] pullMyCatsFromSupabase failed', error);
    return [];
  }
}

/** Merge remote cats into local list (remote wins on remoteId / same UUID). */
export function mergeRemoteCats(local: Cat[], remote: Cat[]): Cat[] {
  const byKey = new Map<string, Cat>();

  for (const cat of local) {
    byKey.set(cat.remoteId || cat.id, cat);
  }

  for (const cat of remote) {
    const key = cat.remoteId || cat.id;
    const existing = byKey.get(key);
    byKey.set(key, {
      ...existing,
      ...cat,
      photoUri: cat.photoUri || existing?.photoUri || '',
      remoteId: cat.remoteId || cat.id,
      sourceWorldId: existing?.sourceWorldId ?? cat.sourceWorldId,
    });
  }

  return [...byKey.values()].sort((a, b) => b.number - a.number);
}
