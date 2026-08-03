import { supabase } from './supabase';
import type { Cat, CatAnalysis } from '@/types/cat';

export type CreateCatInput = {
  name: string;
  description?: string;
  coatType: string;
  breed?: string;
  gender?: 'male' | 'female' | 'unknown';
  latitude: number;
  longitude: number;
  address?: string;
  photoUrl?: string;
  analysis: CatAnalysis;
};

export type UpdateCatInput = Partial<CreateCatInput>;

/**
 * Create a new cat in the database
 */
export async function createCat(input: CreateCatInput) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to create a cat');
  }

  // Insert cat
  const { data: cat, error: catError } = await supabase
    .from('cats')
    .insert({
      owner_id: user.id,
      name: input.name,
      description: input.description,
      coat_type: input.coatType,
      breed: input.breed,
      gender: input.gender,
      latitude: input.latitude,
      longitude: input.longitude,
      address: input.address,
      photo_url: input.photoUrl,
    })
    .select()
    .single();

  if (catError) throw catError;

  // Insert analysis
  const { error: analysisError } = await supabase
    .from('cat_analysis')
    .insert({
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

/**
 * Get a cat by ID with its analysis
 */
export async function getCatById(catId: string) {
  const { data, error } = await supabase
    .from('cats')
    .select(`
      *,
      cat_analysis (*),
      profiles (display_name, avatar_url)
    `)
    .eq('id', catId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all cats for the current user
 */
export async function getMyCats() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated');
  }

  const { data, error } = await supabase
    .from('cats')
    .select(`
      *,
      cat_analysis (*)
    `)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Find nearby cats using PostGIS
 */
export async function findNearbyCats(
  latitude: number,
  longitude: number,
  radiusMeters: number = 5000
) {
  const { data, error } = await supabase.rpc('find_nearby_cats', {
    user_lat: latitude,
    user_lon: longitude,
    radius_meters: radiusMeters,
  });

  if (error) throw error;
  return data;
}

/**
 * Update a cat
 */
export async function updateCat(catId: string, input: UpdateCatInput) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated');
  }

  const updateData: any = {};
  
  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.coatType !== undefined) updateData.coat_type = input.coatType;
  if (input.breed !== undefined) updateData.breed = input.breed;
  if (input.gender !== undefined) updateData.gender = input.gender;
  if (input.latitude !== undefined) updateData.latitude = input.latitude;
  if (input.longitude !== undefined) updateData.longitude = input.longitude;
  if (input.address !== undefined) updateData.address = input.address;
  if (input.photoUrl !== undefined) updateData.photo_url = input.photoUrl;

  const { data, error } = await supabase
    .from('cats')
    .update(updateData)
    .eq('id', catId)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) throw error;

  // Update analysis if provided
  if (input.analysis) {
    const { error: analysisError } = await supabase
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

/**
 * Delete a cat
 */
export async function deleteCat(catId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated');
  }

  const { error } = await supabase
    .from('cats')
    .delete()
    .eq('id', catId)
    .eq('owner_id', user.id);

  if (error) throw error;
}

/**
 * Increment cat view count
 */
export async function incrementCatViews(catId: string) {
  const { error } = await supabase.rpc('increment', {
    table_name: 'cats',
    row_id: catId,
    column_name: 'views',
  });

  if (error) {
    // Fallback if RPC doesn't exist
    const { data } = await supabase
      .from('cats')
      .select('views')
      .eq('id', catId)
      .single();

    if (data) {
      await supabase
        .from('cats')
        .update({ views: data.views + 1 })
        .eq('id', catId);
    }
  }
}

/**
 * Create a sighting
 */
export async function createSighting(
  catId: string,
  latitude: number,
  longitude: number,
  photoUrl?: string,
  notes?: string
) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated');
  }

  const { data, error } = await supabase
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

/**
 * Get sightings for a cat
 */
export async function getCatSightings(catId: string) {
  const { data, error } = await supabase
    .from('sightings')
    .select(`
      *,
      profiles (display_name, avatar_url)
    `)
    .eq('cat_id', catId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get user's sighting history
 */
export async function getMySightings() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated');
  }

  const { data, error } = await supabase
    .from('sightings')
    .select(`
      *,
      cats (name, photo_url)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
