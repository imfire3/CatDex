# CatDex

A location-based cat discovery app built with Expo, Supabase, and Mapbox. Discover, photograph, and catalog cats in your neighborhood — like a Pokédex for cats.

## Tech Stack

- **Expo** (SDK 52) + React Native
- **Supabase** — Auth, Database, Storage, Realtime
- **Mapbox** — Interactive maps with approximate cat locations
- **Expo Camera** — Photo capture with compression
- **Expo Location** — GPS with privacy-safe coordinate rounding
- **React Query** — Server state management
- **Zustand** — Client state management
- **MMKV** — Offline cache and upload queue

## Features

- **Authentication** — Google, Apple, Email, and Anonymous (guest) modes
- **Map** — Real GPS, nearby cats with approximate positions only
- **Camera** — Take, compress, preview, retry, and upload cat photos
- **Cat Creation** — Photo upload, metadata, location, timestamp, owner tracking
- **ChatDex** — Synced catalog with search, filters, and favorites
- **Profile** — Real XP, statistics, badges, and streak tracking
- **Friends** — Search, add, accept requests, and leaderboard
- **Notifications** — Nearby cats, friend discoveries, daily streaks
- **Offline Mode** — Cache nearby cats, queue uploads, automatic sync

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Supabase project
- Mapbox access token

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/imfire3/CatDex.git
   cd CatDex
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Fill in your credentials in `.env`:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   EXPO_PUBLIC_MAPBOX_TOKEN=pk.your-mapbox-token
   ```

5. Set up the database:
   ```bash
   # Install Supabase CLI, then:
   supabase link --project-ref your-project-ref
   supabase db push
   ```

6. Configure Supabase Auth providers (Google, Apple) in your Supabase dashboard.

7. Start the app:
   ```bash
   npx expo start
   ```

## Project Structure

```
app/                    # Expo Router screens
  (auth)/               # Login, Register
  (tabs)/               # Map, ChatDex, Camera, Friends, Profile
  cat/[id].tsx          # Cat detail
  create-cat.tsx        # Cat creation flow
  notifications.tsx     # Notifications
src/
  components/           # Reusable UI components
  hooks/                # React Query hooks
  lib/                  # Supabase, MMKV, QueryClient, constants
  providers/            # App providers
  services/             # Business logic services
  stores/               # Zustand stores
  theme/                # Colors, spacing, typography
  types/                # TypeScript types
  utils/                # Image compression, location helpers
supabase/
  migrations/           # Database schema and RLS policies
```

## Architecture

- **Clean architecture** with separated concerns: services handle business logic, hooks manage data fetching, stores manage UI state
- **Strict TypeScript** throughout with database types
- **Privacy-first location** — coordinates rounded to ~111m precision
- **Offline-first** — MMKV cache for nearby cats, upload queue with automatic sync on reconnect
- **Production-ready** — RLS policies, triggers for XP/badges, push notifications

## Database Schema

- `profiles` — User profiles with XP, level, streak
- `cats` — Cat records with approximate location
- `photos` — Cat photos in Supabase Storage
- `observations` — Discovery records with XP rewards
- `badges` / `user_badges` — Achievement system
- `friends` — Friend requests and connections
- `favorites` — User favorite cats
- `notifications` — In-app and push notifications

## License

MIT
