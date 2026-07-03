import {
  addCaptureForExistingCat,
  createCatCard,
  fetchCatById,
  fetchPublicCats,
  fetchUserCaptures,
  fetchZones,
  resolveZoneForLocation,
  uploadCatPhoto,
} from "@/lib/cats";
import { supabase } from "@/lib/supabase";
import type { Cat, CreateCatInput, Observation } from "@/types/database";

export const catsService = {
  fetchZones,
  fetchPublicCats,
  fetchCatById,
  fetchUserCaptures,
  createCatCard,
  addCaptureForExistingCat,
  uploadCatPhoto,
  resolveZoneForLocation,

  async fetchFavorites(userId: string) {
    const { data, error } = await supabase
      .from("cat_favorites")
      .select("cat_id")
      .eq("user_id", userId);
    if (error) throw error;
    return new Set((data ?? []).map((r) => r.cat_id));
  },

  async toggleFavorite(userId: string, catId: string, favorite: boolean) {
    if (favorite) {
      const { error } = await supabase
        .from("cat_favorites")
        .upsert({ user_id: userId, cat_id: catId });
      if (error) throw error;
      return;
    }
    const { error } = await supabase
      .from("cat_favorites")
      .delete()
      .eq("user_id", userId)
      .eq("cat_id", catId);
    if (error) throw error;
  },

  async fetchCatPhotos(catId: string) {
    const { data, error } = await supabase
      .from("cat_photos")
      .select("*")
      .eq("cat_id", catId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async fetchObservations(catId: string) {
    const { data, error } = await supabase
      .from("observations")
      .select("*")
      .eq("cat_id", catId)
      .order("observed_at", { ascending: false });
    if (error) throw error;
    return data as Observation[];
  },

  async addObservation(input: {
    catId: string;
    userId: string;
    note: string;
    weather?: string;
  }) {
    const { data, error } = await supabase
      .from("observations")
      .insert({
        cat_id: input.catId,
        user_id: input.userId,
        note: input.note,
        weather: input.weather ?? null,
      })
      .select("*")
      .single();
    if (error) throw error;
    return data as Observation;
  },

  async addGalleryPhoto(catId: string, userId: string, photoUri: string) {
    const photoUrl = await uploadCatPhoto(userId, photoUri);
    const { data, error } = await supabase
      .from("cat_photos")
      .insert({ cat_id: catId, user_id: userId, photo_url: photoUrl })
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  async awardCaptureXp(userId: string, amount = 150) {
    const { data, error } = await supabase.rpc("award_xp", {
      p_user_id: userId,
      p_amount: amount,
    });
    if (error) throw error;
    return data;
  },

  async searchCats(query: string, cats: Cat[]) {
    const q = query.trim().toLowerCase();
    if (!q) return cats;
    return cats.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.breed?.toLowerCase().includes(q) ||
        c.color?.toLowerCase().includes(q) ||
        c.zone?.name.toLowerCase().includes(q)
    );
  },

  async createFromCapture(input: CreateCatInput) {
    const zones = await fetchZones();
    return createCatCard(input, zones);
  },
};
