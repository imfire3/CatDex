# 🚀 Déployer sur Netlify MAINTENANT

## ✅ Ce qui est prêt

- ✅ Application buildée dans `dist/`
- ✅ Configuration `netlify.toml` en place
- ✅ Build réussi (2.94 MB bundle + assets)

## 📋 Étapes de déploiement

### Option 1 : Via le Dashboard Netlify (Recommandé)

1. **Allez sur [app.netlify.com](https://app.netlify.com/)**
2. **Cliquez sur "Add new site" → "Deploy manually"**
3. **Glissez-déposez le dossier `dist/`** du projet
4. **Configurez les variables d'environnement** :
   - Site settings → Environment variables
   - Ajoutez :
     ```bash
     EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
     EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
     EXPO_PUBLIC_API_URL=https://catdex-api.onrender.com
     ```
5. **Redéployez** pour que les variables prennent effet

### Option 2 : Via Netlify CLI

#### 1. Installer et se connecter

```bash
# Si pas déjà installé
npm install -g netlify-cli

# Se connecter à Netlify
npx netlify login
```

Cela ouvrira votre navigateur pour autoriser l'accès.

#### 2. Initialiser le site

```bash
# Créer un nouveau site ou lier un existant
npx netlify init
```

Choisissez :
- "Create & configure a new site"
- Sélectionnez votre team
- Donnez un nom au site (ex: `catdex-prod`)

#### 3. Déployer

```bash
# Déploiement en production
npx netlify deploy --prod --dir=dist
```

#### 4. Configurer les variables d'environnement

Via le dashboard ou CLI :

```bash
# Via CLI
npx netlify env:set EXPO_PUBLIC_SUPABASE_URL "https://votre-projet.supabase.co"
npx netlify env:set EXPO_PUBLIC_SUPABASE_ANON_KEY "votre-anon-key"
npx netlify env:set EXPO_PUBLIC_API_URL "https://catdex-api.onrender.com"
```

#### 5. Rebuild avec les variables

```bash
# Rebuild l'app avec les variables
npm run web:build

# Redéployer
npx netlify deploy --prod --dir=dist
```

### Option 3 : Déploiement automatique via GitHub

1. **Dans Netlify Dashboard** :
   - "Add new site" → "Import an existing project"
   - Connectez votre repo GitHub `imfire3/CatDex`
   - Sélectionnez la branche `cursor/remove-gallery-import-scanner-bc4c`

2. **Configuration du build** :
   - Build command: `npx expo export --platform web`
   - Publish directory: `dist`
   - Les settings sont lus automatiquement depuis `netlify.toml`

3. **Variables d'environnement** :
   - Configurez-les dans Site settings → Environment variables

4. **Déploiement automatique** :
   - Chaque push sur la branche déclenchera un nouveau déploiement

## 🔍 Vérification post-déploiement

Une fois déployé, testez :

```bash
# Health check
curl https://votre-site.netlify.app/health

# Page principale
curl -I https://votre-site.netlify.app
```

Vérifiez dans le navigateur :
- ✅ Page se charge
- ✅ Connexion Supabase fonctionne
- ✅ Carte s'affiche
- ✅ Mode boussole fonctionne 🧭

## 📝 Notes importantes

### Variables d'environnement requises

```bash
# Supabase (REQUIS)
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key-ici

# API CatDex (REQUIS)
EXPO_PUBLIC_API_URL=https://catdex-api.onrender.com

# OAuth (OPTIONNEL)
EXPO_PUBLIC_AUTH_GOOGLE=true
EXPO_PUBLIC_AUTH_APPLE=true
```

### Build output

Le build a créé :
- **Bundle principal** : `_expo/static/js/web/entry-*.js` (2.94 MB)
- **Assets** : Fonts (Kind Sans), images, icônes
- **Total** : ~3.5 MB (normal pour une app React Native Web)

### Domaine personnalisé (optionnel)

Dans Netlify Dashboard :
- Site settings → Domain management
- Add custom domain
- Configurez vos DNS

## 🐛 Troubleshooting

### Le site ne se connecte pas à Supabase

1. Vérifiez que les variables d'environnement sont définies
2. Elles doivent commencer par `EXPO_PUBLIC_`
3. Redéployez après avoir ajouté les variables

### Erreur 404 sur les routes

Les redirections SPA sont déjà configurées dans `netlify.toml` :
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Le build échoue sur Netlify

1. Vérifiez que Node.js 20 est utilisé (défini dans `netlify.toml`)
2. Vérifiez les logs de build dans Netlify
3. Testez localement : `npm run web:build`

## 📚 Ressources

- [Netlify Dashboard](https://app.netlify.com/)
- [Documentation Netlify](https://docs.netlify.com/)
- Guide complet : `DEPLOY_NETLIFY.md`
- Mode boussole : `docs/COMPASS_MODE.md`

---

**Statut actuel** : ✅ Build prêt dans `dist/`

**Prochaine étape** : Choisir une option de déploiement ci-dessus et déployer ! 🚀
