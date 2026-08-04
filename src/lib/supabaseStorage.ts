import { supabase } from './supabase';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';

/**
 * Upload a cat photo to Supabase Storage
 */
export async function uploadCatPhoto(
  uri: string,
  catId: string
): Promise<string> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to upload photos');
    }

    // Get file extension
    const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${user.id}/${catId}_${Date.now()}.${ext}`;
    const contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to ArrayBuffer
    const arrayBuffer = decode(base64);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('cats')
      .upload(fileName, arrayBuffer, {
        contentType,
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('cats')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading cat photo:', error);
    throw error;
  }
}

/**
 * Upload a sighting photo to Supabase Storage
 */
export async function uploadSightingPhoto(
  uri: string,
  catId: string,
  sightingId: string
): Promise<string> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to upload photos');
    }

    // Get file extension
    const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${user.id}/sightings/${catId}_${sightingId}_${Date.now()}.${ext}`;
    const contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to ArrayBuffer
    const arrayBuffer = decode(base64);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('cats')
      .upload(fileName, arrayBuffer, {
        contentType,
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('cats')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading sighting photo:', error);
    throw error;
  }
}

/**
 * Upload a profile avatar to Supabase Storage
 */
export async function uploadAvatar(uri: string): Promise<string> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to upload avatar');
    }

    // Get file extension
    const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${user.id}/avatar.${ext}`;
    const contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to ArrayBuffer
    const arrayBuffer = decode(base64);

    // Upload to Supabase Storage (upsert to replace existing avatar)
    const { data, error } = await supabase.storage
      .from('cats')
      .upload(fileName, arrayBuffer, {
        contentType,
        upsert: true,
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('cats')
      .getPublicUrl(fileName);

    // Update profile with new avatar URL
    await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
}

/**
 * Delete a photo from Supabase Storage
 */
export async function deletePhoto(url: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to delete photos');
    }

    // Extract file path from URL
    const urlParts = url.split('/storage/v1/object/public/cats/');
    if (urlParts.length < 2) {
      throw new Error('Invalid photo URL');
    }
    
    const filePath = urlParts[1];

    // Verify the file belongs to the user
    if (!filePath.startsWith(user.id)) {
      throw new Error('You can only delete your own photos');
    }

    // Delete from storage
    const { error } = await supabase.storage
      .from('cats')
      .remove([filePath]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw error;
  }
}

/**
 * Get a signed URL for a private photo (if needed later)
 */
export async function getSignedPhotoUrl(
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from('cats')
    .createSignedUrl(path, expiresIn);

  if (error) throw error;
  
  return data.signedUrl;
}
