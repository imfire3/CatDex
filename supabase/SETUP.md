# Setup Supabase pour CatDex

## 1. Créer le projet

1. Va sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Connecte-toi ou crée un compte
3. **New project**
4. Nom : `catdex`
5. Mot de passe base de données : note-le (utilisé pour `DATABASE_URL`)
6. Région : la plus proche de toi
7. Attends la fin du provisioning (~2 min)

## 2. Récupérer les clés

Dans **Project Settings → API** :

| Variable | Où la trouver |
|----------|----------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role (secret) |

Dans **Project Settings → Database → Connection string → URI** :

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | URI Postgres (mode Session ou Direct) |

Remplace `[YOUR-PASSWORD]` par le mot de passe DB du projet.

Exemple :

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://postgres.xxxxx:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

## 3. Auth (optionnel pour MVP)

Dans **Authentication → Providers** :

- Email : activé par défaut
- Google / Apple : à configurer plus tard pour les stores

Dans **Authentication → URL Configuration**, ajoute :

- `catdex://**` dans Redirect URLs

## 4. Exécuter les scripts

```bash
cd /Users/macvincent/CatDex
npm run test:all
```

Cela exécute dans l'ordre :

1. `supabase/schema.sql` — tables, RLS, zones Tokyo, RPC
2. `supabase/storage.sql` — bucket photos
3. `scripts/seed-data.mjs` — 2 users demo + 5 chats + captures
4. `scripts/test-flow.mjs` — test login, carte, ChatDex, création chat, anti-doublon

## Comptes demo créés par le seed

| Email | Mot de passe | Pseudo |
|-------|--------------|--------|
| demo.hunter@catdex.test | CatDexDemo123! | demo_hunter |
| demo.spotter@catdex.test | CatDexDemo123! | demo_spotter |

## Lancer l'app mobile

```bash
npx expo start
```

Connecte-toi avec `demo.hunter@catdex.test` / `CatDexDemo123!`
