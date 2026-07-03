import { supabase } from '@/lib/supabase';
import type { Favorite, CatWithPhoto } from '@/types';

export const favoritesService = {
  async getFavorites(userId: string): Promise<CatWithPhoto[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        cat:cats (
          *,
          photos (*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;

    return (data ?? []).map((fav) => {
      const cat = fav.cat as CatWithPhoto;
      const primaryPhoto = cat.photos?.find((p) => p.is_primary);
      return {
        ...cat,
        is_favorite: true,
        primary_photo_url: primaryPhoto?.public_url ?? cat.photos?.[0]?.public_url ?? null,
      };
    });
  },

  async toggleFavorite(userId: string, catId: string): Promise<boolean> {
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('cat_id', catId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase.from('favorites').delete().eq('id', existing.id);
      if (error) throw error;
      return false;
    }

    const { error } = await supabase.from('favorites').insert({ user_id: userId, cat_id: catId });
    if (error) throw error;
    return true;
  },

  async isFavorite(userId: string, catId: string): Promise<boolean> {
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('cat_id', catId)
      .maybeSingle();
    return !!data;
  },
};
