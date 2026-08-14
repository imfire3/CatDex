import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  Image,
  Platform,
  StyleSheet,
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

const OBJECT_FIT: Record<ImageResizeMode, NonNullable<CSSProperties['objectFit']>> = {
  cover: 'cover',
  contain: 'contain',
  stretch: 'fill',
  center: 'none',
  repeat: 'none',
};

/**
 * Loads cat photos from data:/http(s)/file: URIs or `catphoto:` IndexedDB refs.
 *
 * On web, RN Image uses a background-image + opacity-0 &lt;img&gt; stack that often
 * fails to fill absolute/percentage boxes. We render a real &lt;img&gt; with object-fit
 * instead so photos always cover and center in their frame.
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

  if (Platform.OS === 'web') {
    const flat = StyleSheet.flatten(style) ?? {};
    return (
      // Real DOM img — reliable cover/center in percentage or absolute frames.
      // eslint-disable-next-line jsx-a11y/alt-text -- alt set below
      <img
        src={resolved}
        alt={accessibilityLabel ?? ''}
        draggable={false}
        onError={() =>
          onErrorRef.current?.({ nativeEvent: { error: 'load failed' } } as never)
        }
        onLoad={(event) => {
          const target = event.currentTarget;
          onLoadRef.current?.({
            nativeEvent: {
              source: {
                width: target.naturalWidth,
                height: target.naturalHeight,
                uri: resolved,
              },
            },
          } as never);
        }}
        style={{
          ...(flat as CSSProperties),
          objectFit: OBJECT_FIT[resizeMode] ?? 'cover',
          objectPosition: 'center',
          display: 'block',
        }}
      />
    );
  }

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
