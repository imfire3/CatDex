# UI_GUIDELINES - CatDex

## Principes obligatoires
- Apple HIG: clarté, feedback, safe areas, contrôle utilisateur, touch targets 44px+.
- Mobile first: lisible à une main, bottom actions, sessions courtes.
- Design premium: hiérarchie forte, surfaces propres, détails cohérents.
- 8pt grid et tokens DS.
- Pas de duplication UI.

## Composition type d'un écran
1. `ScreenBackground`.
2. `SafeAreaView`.
3. `ScreenHeader` si écran secondaire.
4. Sections `GlassCard`, `LinkRow`, `DailyGoalsCard`, `CatDexTile`, etc.
5. `LoadingView` / `ErrorState` / `EmptyState` selon data.
6. CTA principal clair (`FloatingButton` ou équivalent existant).

## Carte
La carte guide par zones. Toute UI carte doit préférer zone, distance générale, activité approximative et sheet explicative. Ne pas écrire d'adresse précise ou de coordonnée.

## Wording visuel
CTA préférés: "Observer", "Découvrir", "Documenter", "Ajouter au ChatDex". Garder "capture" pour routes/code existants si nécessaire.
