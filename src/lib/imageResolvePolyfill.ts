import { Image, Platform } from 'react-native';

type AssetLike = string | number | { uri?: string; width?: number; height?: number };

/**
 * react-native-maps (and some Metro asset paths) call Image.resolveAssetSource.
 * On react-native-web that helper is often missing — polyfill before any map UI loads.
 */
export function installImageResolveAssetSourcePolyfill(): void {
  if (Platform.OS !== 'web') return;

  const image = Image as typeof Image & {
    resolveAssetSource?: (source: AssetLike) => { uri: string } | null;
    default?: { resolveAssetSource?: (source: AssetLike) => { uri: string } | null };
  };

  const polyfill = (source: AssetLike): { uri: string } | null => {
    if (source == null) return null;
    if (typeof source === 'string') return { uri: source };
    if (typeof source === 'object' && typeof source.uri === 'string') {
      return { uri: source.uri, width: source.width, height: source.height } as {
        uri: string;
      };
    }
    // Metro numeric asset ids are not resolvable on web without the registry.
    return { uri: '' };
  };

  if (typeof image.resolveAssetSource !== 'function') {
    image.resolveAssetSource = polyfill;
  }

  // Some CJS interop paths call Image.default.resolveAssetSource(...)
  if (image.default && typeof image.default.resolveAssetSource !== 'function') {
    image.default.resolveAssetSource = image.resolveAssetSource ?? polyfill;
  }
}
