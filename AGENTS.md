# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

# Design System

CatDex UI must use tokens from `src/theme/` only (via `useTheme()`). Never invent hex colors, font sizes, spacing, or radii.

Luminous canvas · indigo brand (`#2D3B8F`) · turquoise accent (`#43D2C8`). Soft elevation via borders + `shadow.low|medium|floating|glow`. Fun before utility.

Full token tables: `.cursor/rules/design-system.mdc`

```ts
import { useTheme } from '@/theme';
import { Text, Button, Card } from '@/components';
```

Coat / rarity accents: `src/lib/catTheme.ts` only.
