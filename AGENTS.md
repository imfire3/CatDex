# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

# Design System

CatDex UI must use tokens from `src/theme/` only (via `useTheme()`). Never invent hex colors, font sizes, spacing, or radii. Canvas `#F9F9FB` · white cards/CTAs · indigo brand (`#6A69F8`). Soft elevation via borders + `shadow.low|medium|floating`. Typography: **Kind Sans** via `Text variant` (`headline` / `title` / `body` / …) — never local `fontSize`.

Full token tables, naming conventions, and good/bad examples: `.cursor/rules/design-system.mdc`

Quick imports:

```ts
import { useTheme } from '@/theme';
import { Text, Button, Card } from '@/components';
```

Do not invent styles from old Figma Make exports — `src/theme/` via `useTheme()` is the only UI source of truth.

# Figma MCP (design system rules)

**File:** [Cat-DEX-UI](https://www.figma.com/design/qIYWbKuvILi9hjSmT60rmn/Cat-DEX-UI) · APP `239:19`.

Comprehensive rules (tokens, components, variants, assets, icons, styling, structure, MCP flow):

- `.cursor/rules/figma-mcp.mdc` ← **follow this for every Figma implementation**
- `docs/FIGMA_DESIGN_SYSTEM_RULES.md` ← human index

Required: `get_design_context` + `get_screenshot` → map to `useTheme()` + `@/components` (never ship Tailwind/hex from MCP as-is).
