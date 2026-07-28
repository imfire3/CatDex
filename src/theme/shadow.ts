import { Platform, type ViewStyle } from 'react-native';

/**
 * Elevation tokens — Small / Medium / Large only.
 * Uses boxShadow on web, shadow* on native.
 */

export type ShadowToken = 'small' | 'medium' | 'large';

type ShadowStyle = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation' | 'boxShadow'
>;

const nativeShadows: Record<ShadowToken, ShadowStyle> = {
  small: {
    shadowColor: '#0E0F12',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#0E0F12',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  large: {
    shadowColor: '#0E0F12',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
};

const webShadows: Record<ShadowToken, ShadowStyle> = {
  small: { boxShadow: '0 2px 8px rgba(14, 15, 18, 0.08)' },
  medium: { boxShadow: '0 8px 24px rgba(14, 15, 18, 0.12)' },
  large: { boxShadow: '0 16px 40px rgba(14, 15, 18, 0.18)' },
};

export const shadow: Record<ShadowToken, ShadowStyle> =
  Platform.OS === 'web' ? webShadows : nativeShadows;

/** Accent-tinted elevation for FAB / discovery CTAs */
export const accentShadow: ShadowStyle =
  Platform.OS === 'web'
    ? { boxShadow: '0 8px 24px rgba(228, 87, 46, 0.35)' }
    : {
        shadowColor: '#E4572E',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 8,
      };
