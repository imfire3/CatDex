import * as ImageManipulator from "expo-image-manipulator";

const MAX_WIDTH = 1280;
const COMPRESS = 0.72;

export async function compressImage(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_WIDTH } }],
    { compress: COMPRESS, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
}

export const cameraService = {
  compressImage,
};
