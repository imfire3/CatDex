# Agenda — Repo public CatDex (sans secrets)

Objectif : ce dépôt reste **visible par tout le monde**. Tout ce qui est
backend / API / secrets reste **de ton côté** (dashboards privés, variables
d’environnement, jamais Git).

Ce document est le plan d’exécution. Coche au fur et à mesure.

---

## Frontière publique / privée

| Zone | Public (ce repo) | Privé (ton côté) |
|------|------------------|------------------|
| App Expo (`app/`, `src/`) | ✅ code UI + flux | — |
| Design system (`src/theme/`) | ✅ | — |
| Schéma SQL / migrations (`supabase/`) | ✅ structure | ❌ données prod, service_role |
| API Hono (`server/`) | ✅ code open (sans clés) | ❌ `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET` |
| `.env` / `server/.env` | ❌ jamais commit | ✅ Render / Railway / machine locale |
| Projet Supabase réel (URL prod, dashboard) | ❌ ID projet masqué | ✅ ton projet |
| Déploiement stores / Render | ✅ guides génériques | ❌ credentials comptes |

**Règle d’or** : si une valeur commence par `sk-`, `eyJ` (service_role), ou
est un JWT secret / password DB → elle ne vit **jamais** dans Git.

---

## Phase 0 — Inventaire (fait)

- [x] Cartographier root docs (guides déploy / clés)
- [x] Repérer IDs projet hardcodés
- [x] Vérifier `.gitignore` pour `.env*`
- [x] Confirmer qu’aucun `.env` réel n’est tracké

---

## Phase 1 — Assainissement immédiat (cette PR)

- [x] Agenda public/privé (`docs/PUBLIC_REPO_AGENDA.md`)
- [x] `SECURITY.md` — politique secrets
- [x] `docs/FEATURES.md` — carte des fonctionnalités publiques
- [x] `CHANGELOG.md` — base release
- [x] Retirer l’ID projet Supabase hardcodé du code + docs
- [x] Renforcer `.gitignore`
- [x] README public : context + features, sans chasse aux clés
- [x] Remplacer `KEYS_TO_GET.md` par un pointeur sécurisé
- [ ] Audit `git log` / history si une vraie clé a déjà fuité (rotation)

---

## Phase 2 — Nettoyage des fichiers (docs) ✅

Trop de guides root se chevauchaient. **Fait** : une entrée README, ops sous `docs/ops/`.

| Fichier root actuel | Action |
|---------------------|--------|
| `README.md` | Garder — vitrine publique |
| `SECURITY.md` | Garder — secrets |
| `CHANGELOG.md` | Garder — releases |
| `LICENSE` | Garder |
| `KEYS_TO_GET.md` | Stub → `SECURITY.md` + `.env.example` |
| `AGENTS.md` / `CLAUDE.md` | Garder — agents |
| Anciens guides root | → `docs/ops/`, `docs/getting-started.md`, `docs/phone-quickstart.md`, `docs/ops/archive/` |

Checklist Phase 2 :

- [x] Un seul “start here” = README
- [x] Ops / deploy regroupés sous `docs/ops/`
- [x] Aucun guide ne demande de coller une vraie clé dans un fichier tracké
- [x] Liens morts corrigés après déplacements (scripts + stubs)
---

## Phase 3 — Context produit (public)

- [x] Carte des fonctionnalités (`docs/FEATURES.md`)
- [ ] Screenshots à jour dans `screenshots/` (sans données perso)
- [ ] Store listing FR déjà dans `docs/releases/` — relire sans infos privées
- [ ] Architecture publique (`docs/ARCHITECTURE.md`) — OK, pas de secrets

---

## Phase 4 — Release publique

- [ ] Tag semver (`v1.0.0-beta` …) + entrée `CHANGELOG.md`
- [ ] CI : lint + typecheck (pas de secrets dans les logs)
- [ ] Build web démo avec **anon key** publique uniquement (normale) + API URL HTTPS
- [ ] Checklist store : `docs/releases/STORE_CHECKLIST.md`
- [ ] Annonce : lien repo + ce que l’API privée fait (sans exposer les clés)

Variables **autorisées** côté app publique (préfixe `EXPO_PUBLIC_`) :

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_API_URL=
```

Variables **interdites** dans ce repo (privées, serveur uniquement) :

```env
OPENAI_API_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
# + password DB Supabase, tokens EAS/Apple/Google si privés
```

---

## Phase 5 — Backend “de ton côté”

Le code `server/` peut rester open-source (logique d’analyse). Les **clés**
et le **déploiement prod** restent privés :

1. Créer / garder le service Render (ou Railway) sur **ton** compte
2. Coller les secrets **uniquement** dans le dashboard Render
3. L’app publique ne connaît que `EXPO_PUBLIC_API_URL` (HTTPS)
4. Option plus stricte plus tard : repo privé `catdex-api` + ce repo = app seule

Checklist :

- [ ] Prod : `ALLOW_UNAUTH_ANALYZE` désactivé
- [ ] Prod : JWT Supabase vérifié sur `/analyze-cat`
- [ ] Prod : `SUPABASE_SERVICE_ROLE_KEY` seulement sur le serveur
- [ ] Rotation si une clé a été collée dans un chat / commit / screenshot

---

## Phase 6 — Qualité continue

- [ ] Pre-commit ou CI : scan secrets (`gitleaks` / `trufflehog`)
- [ ] Revue PR : pas de nouveaux IDs projet hardcodés
- [ ] Docs : chaque nouveau guide suit `SECURITY.md`
- [ ] Releases : une entrée CHANGELOG par tag

---

## Définition de “done” pour le repo public

1. Clone → `npm install` → `cp .env.example .env` → placeholders clairs
2. Aucune clé réelle, aucun ID projet prod dans le tree
3. README explique le produit + features + où mettre les env **locales**
4. Backend secrets documentés comme **hors repo**
5. CHANGELOG + agenda tenus à jour
