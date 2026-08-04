import { decode } from 'base64-arraybuffer';
import { Platform } from 'react-native';

import { isCatPhotoRef, resolveCatPhotoUri } from '@/lib/photoStorage';
import { requireSupabase } from '@/lib/supabase';

function stripDataUrl(input: string): { mimeType: string; base64: string } {
  const match = /^data:([^;]+);base64,(.+)$/s.exec(input.trim());
  if (match) return { mimeType: match[1], base64: match[2] };
  return { mimeType: 'image/jpeg', base64: input.trim() };
}

async function uriToBase64(uri: string): Promise<{ base64: string; mimeType: string }> {
  if (uri.startsWith('data:')) {
    return stripDataUrl(uri);
  }

  if (isCatPhotoRef(uri)) {
    const resolved = await resolveCatPhotoUri(uri);
    if (!resolved) throw new Error('Photo introuvable');
    return uriToBase64(resolved);
  }

  if (uri.startsWith('blob:') && typeof fetch !== 'undefined') {
    const response = await fetch(uri);
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
    return {
      mimeType: blob.type || 'image/jpeg',
      base64: btoa(binary),
    };
  }

  if (Platform.OS !== 'web') {
    const FileSystem = await import('expo-file-system');
    const legacy = FileSystem as typeof FileSystem & {
      readAsStringAsync?: (uri: string, options?: { encoding?: string }) => Promise<string>;
    };
    if (!legacy.readAsStringAsync) {
      throw new Error('Lecture de fichier indisponible');
    }
    const base64 = await legacy.readAsStringAsync(uri, { encoding: 'base64' });
    return { base64, mimeType: 'image/jpeg' };
  }

  throw new Error('Format de photo non supporté pour l’upload');
}

async function uploadToCatsBucket(path: string, uri: string, upsert = false): Promise<string> {
  const client = requireSupabase();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) throw new Error('User must be authenticated to upload photos');

  const { base64, mimeType } = await uriToBase64(uri);
  const arrayBuffer = decode(base64);
  const { error } = await client.storage.from('cats').upload(path, arrayBuffer, {
    contentType: mimeType || 'image/jpeg',
    upsert,
  });
  if (error) throw error;

  const {
    data: { publicUrl },
  } = client.storage.from('cats').getPublicUrl(path);
  return publicUrl;
}

export async function uploadCatPhoto(uri: string, catId: string): Promise<string> {
  const client = requireSupabase();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) throw new Error('User must be authenticated to upload photos');
  if (uri.startsWith('http://') || uri.startsWith('https://')) return uri;

  const fileName = `${user.id}/${catId}_${Date.now()}.jpg`;
  return uploadToCatsBucket(fileName, uri);
}

export async function uploadSightingPhoto(
  uri: string,
  catId: string,
  sightingId: string,
): Promise<string> {
  const client = requireSupabase();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) throw new Error('User must be authenticated to upload photos');
  if (uri.startsWith('http://') || uri.startsWith('https://')) return uri;

  const fileName = `${user.id}/sightings/${catId}_${sightingId}_${Date.now()}.jpg`;
  return uploadToCatsBucket(fileName, uri);
}

export async function uploadAvatar(uri: string): Promise<string> {
  const client = requireSupabase();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) throw new Error('User must be authenticated to upload avatar');

  const fileName = `${user.id}/avatar.jpg`;
  const publicUrl = await uploadToCatsBucket(fileName, uri, true);
  await client.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
  return publicUrl;
}

export async function deletePhoto(url: string): Promise<void> {
  const client = requireSupabase();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) throw new Error('User must be authenticated to delete photos');

  const urlParts = url.split('/storage/v1/object/public/cats/');
  if (urlParts.length < 2) throw new Error('Invalid photo URL');
  const filePath = urlParts[1];
  if (!filePath.startsWith(user.id)) {
    throw new Error('You can only delete your own photos');
  }

  const { error } = await client.storage.from('cats').remove([filePath]);
  if (error) throw error;
}

export async function getSignedPhotoUrl(path: string, expiresIn: number = 3600): Promise<string> {
  const client = requireSupabase();
  const { data, error } = await client.storage.from('cats').createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}
