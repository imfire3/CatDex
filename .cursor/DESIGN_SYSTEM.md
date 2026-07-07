# DESIGN_SYSTEM - CatDex

Dernière vérification code: 2026-07-07. Source canonique: `constants/design-system.ts`, re-export `constants/game.ts`.

## Langage visuel
CatDex combine Apple HIG, glassmorphism sombre, profondeur iOS et game feel type exploration mobile. Base navy, surfaces glass, accents sky/gold/capture, typographie bold, radius généreux, feedback press et reveals courts.

## Tokens canoniques
Importer depuis `@/constants/game`:
- `DS`: couleurs, space, radius, type, weight, touch, opacity, border, layout, surface.
- `TEXT`: styles display/hero/title/subtitle/body/caption/label/micro.
- `MOTION`: instant, fast 150, normal 280, slow 420, spring, springBouncy.
- `ELEVATION`: none, sm, md, lg, glow.
- `GRADIENTS`: splash, welcome, celebration, profile, map, capture, screen, primary, gold.
- `RARITY_COLORS`: commun, rare, légendaire.
- `GAME`: alias rétrocompatible très utilisé; préférer `DS` en nouveau code.

## 8pt grid
- Espacements: DS.space.xs 8, sm 12 exception, md 16, lg 24, xl 32, xxl 48, xxxl 64.
- 4px (`xxs`) seulement pour ajustements fins.
- Touch targets: DS.touch.min 44, button 48, icon 44.

## Surfaces
- Écrans: `ScreenBackground` avec gradients screen/profile/capture/welcome/celebration.
- Cartes dark: `GlassCard` avec `GAME.glass`, border `glassBorder`, elevation.
- Modales/sheets lisibles: surfaces light `DS.surface.light/card` avec texte sombre.

## Typographie
- Titres forts: poids 800/900, `TEXT.title`, `TEXT.hero`, `TEXT.display`.
- Labels: uppercase, `TEXT.label`, `letterSpacing.caps`.
- Texte FR court, naturel, actionnable.

## Dette design connue
- `constants/theme.ts` et `components/ui.tsx` sont legacy; `AuthCard` utilise encore `AUTH`.
- `GAME` alias existe pour compatibilité; ne pas introduire une troisième source.
- Reduced motion partiel: certains pulses/reveals restent à auditer.
