import { useEffect, useRef, useState } from 'react';
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
  onLoad?: ImageProps['onLoad'];
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
  onLoad,
}: Props) {
  const [resolved, setResolved] = useState<string | null>(null);
  const onErrorRef = useRef(onError);
  const onLoadRef = useRef(onLoad);
  onErrorRef.current = onError;
  onLoadRef.current = onLoad;

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
        if (!next) {
          onErrorRef.current?.({ nativeEvent: { error: 'resolve failed' } } as never);
        }
      } catch {
        if (active) {
          setResolved(null);
          onErrorRef.current?.({ nativeEvent: { error: 'resolve failed' } } as never);
        }
      }
    };

    void run();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // Only re-resolve when the storage URI changes — not when parent re-creates callbacks.
  }, [uri]);

  if (!resolved) return null;

  return (
    <Image
      source={{ uri: resolved }}
      style={style}
      resizeMode={resizeMode}
      accessibilityLabel={accessibilityLabel}
      accessibilityIgnoresInvertColors={accessibilityIgnoresInvertColors}
      onError={(event) => onErrorRef.current?.(event)}
      onLoad={(event) => onLoadRef.current?.(event)}
    />
  );
}
