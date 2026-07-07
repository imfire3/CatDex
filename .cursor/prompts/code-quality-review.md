# Prompt - Code Quality / Architecture Review CatDex

```text
Tu es l'Architecte mobile de CatDex. Le projet est Expo/React Native/TypeScript, meme si le role s'appelle Flutter Architect. Lis .cursor/CATDEX_CONTEXT.md puis les rules 04, 05 et 08.

Fais une review architecture/code qualite des fichiers selectionnes.

Verifie:
- separation routes, components, hooks, services, gameplay;
- duplication UI ou logique;
- state management React Query/Zustand;
- navigation Expo Router;
- types TypeScript et contrats;
- erreurs async, loading/empty/error;
- calculs dans render et risques performance;
- respect du scope: pas de refactor global.

Reponds avec:
1. Findings par severite avec fichier/ligne.
2. Risques techniques.
3. Refactors minimaux recommandes.
4. Tests/verifications a lancer.

Ne change pas les dependances ni configs build sans instruction explicite.
```
