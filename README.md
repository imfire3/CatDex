# CatDex

A premium mobile exploration game built with React Native and Expo. Discover and document real street cats in your neighborhood — inspired by Pokémon GO, designed with Apple-level polish.

## Tech Stack

- **React Native** with **Expo SDK 57**
- **Expo Router** for file-based navigation
- **TypeScript** for type safety
- **NativeWind** (Tailwind CSS) for styling
- **React Native Reanimated** for 60 FPS animations
- **Lucide Icons** for iconography

## Screens

| Flow | Screens |
|------|---------|
| Onboarding | Splash → Welcome → Permissions → Introduction → Avatar → Username |
| Main | Map · ChatDex · Profile (bottom navigation) |
| Discovery | Camera → AI Loading → Cat Analysis → Confirmation → Celebration |
| Detail | Cat Profile |
| Social | Badges · Friends · Leaderboard |
| App | Menu · Settings |

## Getting Started

```bash
npm install
npm start
```

Press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with Expo Go.

## Design

- Minimal, premium aesthetic with glassmorphism and soft gradients
- Large floating buttons and typography
- Playful animations throughout
- Mock data only — no backend, APIs, or AI

## Project Structure

```
app/           # Expo Router screens
components/    # Reusable UI components
constants/     # Theme tokens
data/          # Mock data
```
