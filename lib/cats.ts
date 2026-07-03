import { supabase } from "@/lib/supabase";
import { buildDedupKey, findNearestZone, jitterAroundCapture, jitterCoordinates } from "@/lib/zones";
import type { Cat, CreateCatInput, Zone } from "@/types/database";

export async function uploadCatPhoto(userId: string, photoUri: string) {
  const extension = photoUri.split(".").pop()?.split("?")[0] ?? "jpg";
  const filePath = `${userId}/${Date.now()}.${extension}`;
  const response = await fetch(photoUri);
  const arrayBuffer = await response.arrayBuffer();

  const { error } = await supabase.storage.from("cat-photos").upload(filePath, arrayBuffer, {
    contentType: `image/${extension === "png" ? "png" : "jpeg"}`,
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from("cat-photos").getPublicUrl(filePath);
  return data.publicUrl;
}

export async function createCatCard(
  input: CreateCatInput,
  zones: Zone[]
): Promise<Cat> {
  const zone = zones.find((item) => item.id === input.zoneId);
  if (!zone) throw new Error("Zone introuvable");

  const dedupKey = await buildDedupKey(
    input.zoneId,
    input.color,
    input.breed,
    input.pattern
  );

  const existing = await supabase
    .from("cats")
    .select("*")
    .eq("dedup_key", dedupKey)
    .maybeSingle();

  if (existing.data) {
    throw new Error("EXISTING_CAT");
  }

  const photoUrl = await uploadCatPhoto(
    (await supabase.auth.getUser()).data.user!.id,
    input.photoUri
  );

  const jitter =
    Number.isFinite(input.lat) && Number.isFinite(input.lng)
      ? jitterAroundCapture(input.lat, input.lng, dedupKey)
      : jitterCoordinates(zone, dedupKey);

  const { data, error } = await supabase.rpc("create_cat_with_capture", {
    p_name: input.name,
    p_zone_id: input.zoneId,
    p_color: input.color,
    p_breed: input.breed,
    p_pattern: input.pattern,
    p_photo_url: photoUrl,
    p_dedup_key: dedupKey,
    p_lat_approx: jitter.lat,
    p_lng_approx: jitter.lng,
    p_model_id: input.modelId ?? "tabby_short",
    p_estimated_age: input.estimatedAge,
    p_fur_length: input.furLength,
    p_rarity: input.rarity ?? "commun",
  });

  if (error) {
    if (error.code === "23505") throw new Error("EXISTING_CAT");
    throw error;
  }

  return data as Cat;
}

export async function fetchZones() {
  const { data, error } = await supabase.from("zones").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function fetchPublicCats() {
  const { data, error } = await supabase
    .from("cats")
    .select("*, zone:zones(*), creator:profiles(username, display_name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchCatById(catId: string) {
  const { data, error } = await supabase
    .from("cats")
    .select("*, zone:zones(*), creator:profiles(username, display_name)")
    .eq("id", catId)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchUserCaptures(userId: string) {
  const { data, error } = await supabase
    .from("captures")
    .select("*, cat:cats(*, zone:zones(*))")
    .eq("user_id", userId)
    .order("captured_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function addCaptureForExistingCat(catId: string, photoUri?: string) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error("Not authenticated");

  let photoUrl: string | null = null;
  if (photoUri) {
    photoUrl = await uploadCatPhoto(user.id, photoUri);
  }

  const { error } = await supabase.from("captures").insert({
    user_id: user.id,
    cat_id: catId,
    photo_url: photoUrl,
  });

  if (error && error.code !== "23505") throw error;
}

export async function resolveZoneForLocation(
  zones: Zone[],
  latitude: number,
  longitude: number
) {
  return findNearestZone(zones, latitude, longitude);
}