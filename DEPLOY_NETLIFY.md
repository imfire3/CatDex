# 🚀 Déploiement sur Netlify

Ce guide explique comment déployer CatDex sur Netlify.

## 📋 Prérequis

- Un compte Netlify (gratuit)
- Un compte GitHub (le dépôt CatDex)
- Les variables d'environnement Supabase configurées

## 🔧 Configuration

### 1. Connexion à Netlify

1. Allez sur [netlify.com](https://www.netlify.com/)
2. Connectez-vous avec votre compte GitHub
3. Cliquez sur "Add new site" → "Import an existing project"
4. Sélectionnez le dépôt **imfire3/CatDex**

### 2. Configuration du build

Netlify détectera automatiquement le fichier `netlify.toml` qui contient :

```toml
[build]
  command = "npx expo export --platform web"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
```

### 3. Variables d'environnement

Dans le dashboard Netlify, allez dans :
**Site settings → Environment variables**

Ajoutez les variables suivantes :

```bash
# Supabase (requis)
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key

# API CatDex (requis)
EXPO_PUBLIC_API_URL=https://catdex-api.onrender.com

# Optionnel : OAuth
EXPO_PUBLIC_AUTH_GOOGLE=true
EXPO_PUBLIC_AUTH_APPLE=true
```

### 4. Configuration des fonctions serverless (optionnel)

Le fichier `netlify.toml` configure automatiquement les fonctions :

```toml
[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"
  included_files = ["shared/**"]
```

Les fonctions disponibles :
- `/analyze-cat` - Analyse d'image via OpenAI Vision
- `/health` - Health check de l'API

## 🚀 Déploiement

### Déploiement automatique

Une fois configuré, Netlify déploie automatiquement :
- À chaque push sur la branche `main`
- Pour chaque Pull Request (preview deploy)

### Déploiement manuel

Depuis votre machine locale :

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Se connecter
netlify login

# Déployer
netlify deploy --prod
```

## 🔍 Vérification

Après le déploiement, vérifiez :

1. **Build réussi** : Le build Netlify doit être en succès (vert)
2. **App accessible** : L'URL Netlify doit charger l'application
3. **Variables d'environnement** : Vérifier que Supabase fonctionne
4. **Fonctions serverless** : Tester `/health` et `/analyze-cat`

### Tests rapides

```bash
# Health check
curl https://votre-site.netlify.app/health

# Vérifier que l'app charge
curl -I https://votre-site.netlify.app
```

## 📝 Notes importantes

### Ce qui a changé dans cette PR

✅ **Scanner** : L'import d'image depuis la galerie a été retiré
- Les utilisateurs doivent capturer les chats en temps réel avec la caméra
- Cela correspond mieux à l'expérience CatDex (exploration → capture)

✅ **Rapport de bug** : L'import d'image reste disponible dans `settings/report.tsx`
- Utile pour joindre des captures d'écran aux rapports

### Sécurité

Le fichier `netlify.toml` configure les headers de sécurité :

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### Cache

Les assets statiques sont cachés pour 1 an :

```toml
[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

L'index.html n'est jamais caché pour garantir les mises à jour :

```toml
[[headers]]
  for = "/index.html"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"
```

## 🆘 Dépannage

### Build échoue

Si le build échoue :

1. Vérifier les logs dans Netlify → Deploys → Deploy log
2. Tester localement : `npm run web:build`
3. Vérifier que Node.js 20 est utilisé

### Variables d'environnement manquantes

Si l'app ne se connecte pas à Supabase :

1. Vérifier que toutes les variables sont définies dans Netlify
2. Les variables doivent commencer par `EXPO_PUBLIC_`
3. Redéployer après avoir ajouté les variables

### Fonctions serverless ne fonctionnent pas

Si `/analyze-cat` ou `/health` ne répondent pas :

1. Vérifier que le dossier `netlify/functions` existe
2. Vérifier les logs des fonctions dans Netlify → Functions
3. S'assurer que les redirections dans `netlify.toml` sont correctes

## 📚 Ressources

- [Documentation Netlify](https://docs.netlify.com/)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Expo Web](https://docs.expo.dev/workflow/web/)
- [Pull Request #54](https://github.com/imfire3/CatDex/pull/54)
