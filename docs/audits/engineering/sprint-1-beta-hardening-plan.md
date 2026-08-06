# Sprint 1 — Beta Hardening (Implementation Plan)

| Champ | Valeur |
|-------|--------|
| **Statut** | ⏳ En attente de validation — **aucun code tant que non approuvé** |
| **Source** | `docs/audits/engineering-audit-v1.md` (commit `7d3f734` + docs) |
| **Branche proposée** | `chore/beta-hardening-s1` → PR → `develop` → `main` |
| **Durée estimée** | 2–3 jours |
| **Objectif** | Bêta ouverte sans fuite OpenAI / privacy / faux chats / feedback mort |

---

## Périmètre

### IN

| ID audit | Livrable |
|----------|----------|
| H3 | Monter `ToastHost` |
| H4 | Stop inventer un chat en prod (erreur typée) |
| H1 + H2 | Protéger `/analyze-cat` (auth session + rate limit + max body ; retirer `EXPO_PUBLIC_API_SECRET`) |
| H5 | RLS : masquer emails publics ; storage INSERT path-scoped ; feedback auth-only |
| M3 | `eas.json` URL API réelle (ou env EAS documentée) |
| M8 | `flushAnalysisFeedbackQueue` au boot |
| Quick | Badge visible si `mocked` (DEV only) |

### OUT (Sprint 2+)

- CI GitHub Actions, purge `* 2.*`, cleanup branches cursor (Sprint 2)
- Refactor `scanner` / dual missions (Sprint 3)
- OTA, SecureStore, Edge Function (Sprint 4)
- Dark mode, FlatList micro-opts

---

## Architecture cible (API)

```text
Avant:
  App ──(optionnel x-api-key EXPO_PUBLIC)──► Hono /analyze-cat ──► OpenAI
       CORS * · pas de quota · fallback invente un chat

Après:
  App ── Authorization: Bearer <supabase access_token> ──► Hono
                                                              │
                         verify JWT (SUPABASE_JWT_SECRET / JWKS)
                                                              │
                         rate limit per userId (memory/Redis later)
                                                              │
                         max body ~4–6 MB · mime allowlist
                                                              │
                         Vision OK → analysis
                         Vision fail / HEIC → { error, analysis: null }
                         DEV only → mocked fallback if ENABLE_MOCK_ANALYSIS=1
```

**Décision à valider :** auth API = **JWT Supabase utilisateur** (recommandé)  
Alternative rejetée pour S1 : garder `EXPO_PUBLIC_API_SECRET` (faux secret).

---

## Work packages (ordre d’exécution)

### WP0 — Setup branche (15 min)

1. `git checkout develop && git pull`
2. `git checkout -b chore/beta-hardening-s1`
3. Checklist manuelle DEV avant/après (scanner happy path)

### WP1 — ToastHost (15 min) — H3

| | |
|--|--|
| Fichiers | `app/_layout.tsx`, éventuellement `src/components/Toast/ToastHost.tsx` |
| Changements | Rendre `<ToastHost />` dans le root layout (après providers) |
| Acceptation | `showToast` depuis scanner/profile → toast visible |
| Risque | Z-index / safe area — faible |
| Test | Déclencher toast mock warning + success capture |

### WP2 — Ne plus inventer de chat (0.5–1 j) — H4

| | |
|--|--|
| Fichiers | `server/src/index.ts`, `src/lib/api.ts`, `app/scanner.tsx`, types `CatAnalysis` si besoin |
| Serveur | Sur HEIC / OpenAI fail / clé absente **en prod** : `200` ou `422` avec `{ error, analysis: null, mocked: false }` — **jamais** `buildFallbackAnalysis` |
| Serveur DEV | Mock uniquement si `ENABLE_MOCK_ANALYSIS=1` ou `NODE_ENV!=production` **et** flag explicite |
| Client | Si `!analysis` ou `error` → step `problem` (déjà existant) ; si `mocked===true` → badge « Analyse simulée » |
| Acceptation | Prod sans clé OpenAI → message « analyse impossible », **pas** de fiche Moka inventée |
| Risque | Casser le flow DEV local sans API — documenter `ENABLE_MOCK_ANALYSIS` |

### WP3 — Sécuriser `/analyze-cat` (1–1.5 j) — H1 H2

| | |
|--|--|
| Fichiers | `server/src/index.ts`, `src/lib/api.ts`, `src/lib/apiUrl.ts`, `.env.example`, `docs/VISION_ANALYSIS.md` |
| Auth | Exiger `Authorization: Bearer <access_token>` ; vérifier JWT Supabase ; refuser 401 si invalide |
| Rate limit | In-memory : ex. 20 req / user / heure (constantes env) ; 429 + `Retry-After` |
| Payload | Max `imageBase64` length (~4–6 MB decoded) ; mime allowlist `image/jpeg`, `image/png`, `image/webp` |
| CORS | Restreindre aux origins connus (`EXPO` web + localhost) **ou** documenter `*` seulement si mobile-only + auth JWT |
| Retirer | `EXPO_PUBLIC_API_SECRET` / `getApiSecret()` côté client |
| Env serveur | `SUPABASE_URL`, `SUPABASE_JWT_SECRET` (ou JWKS), `ANALYZE_RATE_LIMIT`, `ANALYZE_MAX_BYTES` |
| Acceptation | Requête sans token → 401 ; flood → 429 ; body énorme → 413 ; client ne ship plus de secret API |
| Risque | Auth mock locale sans Supabase — prévoir bypass DEV `ALLOW_UNAUTH_ANALYZE=1` **interdit en prod** |
| Incertitude | Vérifier exact JWT verify path avec `@supabase/supabase-js` ou `jose` — à confirmer en implémentation |

### WP4 — RLS Supabase (0.5–1 j) — H5

| | |
|--|--|
| Fichiers | Nouvelle migration `supabase/migrations/20260806_beta_rls_hardening.sql` (+ update `schema.sql`) |
| Profiles | SELECT : retirer email public — options : (A) policy `auth.uid() = id` pour full row ; (B) vue `public_profiles` sans email |
| Storage INSERT | `WITH CHECK (bucket_id = 'cats' AND (storage.foldername(name))[1] = auth.uid()::text)` |
| analysis_feedback | INSERT : `auth.uid() = user_id` **obligatoire** (plus de `user_id IS NULL`) ; revoke anon insert |
| Acceptation | Anon ne lit plus d’emails ; user A ne peut pas upload sous `userB/` ; feedback sans auth refuse |
| Risque | Casser profils publics si UI affiche email d’autrui — vérifier usages `profiles` |
| Déploiement | Appliquer migration sur projet Supabase staging puis prod |

**Décision à valider :** exposition publique des profils = **display_name + avatar seulement** (recommandé).

### WP5 — Feedback flush + EAS (30–45 min) — M8 M3

| | |
|--|--|
| Fichiers | `src/store/auth.ts` ou `_layout` boot ; `eas.json` ; `.env.example` |
| Flush | Après `initialize()` auth réussi → `flushAnalysisFeedbackQueue()` |
| EAS | Remplacer placeholder par variable documentée ; si URL inconnue : laisser commentaire + `env` EAS dashboard (pas de faux URL) |
| Acceptation | Queue locale se vide vers Supabase quand online+auth ; build prod ne pointe plus sur `REPLACE_WITH_…` |

---

## Ordre recommandé

```text
WP1 ToastHost          (quick, débloque QA feedback)
  → WP2 No fake cats   (confiance produit)
  → WP3 API auth       (coût / abuse)
  → WP4 RLS            (privacy)
  → WP5 flush + EAS    (ops)
```

Commits conventionnels suggérés :

1. `fix(ui): mount ToastHost in root layout`
2. `fix(vision): stop inventing cats when analysis fails`
3. `fix(api): require Supabase JWT and rate-limit analyze-cat`
4. `fix(supabase): harden profile email and storage insert RLS`
5. `chore: flush analysis feedback and document EAS API URL`

---

## Plan de tests

### Automatisable (minimal S1)

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] Test unitaire serveur : JWT manquant → 401 ; body trop gros → 413 (si on ajoute un petit harness)

### Manuel

| # | Scénario | Attendu |
|---|----------|---------|
| 1 | Capture chat OK (API + clé) | Fiche + toast succès |
| 2 | Toast depuis profile / mission | Visible |
| 3 | API down / clé absente (prod mode) | ProblemState, **pas** de chat inventé |
| 4 | `__DEV__` + mock flag | Badge « simulée » si mock |
| 5 | Appel curl `/analyze-cat` sans Bearer | 401 |
| 6 | 25 analyses rapides même user | 429 après quota |
| 7 | User A upload path `userB/…` | Storage refuse |
| 8 | Select profiles en anon | Pas d’email |

---

## Critères d’acceptation Sprint 1 (DoD)

- [ ] ToastHost monté ; au moins 2 toasts vérifiés manuellement
- [ ] En configuration production-like : échec Vision ≠ chat inventé
- [ ] `/analyze-cat` refuse les appels non authentifiés
- [ ] Rate limit actif et documenté
- [ ] Plus de `EXPO_PUBLIC_API_SECRET` dans le client
- [ ] Migration RLS appliquée (staging documenté)
- [ ] Feedback queue flushée au login
- [ ] `eas.json` sans URL `REPLACE_WITH_…` **ou** doc explicite « set in EAS secrets »
- [ ] PR reviewée ; typecheck + lint OK
- [ ] Notes de release bêta mises à jour (`docs/audits/releases/` optionnel)

---

## Risques & mitigations

| Risque | Mitigation |
|--------|------------|
| DEV local cassé sans Supabase | Flag `ALLOW_UNAUTH_ANALYZE` / mock **DEV only** |
| JWT verify mal configuré | Tester avec session réelle ; log `sub` only |
| UI profil casse sans email public | Grep `profiles.email` avant merge |
| Rate limit mémoire reset au restart | OK S1 ; Redis en S4 si besoin |
| CORS trop strict casse web | Allowlist localhost + domaine preview |

---

## Questions ouvertes (validation requise)

1. **Auth API** : JWT Supabase ✅ proposé — OK ?
2. **Profils publics** : cacher email partout ✅ — OK ?
3. **Quota** : 20 analyses / user / heure — trop bas / trop haut ?
4. **Max image** : 5 MB décodés — OK ?
5. **Mock DEV** : uniquement via `ENABLE_MOCK_ANALYSIS=1` — OK ?
6. **Migration Supabase** : tu appliques sur le projet cloud, ou on documente seulement le SQL dans le repo ?

---

## Après validation

Dès que tu réponds **« GO Sprint 1 »** (avec réponses aux questions si besoin), implémentation sur `chore/beta-hardening-s1` dans l’ordre WP1→WP5, sans élargir au Sprint 2.
