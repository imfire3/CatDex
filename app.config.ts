import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'CatDex',
  slug: 'catdex',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'catdex',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#1a1a2e',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.catdex.app',
    usesAppleSignIn: true,
    infoPlist: {
      NSCameraUsageDescription: 'CatDex needs camera access to photograph cats.',
      NSLocationWhenInUseUsageDescription: 'CatDex uses your location to show nearby cats on the map.',
      NSPhotoLibraryUsageDescription: 'CatDex needs photo library access to save cat photos.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#1a1a2e',
    },
    package: 'com.catdex.app',
    permissions: [
      'android.permission.CAMERA',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.POST_NOTIFICATIONS',
    ],
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    mapboxToken: process.env.EXPO_PUBLIC_MAPBOX_TOKEN,
    eas: {
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
    },
  },
});
