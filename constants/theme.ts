export const Colors = {
  primary: '#FF6B4A',
  primaryDark: '#E84E2E',
  accent: '#FFD166',
  lavender: '#8B5CF6',
  mint: '#10B981',
  background: '#F8F9FC',
  surface: '#FFFFFF',
  text: '#1A1F2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: 'rgba(0, 0, 0, 0.06)',
  glass: 'rgba(255, 255, 255, 0.72)',
  glassDark: 'rgba(255, 255, 255, 0.15)',
  shadow: 'rgba(0, 0, 0, 0.08)',
  mapOverlay: 'rgba(26, 31, 46, 0.4)',
};

export const Gradients = {
  primary: ['#FF8A6B', '#FF6B4A', '#E84E2E'] as const,
  sunset: ['#FFD166', '#FF8A6B', '#FF6B4A'] as const,
  twilight: ['#8B5CF6', '#6D28D9', '#4C1D95'] as const,
  ocean: ['#6EE7B7', '#34D399', '#10B981'] as const,
  sky: ['#A78BFA', '#8B5CF6', '#6D28D9'] as const,
  warm: ['#FFF5F2', '#FFE8E0', '#FFD0C2'] as const,
  dark: ['#1A1F2E', '#2D3548', '#1A1F2E'] as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Typography = {
  hero: { fontSize: 42, fontWeight: '800' as const, letterSpacing: -1 },
  title: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
  heading: { fontSize: 24, fontWeight: '700' as const },
  subheading: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 14, fontWeight: '500' as const },
  small: { fontSize: 12, fontWeight: '500' as const },
};

export const Shadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  glow: {
    shadowColor: '#FF6B4A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  float: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 16,
  },
};
