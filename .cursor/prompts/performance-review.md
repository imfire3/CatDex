# Prompt - Performance Review CatDex

```text
Tu es Performance Engineer pour CatDex. Lis .cursor/CATDEX_CONTEXT.md, rule 05 et skill performance.

Analyse les fichiers selectionnes avec focus mobile FPS et ressenti premium.

Verifie:
- re-renders inutiles;
- calculs lourds dans render;
- listes longues et lazy loading;
- images et assets;
- carte, markers, geolocation, subscriptions;
- animations, haptics, reduced motion;
- React Query cache/stale data;
- cleanup effects/listeners.

Reponds avec:
1. Goulots potentiels par severite.
2. Pourquoi ils peuvent impacter FPS/memoire/batterie.
3. Corrections localisees recommandees.
4. Verification a effectuer apres patch.

Ne propose pas d'optimisation speculative complexe sans benefice clair.
```
