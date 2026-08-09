# CatDex Cursor Rules

Indexed agent rules for CatDex (Expo 54 · React Native · TypeScript · Supabase · Vision API).

## How to use

- Rules are numbered `00`–`29` so agents load product context before stack/domain details.
- Prefer these CatDex rules over generic ECC language packs when they conflict.
- Design tokens remain authoritative in `design-system.mdc` (also mirrored in `02-design-system.mdc`).
- Figma MCP flow: always follow `figma-mcp.mdc`.

## Index

| File | Scope |
|------|--------|
| [00-project-context.mdc](./00-project-context.mdc) | What CatDex is, stack, folders, non-goals |
| [01-product-design.mdc](./01-product-design.mdc) | Product principles, loops, French product voice |
| [02-design-system.mdc](./02-design-system.mdc) | Tokens, components, Figma mapping |
| [03-ux-writing.mdc](./03-ux-writing.mdc) | Copy FR, tone, error wording |
| [04-game-design.mdc](./04-game-design.mdc) | Capture ritual, reward pacing, onboarding beats |
| [05-react-native.mdc](./05-react-native.mdc) | RN patterns for this repo |
| [06-expo.mdc](./06-expo.mdc) | Expo 54 APIs, docs pin, platform notes |
| [07-typescript.mdc](./07-typescript.mdc) | TS strictness, types location |
| [08-architecture.mdc](./08-architecture.mdc) | Layers, boundaries, sync model |
| [09-supabase.mdc](./09-supabase.mdc) | Auth, RLS, storage, client usage |
| [10-openai-vision.mdc](./10-openai-vision.mdc) | Analyze pipeline, prompts, schema |
| [11-api.mdc](./11-api.mdc) | Hono server, client `api.ts`, env URLs |
| [12-navigation.mdc](./12-navigation.mdc) | expo-router, auth gates, tabs |
| [13-state-management.mdc](./13-state-management.mdc) | Zustand stores |
| [14-performance.mdc](./14-performance.mdc) | Lists, maps, images, web |
| [15-animations.mdc](./15-animations.mdc) | Motion tokens, Reanimated, reduced motion |
| [16-accessibility.mdc](./16-accessibility.mdc) | Labels, contrast, a11y |
| [17-testing.mdc](./17-testing.mdc) | Server tests, typecheck, what to add |
| [18-security.mdc](./18-security.mdc) | Secrets, JWT, RLS, uploads |
| [19-code-review.mdc](./19-code-review.mdc) | Review checklist for PRs |
| [20-quality-gate.mdc](./20-quality-gate.mdc) | Definition of done before merge |
| [21-git-workflow.mdc](./21-git-workflow.mdc) | Branches, commits, PRs |
| [22-database-schema.mdc](./22-database-schema.mdc) | Tables, migrations, PostGIS |
| [23-catdex-domain.mdc](./23-catdex-domain.mdc) | Cat / analysis domain model |
| [24-map-system.mdc](./24-map-system.mdc) | Map, pins, explore HUD |
| [25-missions-xp.mdc](./25-missions-xp.mdc) | Missions, XP, levels |
| [26-badges-achievements.mdc](./26-badges-achievements.mdc) | Badges & profile achievements |
| [27-ai-generation.mdc](./27-ai-generation.mdc) | Names, personality, generative copy |
| [28-error-handling.mdc](./28-error-handling.mdc) | `errorCatalog`, UX recovery |
| [29-release-checklist.mdc](./29-release-checklist.mdc) | Ship checklist (web/mobile/API) |

## Related docs

- `AGENTS.md` — short always-on agent brief
- `docs/GIT_WORKFLOW.md`, `docs/VISION_ANALYSIS.md`, `docs/ARCHITECTURE.md`
- `docs/FIGMA_DESIGN_SYSTEM_RULES.md`
