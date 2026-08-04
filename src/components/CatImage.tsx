import { useEffect, useState } from 'react';
import {
  Image,
  type ImageProps,
  type ImageResizeMode,
  type StyleProp,
  type ImageStyle,
} from 'react-native';

import { isCatPhotoRef, resolveCatPhotoUri } from '@/lib/photoStorage';

type Props = {
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
  accessibilityLabel?: string;
  accessibilityIgnoresInvertColors?: boolean;
  onError?: ImageProps['onError'];
};

/**
 * Loads cat photos from data:/http(s)/file: URIs or `catphoto:` IndexedDB refs.
 */
export function CatImage({
  uri,
  style,
  resizeMode = 'cover',
  accessibilityLabel,
  accessibilityIgnoresInvertColors,
  onError,
}: Props) {
  const [resolved, setResolved] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    const run = async () => {
      if (!uri || uri.startsWith('blob:') || uri.startsWith('demo')) {
        if (active) setResolved(null);
        return;
      }

      if (!isCatPhotoRef(uri)) {
        if (active) setResolved(uri);
        return;
      }

      try {
        const next = await resolveCatPhotoUri(uri);
        if (!active) {
          if (next?.startsWith('blob:')) URL.revokeObjectURL(next);
          return;
        }
        objectUrl = next?.startsWith('blob:') ? next : null;
        setResolved(next);
      } catch {
        if (active) setResolved(null);
      }
    };

    void run();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [uri]);

  if (!resolved) return null;

  return (
    <Image
      source={{ uri: resolved }}
      style={style}
      resizeMode={resizeMode}
      accessibilityLabel={accessibilityLabel}
      accessibilityIgnoresInvertColors={accessibilityIgnoresInvertColors}
      onError={onError}
    />
  );
}
