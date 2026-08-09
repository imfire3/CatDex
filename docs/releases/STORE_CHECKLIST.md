# CatDex — Checklist store (TestFlight / Play)

## Prérequis comptes

- [ ] Apple Developer Program (99 €/an) — bundle `com.catdex.app`
- [ ] Google Play Console (25 $ one-shot) — package `com.catdex.app`
- [ ] Expo / EAS : `npx eas login` (owner `imfire`, projectId dans `app.json`)

## Backend prod

- [ ] Migration RLS Lot 0 appliquée (`supabase/migrations/20260807_lot0_security.sql`)
- [ ] API Render `https://catdex-api.onrender.com` healthy (`/health`)
- [ ] Env API : `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_JWT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `NODE_ENV=production`
- [ ] `ALLOW_UNAUTH_ANALYZE` **absent** en prod
- [ ] App `.env` / EAS secrets : `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_API_URL`

## Builds

```bash
# Preview interne (recommandé avant prod)
npx eas build --platform ios --profile preview
npx eas build --platform android --profile preview

# Production store
npx eas build --platform all --profile production
npx eas submit --platform ios --profile production
npx eas submit --platform android --profile production
```

- [ ] Build iOS installable (TestFlight)
- [ ] Build Android APK/AAB installable (internal testing)

## Légal / App Review

- [ ] Politique confidentialité accessible **dans l’app** (`Paramètres → Politique`)
- [ ] Conditions accessibles dans l’app
- [ ] **Suppression de compte** in-app fonctionne (Paramètres → Supprimer)
- [ ] Textes permissions caméra / photos / localisation déjà dans `app.json`
- [ ] Sign in with Apple activé dans Supabase **si** Google OAuth est proposé sur iOS
- [ ] URL privacy / support pour la fiche store (voir `STORE_LISTING.fr.md`)

## Produit honnête

- [ ] Missions = progression locale (pas de faux push)
- [ ] Écran Notifications annonce clairement « push bientôt »
- [ ] Screenshots à jour dans `screenshots/`

## Smoke test device

- [ ] Login e-mail
- [ ] Carte + GPS
- [ ] Scanner → analyse → fiche dans CatDex
- [ ] Toast visible sur erreur / succès
- [ ] Suppression de compte (compte de test)
