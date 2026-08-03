import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl ?? process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Supabase is optional in development - will use mock auth if not configured
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase not configured. Using mock authentication. To enable Supabase:\n' +
    '1. Create a project at https://supabase.com\n' +
    '2. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file\n' +
    '3. See supabase/README.md for full setup instructions'
  );
}

const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

// Types for the database schema
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      cats: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string | null;
          coat_type: string;
          latitude: number;
          longitude: number;
          address: string | null;
          photo_url: string | null;
          sighting_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          description?: string | null;
          coat_type: string;
          latitude: number;
          longitude: number;
          address?: string | null;
          photo_url?: string | null;
          sighting_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          description?: string | null;
          coat_type?: string;
          latitude?: number;
          longitude?: number;
          address?: string | null;
          photo_url?: string | null;
          sighting_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      sightings: {
        Row: {
          id: string;
          cat_id: string;
          user_id: string;
          latitude: number;
          longitude: number;
          photo_url: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          cat_id: string;
          user_id: string;
          latitude: number;
          longitude: number;
          photo_url?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          cat_id?: string;
          user_id?: string;
          latitude?: number;
          longitude?: number;
          photo_url?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
    };
  };
};
