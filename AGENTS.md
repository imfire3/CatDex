# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Design System

CatDex UI must use tokens from `src/theme/` only (via `useTheme()`). Never invent hex colors, font sizes, spacing, or radii.

Full token tables, naming conventions, and good/bad examples: `.cursor/rules/design-system.mdc`

Quick imports:

```ts
import { useTheme } from '@/theme';
import { Text, Button, Card } from '@/components';
```

Do not copy styles from `ChatDex Mobile App UI/` — that folder is a Figma/web reference, not the React Native source of truth.
