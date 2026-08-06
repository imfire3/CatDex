# CatDex Vision — stratégie d’analyse

## MVP (actuel)

```
Expo app → Hono API (`server/`) → OpenAI Vision + Structured Outputs → JSON v1 → UI confirmation
```

- La clé OpenAI reste **uniquement** côté serveur (`OPENAI_API_KEY`), jamais en `EXPO_PUBLIC_*`.
- Prompt strict : `server/src/catdexVisionPrompt.ts`
- Schéma JSON strict : `server/src/catdexAnalysisSchema.ts` (`response_format.json_schema.strict`)
- Normalisation FR : `server/src/normalizeVisionAnalysis.ts`
- Corrections utilisateur → `analysis_feedback` (Supabase) ou file locale AsyncStorage

## Phases suivantes

1. **Collecte** — prédictions + scores + corrections humaines (`analysis_feedback`)
2. **Modèle CatDex** — classifieurs spécialisés (chat réel, type, couleurs, motif, poil)
3. **Hybride** — modèle CatDex pour le factuel ; OpenAI pour nom / description / traits

Migration optionnelle : déplacer `/analyze-cat` vers une **Supabase Edge Function** (même contrat JSON), sans changer le client.

Fine-tuning vision OpenAI déconseillé (plateforme en arrêt) — préférer un modèle de vision indépendant.
