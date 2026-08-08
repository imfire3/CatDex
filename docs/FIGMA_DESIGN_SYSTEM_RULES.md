# CatDex — Figma Design System Rules

Agent-facing rules for Figma MCP ↔ Expo RN live in:

- **`.cursor/rules/figma-mcp.mdc`** — tokens, components, variants, MCP flow
- **`.cursor/rules/design-system.mdc`** — token tables & visual language
- **`AGENTS.md`** — short entry (also loaded by `CLAUDE.md`)

**Figma file:** https://www.figma.com/design/qIYWbKuvILi9hjSmT60rmn/Cat-DEX-UI  
**APP screens:** node `239:19` · **DS components:** Button, Input, Chip, Badge, Card, Icon Button, Avatar, Progress pages.

## Quick reference

| Concern | Location |
|---|---|
| Tokens | `src/theme/` + `useTheme()` |
| Components | `src/components/` |
| Screens | `app/` (Expo Router 54) |
| Icons | inline `react-native-svg` + `iconSize` |
| Assets | `assets/` + Metro `require()` |
| Styling | RN StyleSheet + theme tokens — **not** Tailwind |
| Rarity/coat | `src/lib/catTheme.ts` only |

## Button variants (Figma → code)

`Type`: Primary | Secondary | Tertiary | Ghost | Destructive → `variant`  
`State`: Disabled → `disabled` · Loading → `loading` · others via Pressable  
`Label` → `title`
