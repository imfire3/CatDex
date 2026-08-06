# CatDex — Engineering Audit v1

| Champ | Valeur |
|-------|--------|
| **Date** | 2026-08-06 |
| **Commit audité** | `7d3f734` (`main` = `origin/main`) |
| **Périmètre** | App Expo/RN, `server/`, `supabase/`, GitHub, Cursor |
| **Méthode** | Lecture seule du dépôt + preuves fichiers — **aucune correction appliquée** |
| **Statut** | Pré-bêta publique |

**Légende :** ✔ Conforme · ⚠ À améliorer · ❌ Critique

---

## Résumé exécutif

CatDex a une **boucle produit claire** (Explorer → Capture → Analyse → Reveal → CatDex) et une base technique **Expo 54 + Supabase + Vision Structured Outputs** crédible pour un MVP.  
Ce n’est **pas** prêt pour une bêta publique ouverte : plusieurs défauts **bloquants** (abus OpenAI, toasts invisibles, fallback qui invente un chat, RLS/storage, API « secrète » côté client).

```text
                    ┌──────────────┐
   Utilisateur ───► │ Expo App     │
                    │ (Router+Zustand)
                    └──────┬───────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
     ┌──────────┐   ┌────────────┐   ┌────────────┐
     │ Supabase │   │ Hono API   │   │ AsyncStorage│
     │ Auth+DB  │   │ /analyze   │   │ cats/auth   │
     └──────────┘   └─────┬──────┘   └────────────┘
                          ▼
                    ┌────────────┐
                    │ OpenAI     │
                    │ Vision v1  │
                    └────────────┘
```

### Verdict bêta

| Question | Réponse |
|----------|---------|
| Excellent ? | Design tokens, funnel capture, Vision prompt+schema strict, séparation serveur OpenAI |
| Acceptable ? | Architecture Expo Router / `src/`, auth mock↔réel, map native |
| Dangereux ? | `/analyze-cat` abusable, `EXPO_PUBLIC_API_SECRET`, RLS email/storage, fallback inventé |
| Ralentira dans 6 mois ? | God files (`scanner` 904, `auth` 787), dual missions, 30 doublons `* 2.*`, pas de CI |
| Avant bêta | Sécurité API + ToastHost + stop inventer un chat + RLS + nettoyer junk |
| V2 | Modèle vision dédié, OTA, missions serveur, offline, dark mode |

**Note globale : 5.8 / 10**

---

## Scores

| Domaine | Note /10 | Signal |
|---------|---------:|--------|
| Repository / Git | **5.0** | Workflow documenté ; branches Cursor orphelines ; **0 CI** |
| Architecture | **6.5** | Layers clairs ; god files ; dual systems |
| React Native | **6.0** | FlatList sous-optimisé ; ToastHost absent |
| Expo / EAS | **6.0** | SDK 54 OK ; pas d’OTA ; URL prod placeholder |
| Supabase | **6.0** | RLS core OK ; emails publics ; storage INSERT faible |
| IA / Vision | **7.0** | Schema strict fort ; fallback mock dangereux |
| Produit | **6.5** | Boucle OK ; missions/notifs trompeuses |
| UX | **6.0** | Funnel clair ; feedback toast mort |
| UI | **5.5** | Motion OK ; Skeleton/BottomSheet morts |
| Performance | **6.5** | JPEG léger ; assets/models orphelins ; rembg lourd |
| Sécurité | **4.0** | OpenAI côté serveur ✔ ; surface analyse ❌ |
| Design System | **7.5** | Tokens solides ; drift AuthShell/maps |
| Cursor AI | **5.5** | Vélocité ; dette + PRs ouvertes + junk |
| Code Quality | **5.5** | Pas de CI ; fichiers >800 L ; doublons |
| Dette Technique | **4.5** | Volume HIGH élevé pré-bêta |
| **GLOBAL** | **5.8** | |

```text
10 |                         DS
 9 |
 8 |                    IA
 7 |         Arch  Expo  Prod  Perf
 6 |    RN   UX   Supa
 5 | UI  Cursor  Quality  Git
 4 | Sécurité / Dette
 0 +--------------------------------
```

---

## PHASE 1 — Repository Health — 5.0/10

### Constats

| Item | Statut | Preuve |
|------|--------|--------|
| `main` / `develop` alignés | ✔ | Les deux à `7d3f734` |
| Workflow documenté | ✔ | `docs/GIT_WORKFLOW.md` (`main` + `develop`, PR → develop → main) |
| Tags / releases | ❌ | **Aucun tag**, aucune release GitHub |
| GitHub Actions | ❌ | **Pas de dossier** `.github/workflows` |
| Stashes | ✔ | Aucun stash actif |
| `.gitignore` secrets | ✔ | `.env`, `server/.env` ignorés |
| Branches distantes orphelines | ⚠ | ~10 `origin/cursor/*` avec commits uniques (`ahead≥1`) |
| PRs ouvertes | ⚠ | #6 cleanup, #8 map/caret, #9 keyboard (état au 2026-08-06) |
| Doublons macOS `* 2.*` | ❌ | **30 fichiers** sous `app/`, `src/`, `supabase/`, `scripts/` |
| Checkpoint dangereux | ⚠ | `cursor/refresh-app-screenshots` contient un commit junk (`.cursor`, `.env.bak`) — **non mergé** sur main (correct) |

### Branches distantes avec commits uniques (vs `origin/main`)

| Branche | ahead | Action recommandée |
|---------|------:|--------------------|
| `cursor/all-in-one` | 6 | Auditer ou archiver |
| `cursor/code-quality-cleanup-ac36` | 2 | PR #6 — review ou close |
| `cursor/map-pins-demo-a8ab` | 2 | Close / cherry-pick utile |
| `cursor/setup-openai-cat-analysis-3bc4` | 2 | Obsolète post-v1 ? |
| `cursor/refresh-app-screenshots` | 2 | Ne pas merger le checkpoint junk |
| Autres `cursor/*` / `fix/*` | 1 | Triage hebdo |
| `feature/gps-recenter`, `feature/app-canvas-*`, `docs/git-workflow` | 0 | Safe delete remote |

### Améliorations

1. ❌ Ajouter CI minimale (`typecheck` + `lint`) sur PR → `develop`/`main`.
2. ❌ Supprimer les 30 fichiers `* 2.*` + ajouter règle gitignore `* 2.*`.
3. ⚠ Clôturer / merger / archiver les branches `cursor/*` et PRs #6/#8/#9.
4. ⚠ Premier tag `v0.1.0-beta` avant TestFlight / Play internal.

---

## PHASE 2 — Architecture — 6.5/10

### Structure

```text
app/          Expo Router (écrans)
src/
  components/ UI
  store/      Zustand (auth, cats, missions, toast, mapExplore)
  lib/        API, Supabase, progression, photos…
  theme/      Design tokens
  hooks/
server/       Hono + OpenAI Vision
supabase/     SQL + migrations
docs/         Workflow, Vision, Product Book, audits/
```

### ✔ Conforme

- Séparation claire `app/` vs `src/` ; alias `@/*`.
- Pas de cycle store → screen détecté ; auth→cats via `import()` dynamique (`src/store/auth.ts`).
- Serveur Vision isolé ; clé OpenAI hors client (`docs/VISION_ANALYSIS.md`).

### ⚠ À améliorer

| Problème | Fichiers | Impact |
|----------|----------|--------|
| God screens/stores | `app/scanner.tsx` (~904 L), `src/store/auth.ts` (~787 L), `app/(tabs)/profile.tsx` (~652 L) | Maintenance, review, tests |
| Dual missions | `src/store/missions.ts` (1 quest) vs `src/lib/progression.ts` + UI `missions.tsx` | Fausse richesse produit |
| Routes sans garde auth | `scanner`, `discovery`, `cat/[id]`, `settings/*` (root Stack) | Accès hors session |
| Collision de noms | `src/lib/mapExplore.ts` vs `src/store/mapExplore.ts` | Confusion contributeurs |
| Dead paths | `app/discovery.tsx`, `src/lib/worldCats.ts` (non rendu), `CatRevealView.tsx` | Bruit |

### ❌ Critique

- **30 doublons `* 2.*`** dans l’arbre source — risque Metro/tsc, confusion Cursor.
- **`ToastHost` jamais monté** dans `app/_layout.tsx` alors que `useToastStore` est utilisé (scanner, profile, missions sync).

---

## PHASE 3 — React Native — 6.0/10

### ✔ Conforme

- Expo Router tabs + modals (`app/_layout.tsx`).
- Reanimated + `useReducedMotion` sur chemins auth/map.
- Une `FlatList` pour CatDex (`app/(tabs)/catdex.tsx`).

### ⚠ À améliorer

- FlatList sans `getItemLayout` / `windowSize` / `extraData` ; `renderItem` inline ; carte non `memo`.
- Missions / profil en `ScrollView` (OK aujourd’hui, fragile si listes croissent).
- Sous-utilisation de `memo`/`useCallback` (concentration map seulement).
- Favoris CatDex en `useState` local — non persistés.

### ❌ Critique

- Toasts silencieux (voir Phase 8).
- `scanner.tsx` multi-concerns (caméra, geo, API, steps UI) — difficile à tester.

---

## PHASE 4 — Expo — 6.0/10

### ✔ Conforme

- Expo `^54`, RN `0.81.5`, React `19.1`, `expo-router` ~6 (`package.json`).
- Plugins caméra / localisation / splash cohérents (`app.json`).
- Scripts utiles : `server`, `screenshots`, `typecheck`, `lint`.

### ⚠ À améliorer

| Item | Preuve |
|------|--------|
| Pas d’OTA | Pas de `expo-updates`, pas de `runtimeVersion` / `updates` dans `app.json` |
| EAS prod | `eas.json` → `EXPO_PUBLIC_API_URL=https://REPLACE_WITH_RENDER_OR_RAILWAY_URL` |
| `expo-secure-store` | Plugin présent, **jamais importé** ; session = AsyncStorage (`src/lib/supabase.ts`) |
| `RECORD_AUDIO` Android | Dans `app.json` sans besoin app |
| `localtunnel` | Dépendance app sans script |
| Deps mortes | Indices : `daisyui`, `@expo-google-fonts/nunito` (usage source non confirmé massif) |

### ❌ Critique (pré-prod)

- Impossible de shipper un build production EAS **sans** corriger l’URL API placeholder.

---

## PHASE 5 — Supabase — 6.0/10

### ✔ Conforme

- Tables `profiles`, `cats`, `sightings`, `cat_analysis`, `analysis_feedback`.
- Indexes geo (GIST) + owner/time.
- RLS owner sur write cats/sightings ; storage UPDATE/DELETE path-scopés.
- Split mock / réel explicite (`isSupabaseConfigured`).

### ⚠ À améliorer

- Pas de `supabase/config.toml` versionné (incertitude sur le flux CLI local).
- Policies UPDATE souvent sans `WITH CHECK` explicite.
- Pas de policy DELETE sur `cat_analysis`.
- Auto-confirm email (`supabase/migrations/20260805_auto_confirm_email.sql`) — OK MVP, faible pour bêta ouverte.
- Fonctions `SECURITY DEFINER` (`handle_new_user`, `increment_cat_views`, `find_nearby_cats`) sans `search_path` systématique.

### ❌ Critique

1. **`profiles` SELECT public** inclut **`email`** (`supabase/schema.sql`).
2. **Storage INSERT** authentifié **sans** contrainte de dossier `auth.uid()` (l’app préfixe correctement dans `src/lib/supabaseStorage.ts`, la policy ne force pas).
3. **`analysis_feedback`** INSERT avec `user_id IS NULL` + grants → spam possible.

---

## PHASE 6 — IA / Vision — 7.0/10

### ✔ Conforme

- Prompt prudent race / `unknown` : `server/src/catdexVisionPrompt.ts`.
- Structured Outputs strict : `server/src/catdexAnalysisSchema.ts`.
- Normalisation v1 + legacy : `server/src/normalizeVisionAnalysis.ts`.
- UX confirmation + corrections : `CaptureReveal.tsx`, `src/lib/analysisFeedback.ts`.
- Coût partiel : `gpt-4o-mini`, `detail: 'low'`, `max_tokens: 1400`, cutout budgeté.

### ⚠ À améliorer

- Pas de retry serveur ; pas de cache ; pas de streaming.
- `flushAnalysisFeedbackQueue` **jamais appelé**.
- `API_SECRET` optionnel — si absent, endpoint ouvert.
- Prompt injection via image adversariale : risque **inhérent** (documenter + rate-limit).

### ❌ Critique

- Sur HEIC / erreur OpenAI / clé absente : **`buildFallbackAnalysis` invente** couleur/race/nom et renvoie `mocked: true` en HTTP 200 (`server/src/index.ts`). Contredit la règle produit « never invent ». En bêta = fausses captures et pollution dataset feedback.

---

## PHASE 7 — Product Engineering — 6.5/10

| Écran | Verdict | Commentaire |
|-------|---------|-------------|
| Welcome | ✔ | Brand + CTA clairs (`welcome.tsx`) |
| Auth | ✔ | Login/signup + validation |
| Intro | ⚠ | Promet notifications ; permissions = GPS+caméra seulement |
| Permissions | ✔ | Gate nécessaire |
| Map | ✔ / ⚠ | Cœur engagement ; HUD dense ; `worldCats` non branché |
| Scanner | ✔ | Cœur MVP ; fichier trop gros |
| Reveal | ✔ | Confirmation = bon levier anti-hallucination |
| CatDex | ✔ / ⚠ | Collection OK ; favoris non persistés |
| Cat detail | ✔ | Fiche + error boundary |
| Profile | ⚠ | Un peu chargé ; utile |
| Missions | ❌ produit | UI riche vs store `first-capture` — **overpromise** |
| Settings notifs | ⚠ | Prefs locales **sans push** |
| Discovery | ❌ dead | Monté dans layout, plus dans le flow |

**Envie de capturer un autre chat ?** Oui sur Map→Scanner→Reveal. Affaibli si toasts morts + missions factices + notifs factices.

---

## PHASE 8 — UI Engineering — 5.5/10 · UX 6.0/10

| Sujet | Statut | Preuve |
|-------|--------|--------|
| Motion Reanimated | ✔ | Auth, map, loaders |
| Empty / Loading / Problem | ✔ | CatDex, PageLoading, ProblemState |
| Haptics | ⚠ | Map proximité + scanner success seulement |
| A11y | ⚠ | Labels sur contrôles clés ; couverture inégale |
| Dark mode | ⚠ | `ThemeProvider` force light ; `palette.dark = light` |
| Skeleton / BottomSheet / PhotoCard / StatCard | ⚠ | Existent, peu ou pas utilisés |
| Offline | ❌ | Pas de NetInfo ; pas de mode dégradé clair |
| Toast | ❌ | **`ToastHost` non monté** — feedback utilisateur cassé |

---

## PHASE 9 — Performance — 6.5/10

### ✔ Conforme

- Capture JPEG `quality: 0.35` + Vision `detail: 'low'`.
- Cutout rembg non bloquant (`CUTOUT_BUDGET_MS`).

### ⚠ À améliorer

- `assets/models/` ~2 Mo **sans référence code** ; world-cats + doublons `* 2.jpg`.
- Startup : chargement multi-fonts avant splash hide (`app/_layout.tsx`).
- Web : MapLibre footprint élevé (`CatMap.web.tsx`).
- Server `node_modules` ~343 Mo (rembg dominant).
- Photos en data URI / stockage local coûteux mémoire.

### Non mesuré (incertitude explicite)

- FPS map réelle, cold start device, taille IPA/AAB — **non profilés dans cet audit**.

---

## PHASE 10 — Sécurité — 4.0/10

### ✔ Conforme

- `OPENAI_API_KEY` serveur uniquement.
- Pas de `service_role` dans le client.
- `.env` gitignoré.

### ❌ Critique (bloquants bêta ouverte)

| # | Risque | Fichiers |
|---|--------|----------|
| 1 | `/analyze-cat` : CORS `*`, auth optionnelle, **pas de rate limit**, **pas de max size** image | `server/src/index.ts` |
| 2 | `EXPO_PUBLIC_API_SECRET` = **non-secret** (bundle) | `.env.example`, `src/lib/apiUrl.ts`, `src/lib/api.ts` |
| 3 | Emails profils lisibles anonymement | `supabase/schema.sql` |
| 4 | Storage INSERT non path-scoped | `supabase/schema.sql` |

### ⚠ À améliorer

- Session tokens en AsyncStorage (SecureStore disponible mais inutilisé).
- Password min 6 (`src/lib/authValidation.ts`).
- Auto-confirm email.
- Logs : pas de dump secrets détecté — rester vigilant.

---

## PHASE 11 — Cursor AI — 5.5/10

### ✔ Conforme

- `AGENTS.md` / `CLAUDE.md` pointent Expo 54 + design system.
- Règle active versionnée : `.cursor/rules/design-system.mdc`.
- `docs/GIT_WORKFLOW.md` cadre Mac + Cloud.

### ⚠ À améliorer

- Peu de rules **commitées** (1 fichier) — le reste ECC/skills a été vu en untracked local puis absent : **incertitude** sur la gouvernance Cursor durable.
- PRs IA encore ouvertes (#6, #8, #9) — revue humaine incomplète.
- Commits IA parfois « checkpoint » (junk) — besoin de discipline pre-commit.
- Vélocité → god files + dual systems (missions, reveal).

### ❌ Critique

- Doublons Finder `* 2.*` typiques d’édition parallèle agent/humain — **dette pure**.
- Risque de merger des branches `cursor/*` sans audit (ex. checkpoint screenshots).

---

## PHASE 12 — Design System — 7.5/10

### ✔ Conforme

- Tokens `src/theme/` (colors, spacing 8pt, radius, motion, shadow).
- Primary indigo / canvas `#F9F9FB` alignés Figma Cat-DEX-UI.
- Rarity isolée dans `src/lib/catTheme.ts`.

### ⚠ À améliorer

- Hex hors theme (~35 hors theme/catTheme) : AuthShell, maps overlays, welcome shadow.
- Composants morts / sous-utilisés : Skeleton, BottomSheet, PhotoCard, StatCard.
- Duplication palette Auth vs theme.

---

## Dette technique

### HIGH

| ID | Description | Pourquoi | Impact | Complexité | Solution | Est. |
|----|-------------|----------|--------|------------|----------|------|
| H1 | API analyse abusable | CORS * + secret optionnel + pas de quota | Coût OpenAI / DoS | M | Auth user JWT ou edge + rate limit + max body | 1–2 j |
| H2 | `EXPO_PUBLIC_API_SECRET` | Secret dans le bundle | Fausse sécurité | S | Retirer ; auth session Supabase côté API | 0.5 j |
| H3 | ToastHost non monté | Feedback UX mort | Bugs silencieux | S | Monter `<ToastHost />` dans `_layout` | 15 min |
| H4 | Fallback invente un chat | Contredit Vision v1 | Dataset + confiance | S | Erreur typed `analysis_failed` ; jamais mock en prod | 0.5–1 j |
| H5 | RLS email + storage INSERT | Fuite / overwrite | Privacy / abuse | M | Policies strictes | 0.5–1 j |
| H6 | 30 fichiers `* 2.*` | Pollution | Confusion / CI | S | Delete + gitignore | 30 min |
| H7 | Pas de CI | Régressions | Qualité | S | GH Action lint+tsc | 1–2 h |
| H8 | God `scanner` / `auth` | Vélocité IA | Vélocité future | L | Découper modules | 2–4 j |

### MEDIUM

| ID | Description | Solution | Est. |
|----|-------------|----------|------|
| M1 | Dual missions UI vs store | Une source de vérité (store ou server) | 1–2 j |
| M2 | Pas d’OTA / runtimeVersion | `expo-updates` | 0.5–1 j |
| M3 | EAS URL placeholder | Env EAS réels | 30 min |
| M4 | Routes sans auth guard | Redirects stack | 1–2 h |
| M5 | Dead discovery / worldCats / models | Delete ou brancher | 1–3 h |
| M6 | Favoris non persistés | Store + AsyncStorage | 1–2 h |
| M7 | SecureStore unused | Migrer session | 0.5 j |
| M8 | flush feedback jamais appelé | App boot flush | 30 min |
| M9 | Branches cursor orphelines | Cleanup remote | 1 h |
| M10 | Auto-confirm email | Activer verify avant bêta ouverte | 1–2 h |

### LOW

| ID | Description | Est. |
|----|-------------|------|
| L1 | Dark mode stub | V2 |
| L2 | FlatList perf props | 1 h |
| L3 | Hex AuthShell/maps → tokens | 2–4 h |
| L4 | Deps mortes (localtunnel, daisyui?) | 30 min |
| L5 | RECORD_AUDIO Android | 15 min |
| L6 | Tags/releases | 30 min |

---

## Quick wins (< 30 min chacun)

1. Monter `ToastHost` dans `app/_layout.tsx`.
2. Supprimer les 30 `* 2.*` + gitignore `*[\ ]2.*`.
3. Remplacer fallback inventé par erreur structurée en prod (`mocked` interdit hors `__DEV__`).
4. Corriger `eas.json` `EXPO_PUBLIC_API_URL`.
5. Appeler `flushAnalysisFeedbackQueue` au boot auth.
6. Retirer `RECORD_AUDIO` si inutile.
7. Ajouter rule gitignore pour `.env.bak`.
8. Fermer ou merger PRs #6/#8/#9 après review humaine.
9. Supprimer `app/discovery.tsx` du Stack **ou** le rebrancher clairement.
10. Ajouter badge UI visible si `analysis.mocked === true`.

---

## Roadmap (4 sprints)

### Sprint 1 — Bêta safe (sécurité + feedback)

**Objectif :** ne pas perdre d’argent OpenAI / données / confiance utilisateur.

| | |
|--|--|
| Fichiers | `server/src/index.ts`, `src/lib/api*.ts`, `app/_layout.tsx`, `supabase/schema.sql` + migration, `eas.json` |
| Risques | Casser analyse locale DEV |
| Acceptation | Rate limit + auth réelle API ; Toast visible ; plus de chat inventé en prod ; RLS email/storage corrigés ; EAS URL réelle |

### Sprint 2 — Hygiène repo & qualité

**Objectif :** dépôt « Staff-ready ».

| | |
|--|--|
| Fichiers | doublons `* 2.*`, `.github/workflows/*`, branches remote, dead code |
| Risques | Faible |
| Acceptation | CI verte sur PR ; 0 fichier `* 2.*` ; branches cursor triées ; typecheck/lint en gate |

### Sprint 3 — Produit honnête + architecture

**Objectif :** ce que l’UI promet = ce que le code fait.

| | |
|--|--|
| Fichiers | `missions.tsx`, `missions.ts`, `progression.ts`, `scanner.tsx` split, settings notifs, guards routes |
| Risques | Régression UX missions |
| Acceptation | 1 système missions ; notifs honest (ou retirées) ; scanner découpé ; guards auth stack |

### Sprint 4 — Scale & V2 foundations

**Objectif :** préparation post-bêta.

| | |
|--|--|
| Fichiers | `expo-updates`, SecureStore, offline, Edge Function Vision, collect feedback → dataset |
| Risques | Migration session ; OTA misconfig |
| Acceptation | OTA preview ; session SecureStore ; feedback flush OK ; design ADR Edge Function |

```text
Sprint1 [Sécurité+Toast+RLS] ──► Sprint2 [CI+Cleanup]
         │                              │
         └──────────► Sprint3 [Produit vrai] ──► Sprint4 [OTA+Scale]
```

---

## Checklist pré-bêta

- [ ] API analyse authentifiée + rate-limitée + max payload
- [ ] Aucun secret dans `EXPO_PUBLIC_*` sauf anon Supabase / URL
- [ ] ToastHost monté et vérifié manuellement
- [ ] Interdit inventer un chat si Vision échoue (prod)
- [ ] RLS : emails non publics ; storage INSERT path-scoped
- [ ] EAS production env complets
- [ ] CI lint + typecheck
- [ ] Doublons `* 2.*` purgés
- [ ] PRs / branches cursor nettoyées
- [ ] Privacy policy + compte suppression (⚠ **non audité en profondeur** — à vérifier avant store)

---

## Incertitudes explicites

| Sujet | Statut |
|-------|--------|
| Config Supabase dashboard (Auth providers, SMTP) | Non inspectable depuis le repo seul |
| FPS / cold start device réel | Non mesuré |
| Coût OpenAI mensuel actuel | Pas de logs billing dans le repo |
| Qualité des PRs #6/#8/#9 | Ouvertes ; diff non re-revu ligne à ligne ici |
| Contenu exact des 6 commits `cursor/all-in-one` | Compte `ahead` seulement |
| Présence réelle secrets dans l’historique git | Non scanné avec gitleaks dans cet audit |

---

## Forces à préserver

1. Boucle capture → reveal → CatDex.
2. Vision v1 prompt + JSON Schema strict.
3. Design tokens white-first indigo.
4. OpenAI hors client.
5. Workflow Git `main`/`develop` documenté.
6. Capture JPEG légère + Vision `detail: low`.

---

## Conclusion

CatDex est un **MVP sérieux** avec une identité produit forte, mais une **hygiène de production insuffisante** pour une bêta publique.  
Priorité absolue : **sécuriser l’analyse**, **réparer le feedback UI**, **arrêter d’inventer des chats**, **durcir Supabase**, **nettoyer le dépôt**. Ensuite seulement : polish produit et scale.

> Prochaine étape recommandée (hors scope de cet audit) : un **plan d’implémentation Sprint 1** validé humainement, puis PR unique `chore/beta-hardening-s1`.

---

*Document généré pour versionnement dans `docs/audits/`. Les dossiers `engineering/`, `product/`, `ux/`, `ui/`, `performance/`, `security/`, `releases/`, `postmortems/` sont prêts pour les audits suivants.*
