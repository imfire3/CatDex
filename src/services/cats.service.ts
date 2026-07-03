import { supabase } from '@/lib/supabase';
import { approximateCoordinates } from '@/lib/constants';
import { compressImage, generateStoragePath } from '@/utils/image';
import type {
  Cat,
  CatWithPhoto,
  CreateCatInput,
  NearbyCat,
  ChatDexFilters,
} from '@/types';

export const catsService = {
  async getNearbyCats(lat: number, lng: number, radiusKm = 5): Promise<NearbyCat[]> {
    const { data, error } = await supabase.rpc('get_nearby_cats', {
      user_lat: lat,
      user_lng: lng,
      radius_km: radiusKm,
    });
    if (error) throw error;
    return data ?? [];
  },

  async getCat(catId: string): Promise<CatWithPhoto | null> {
    const { data, error } = await supabase
      .from('cats')
      .select(`
        *,
        photos (*)
      `)
      .eq('id', catId)
      .single();
    if (error) throw error;

    const primaryPhoto = data.photos?.find((p: { is_primary: boolean }) => p.is_primary);
    return {
      ...data,
      primary_photo_url: primaryPhoto?.public_url ?? data.photos?.[0]?.public_url ?? null,
      photos: data.photos,
    };
  },

  async getAllCats(userId?: string): Promise<CatWithPhoto[]> {
    let query = supabase
      .from('cats')
      .select(`
        *,
        photos (*),
        observations (id)
      `)
      .order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    let favoriteIds: Set<string> = new Set();
    if (userId) {
      const { data: favs } = await supabase
        .from('favorites')
        .select('cat_id')
        .eq('user_id', userId);
      favoriteIds = new Set(favs?.map((f) => f.cat_id) ?? []);
    }

    return (data ?? []).map((cat) => {
      const primaryPhoto = cat.photos?.find((p: { is_primary: boolean }) => p.is_primary);
      return {
        ...cat,
        primary_photo_url: primaryPhoto?.public_url ?? cat.photos?.[0]?.public_url ?? null,
        is_favorite: favoriteIds.has(cat.id),
        observation_count: cat.observations?.length ?? 0,
      };
    });
  },

  async filterCats(cats: CatWithPhoto[], filters: ChatDexFilters): Promise<CatWithPhoto[]> {
    let filtered = [...cats];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.breed?.toLowerCase().includes(search) ||
          c.color?.toLowerCase().includes(search) ||
          c.location_name?.toLowerCase().includes(search)
      );
    }

    if (filters.rarity !== 'all') {
      filtered = filtered.filter((c) => c.rarity === filters.rarity);
    }

    if (filters.breed !== 'all') {
      filtered = filtered.filter((c) => c.breed === filters.breed);
    }

    if (filters.favoritesOnly) {
      filtered = filtered.filter((c) => c.is_favorite);
    }

    switch (filters.sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rarity':
        const order = { legendary: 0, rare: 1, uncommon: 2, common: 3 };
        filtered.sort((a, b) => (order[a.rarity] ?? 4) - (order[b.rarity] ?? 4));
        break;
      case 'date':
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return filtered;
  },

  async createCat(userId: string, input: CreateCatInput): Promise<CatWithPhoto> {
    const approx = approximateCoordinates(input.lat, input.lng);
    const compressedUri = await compressImage(input.photoUri);

    const { data: cat, error: catError } = await supabase
      .from('cats')
      .insert({
        name: input.name,
        description: input.description,
        owner_id: userId,
        first_observer_id: userId,
        approximate_lat: approx.lat,
        approximate_lng: approx.lng,
        location_name: input.location_name,
        color: input.color,
        breed: input.breed,
        rarity: input.rarity ?? 'common',
      })
      .select()
      .single();
    if (catError) throw catError;

    const storagePath = generateStoragePath(userId, cat.id);
    const photo = await this.uploadPhoto(userId, cat.id, compressedUri, storagePath, true);

    await supabase.from('observations').insert({
      cat_id: cat.id,
      observer_id: userId,
      approximate_lat: approx.lat,
      approximate_lng: approx.lng,
      xp_earned: 25,
      notes: 'First discovery',
    });

    return {
      ...cat,
      primary_photo_url: photo.public_url,
      photos: [photo],
    };
  },

  async uploadPhoto(
    userId: string,
    catId: string,
    uri: string,
    storagePath?: string,
    isPrimary = false
  ) {
    const path = storagePath ?? generateStoragePath(userId, catId);
    const compressedUri = await compressImage(uri);

    const response = await fetch(compressedUri);
    const blob = await response.blob();
    const arrayBuffer = await new Response(blob).arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from('cat-photos')
      .upload(path, arrayBuffer, { contentType: 'image/jpeg', upsert: false });
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from('cat-photos').getPublicUrl(path);

    const { data: photo, error: photoError } = await supabase
      .from('photos')
      .insert({
        cat_id: catId,
        user_id: userId,
        storage_path: path,
        public_url: urlData.publicUrl,
        is_primary: isPrimary,
      })
      .select()
      .single();
    if (photoError) throw photoError;

    return photo;
  },

  async observeCat(
    userId: string,
    catId: string,
    lat: number,
    lng: number,
    notes?: string
  ) {
    const approx = approximateCoordinates(lat, lng);
    const { data, error } = await supabase
      .from('observations')
      .insert({
        cat_id: catId,
        observer_id: userId,
        approximate_lat: approx.lat,
        approximate_lng: approx.lng,
        xp_earned: 10,
        notes,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getUserCats(userId: string): Promise<CatWithPhoto[]> {
    const { data, error } = await supabase
      .from('cats')
      .select(`*, photos (*)`)
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;

    return (data ?? []).map((cat) => {
      const primaryPhoto = cat.photos?.find((p: { is_primary: boolean }) => p.is_primary);
      return {
        ...cat,
        primary_photo_url: primaryPhoto?.public_url ?? cat.photos?.[0]?.public_url ?? null,
      };
    });
  },
};
