import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

const MAX_WIDTH = 1200;
const COMPRESSION_QUALITY = 0.7;

export async function compressImage(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_WIDTH } }],
    { compress: COMPRESSION_QUALITY, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
}

export async function imageToBase64(uri: string): Promise<string> {
  return FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
}

export async function getImageSize(uri: string): Promise<{ width: number; height: number }> {
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists) throw new Error('Image file not found');
  const result = await ImageManipulator.manipulateAsync(uri, [], { format: ImageManipulator.SaveFormat.JPEG });
  return { width: result.width, height: result.height };
}

export function generateStoragePath(userId: string, catId: string): string {
  const timestamp = Date.now();
  return `${userId}/${catId}/${timestamp}.jpg`;
}
