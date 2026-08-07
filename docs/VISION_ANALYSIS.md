# CatDex Vision — stratégie d’analyse

## MVP (actuel)

```
Photo
  → Hono /analyze-cat (JWT)
  → OpenAI Vision Structured Outputs (catdex.analysis.v1)
  → Observations (couleur, poil, morphologie, marques)
  → Gates serveur (breedPolicy + normalize)
  → Fiche CatDex (confirmable)
```

**Principe :** observer d’abord, déduire la race seulement avec preuves morphologiques.

- Prompt : `server/src/catdexVisionPrompt.ts` (observe → validate → deduce)
- Schéma : `server/src/catdexAnalysisSchema.ts` (`breed_key` whitelist MVP + `morphology`)
- Gates : `server/src/breedPolicy.ts` ( Persan sans museau plat → Européen ; medium peu confiant → Court )
- Normalisation FR : `server/src/normalizeVisionAnalysis.ts` (couleur « Roux et blanc », particularités = marques)
- Corrections utilisateur → `analysis_feedback`

## Phases suivantes

1. **Collecte** — prédictions + scores + corrections humaines (`analysis_feedback`)
2. **Modèle CatDex** — classifieurs spécialisés (chat réel, type, couleurs, motif, poil)
3. **Hybride** — modèle CatDex pour le factuel ; OpenAI pour nom / description / traits

## Auth API (Lot 0)

`POST /analyze-cat` exige un **Bearer JWT Supabase** (session utilisateur).

- Prod : JWT obligatoire + rate limit (défaut 20/h/user) + plafond image (défaut 5 Mo) + mime JPEG/PNG/WebP.
- Dev local sans auth : `ALLOW_UNAUTH_ANALYZE=1` côté `server/` uniquement (interdit en `NODE_ENV=production`).
- Le client envoie `Authorization: Bearer <access_token>` (`src/lib/api.ts`). Pas de secret dans le bundle (`EXPO_PUBLIC_API_SECRET` retiré).

Vars serveur : `SUPABASE_URL`, `SUPABASE_JWT_SECRET` (ou JWKS via URL), `ANALYZE_RATE_LIMIT`, `ANALYZE_MAX_BYTES`.

Migration optionnelle : déplacer `/analyze-cat` vers une **Supabase Edge Function** (même contrat JSON), sans changer le client.

Fine-tuning vision OpenAI déconseillé (plateforme en arrêt) — préférer un modèle de vision indépendant.
