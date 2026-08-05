import { Image, Platform } from 'react-native';

type AssetLike =
  | string
  | number
  | { uri?: string; width?: number; height?: number }
  | null
  | undefined;

function polyfillResolveAssetSource(source: AssetLike): { uri: string } | null {
  if (source == null) return null;
  if (typeof source === 'string') return { uri: source };
  if (typeof source === 'object' && typeof source.uri === 'string') {
    return { uri: source.uri };
  }
  return { uri: '' };
}

function patchImageModule(image: unknown): void {
  if (!image || typeof image !== 'object') return;
  const target = image as {
    resolveAssetSource?: typeof polyfillResolveAssetSource;
    default?: { resolveAssetSource?: typeof polyfillResolveAssetSource };
  };

  if (typeof target.resolveAssetSource !== 'function') {
    target.resolveAssetSource = polyfillResolveAssetSource;
  }
  if (target.default && typeof target.default.resolveAssetSource !== 'function') {
    target.default.resolveAssetSource = target.resolveAssetSource;
  }
}

/**
 * react-native-maps calls Image.resolveAssetSource; on web it is often missing.
 * Install before any map / marker module loads.
 */
export function installImageResolveAssetSourcePolyfill(): void {
  if (Platform.OS !== 'web') return;

  patchImageModule(Image);

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const rn = require('react-native') as { Image?: unknown };
    patchImageModule(rn.Image);
  } catch {
    // ignore
  }
}
