# CatDex

A mobile exploration game for discovering and collecting cats in the real world.

## Architecture

Modular monorepo — each gameplay system is isolated and swappable:

```
CatDex/
├── packages/shared/          # Shared types, constants, cat model definitions
├── backend/
│   └── src/modules/
│       ├── photoAnalysis/    # Simulated AI (swap for real AI later)
│       ├── xp/               # XP & level progression
│       ├── badges/           # Badge awarding logic
│       ├── missions/         # Daily & weekly missions
│       ├── seasons/          # Monthly challenges
│       └── discovery/        # Discovery orchestration
└── mobile/                   # Expo React Native app
    ├── app/                  # Screens (Map, Camera, ChatDex, Missions, Profile)
    └── components/           # 3D cat avatar, discovery animation, UI
```

## Features

- **Photo Analysis** — Simulated AI detects color, breed, age, fur length, confidence
- **3D Cats** — Predefined stylized models (black, white, orange, tabby, calico, long/short hair)
- **XP System** — Discover (100), First Discoverer (500), Daily Streak (200), New District (300)
- **Levels** — Unlock badges, profile frames, and backgrounds
- **Map** — Unknown silhouettes, 3D avatars for known cats, golden aura for popular, pulse for recent
- **Discovery Animation** — Particles, confetti, XP counter, badge unlocks
- **Cat Profile** — Photo, 3D avatar, observations, gallery, favorites, comments, stats
- **Social** — Likes, share, comments, leaderboard, friends' discoveries
- **Missions** — Daily and weekly challenges
- **Seasons** — Monthly limited badges and backgrounds

## Quick Start

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
cd packages/shared && npm run build
```

### Backend

```bash
npm run backend
# API at http://localhost:3001
```

### Mobile

```bash
cd mobile
EXPO_PUBLIC_API_URL=http://localhost:3001/api npm start
```

For physical devices, use your machine's LAN IP instead of `localhost`.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users/me` | User profile, XP, badges |
| POST | `/api/analyze` | Photo analysis preview |
| POST | `/api/discover` | Full discovery flow |
| GET | `/api/map/cats` | Map pins |
| GET | `/api/cats/:id` | Cat profile |
| POST | `/api/cats/:id/like` | Toggle like |
| POST | `/api/cats/:id/favorite` | Toggle favorite |
| POST | `/api/cats/:id/comments` | Add comment |
| GET | `/api/leaderboard` | Rankings |
| GET | `/api/friends/discoveries` | Friends' finds |
| GET | `/api/missions` | Daily & weekly missions |
| GET | `/api/badges` | All badges |
| GET | `/api/season` | Current season |
| GET | `/api/chatdex` | ChatDex collection data |

## Replacing Simulated AI

The `PhotoAnalysisService` interface in `backend/src/modules/photoAnalysis/` defines the contract. Replace `SimulatedPhotoAnalysisService` with a real implementation — no other modules need to change.

## License

MIT
