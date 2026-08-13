# Clés & secrets — ne pas committer

Ce fichier est un **pointeur**. Les vraies clés restent **de ton côté**
(local `.env` + dashboards), jamais dans ce repo public.

## Faire

1. Lis **[SECURITY.md](./SECURITY.md)** — frontière public / privé
2. Copie les exemples :
   ```bash
   cp .env.example .env
   cp server/.env.example server/.env
   ```
3. Remplis les valeurs depuis :
   - [Supabase](https://supabase.com/dashboard) → Settings → API  
     (`URL`, `anon` pour l’app ; `service_role` + JWT secret **uniquement** dans `server/.env` / Render)
   - [OpenAI](https://platform.openai.com/api-keys) → clé dans `server/.env` / Render **uniquement**
4. Vérifie que `git status` ne liste **pas** `.env` ni `server/.env`

## Ne pas faire

- Coller une clé `sk-…` ou `service_role` dans un markdown du repo
- Hardcoder un ID de projet Supabase dans le code
- Committer `.env`, screenshots de dashboards, ou exports de secrets

## Suite

- Agenda : [`docs/PUBLIC_REPO_AGENDA.md`](./docs/PUBLIC_REPO_AGENDA.md)
- Features : [`docs/FEATURES.md`](./docs/FEATURES.md)
- Setup Supabase (placeholders) : [`docs/ops/SUPABASE_SETUP.md`](./docs/ops/SUPABASE_SETUP.md)
- Démarrage : [`docs/getting-started.md`](./docs/getting-started.md)
