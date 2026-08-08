# Architecture de Déploiement CatDex

## Vue d'Ensemble

```
                        ┌─────────────────────────┐
                        │    Utilisateurs 👥      │
                        │  (France + International)│
                        └───────────┬─────────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                │                   │                   │
                │                   │                   │
        ┌───────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐
        │   Web 🌐     │    │  iOS 📱     │    │ Android 📱  │
        │              │    │             │    │             │
        │  Netlify     │    │ App Store   │    │ Play Store  │
        │  or Vercel   │    │ (EAS Build) │    │ (EAS Build) │
        └───────┬──────┘    └──────┬──────┘    └──────┬──────┘
                │                   │                   │
                └───────────────────┼───────────────────┘
                                    │
                            ┌───────▼────────┐
                            │   API Node.js  │
                            │   Hono Server  │
                            │                │
                            │  Render.com    │
                            │  or Railway    │
                            │                │
                            │  Port: 8787    │
                            └───────┬────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
            ┌───────▼──────┐  ┌────▼─────┐  ┌─────▼──────┐
            │   OpenAI 🤖  │  │ Supabase │  │ Background │
            │  gpt-4o-mini │  │   Cloud  │  │  Removal   │
            │              │  │          │  │   (imgly)  │
            │  Vision API  │  │  Auth    │  │            │
            └──────────────┘  │  DB      │  └────────────┘
                              │  Storage │
                              └──────────┘
```

## Composants

### Frontend

#### 1. Application Web (React Native Web)
- **Plateforme** : Netlify, Vercel ou GitHub Pages
- **Build** : Expo Metro Bundler
- **Technologie** : React Native Web
- **URL** : `https://catdex.netlify.app` (exemple)
- **Coût** : Gratuit (plan gratuit Netlify/Vercel)

#### 2. Application Mobile iOS
- **Build** : Expo Application Services (EAS)
- **Distribution** : App Store
- **TestFlight** : Beta testing
- **Bundle ID** : `com.catdex.app`
- **Coût** : Apple Developer $99/an

#### 3. Application Mobile Android
- **Build** : Expo Application Services (EAS)
- **Distribution** : Google Play Store
- **Test** : APK direct ou Play Internal Testing
- **Package** : `com.catdex.app`
- **Coût** : Google Play Console $25 unique

### Backend

#### 4. API Node.js (Hono)
- **Plateforme** : Render.com ou Railway
- **Runtime** : Node.js 22 + Docker
- **Port** : 8787
- **Endpoints** :
  - `GET /health` - Health check
  - `POST /analyze-cat` - Analyse IA de photos de chats
- **Coût** : Gratuit (Render) ou $5/mois (Railway)

**Services utilisés** :
- OpenAI Vision API (gpt-4o-mini)
- Background removal (@imgly/background-removal-node)
- JWT verification (Supabase)
- Rate limiting (20 req/hour/user)

#### 5. Supabase (Backend-as-a-Service)
- **Auth** : Email/Password, Google OAuth, Apple OAuth
- **Database** : PostgreSQL + PostGIS (géospatial)
- **Storage** : Photos de chats (bucket `cat-photos`)
- **Edge Functions** : Aucune (tout dans l'API Node)
- **Coût** : Gratuit (plan de base)

#### 6. OpenAI
- **Modèle** : `gpt-4o-mini` (par défaut)
- **Usage** : Analyse d'images de chats
- **Coût** : ~$0.001 par analyse (~$3-5/mois)

## Flux de Données

### 1. Authentification

```
User → App → Supabase Auth
              ↓
         JWT Token
              ↓
         Stocké localement
         (SecureStore iOS/Android, LocalStorage Web)
```

### 2. Analyse de Chat

```
1. User capture photo
   ↓
2. App compresse image → base64
   ↓
3. POST /analyze-cat
   Headers: Authorization: Bearer {supabase_jwt}
   Body: { imageBase64, mimeType }
   ↓
4. API vérifie JWT (Supabase)
   ↓
5. API rate limit check (20/hour)
   ↓
6. Parallèle :
   ├─ OpenAI Vision → Analyse (race, couleur, etc.)
   └─ Background Removal → Cutout PNG (1.2s max)
   ↓
7. Response → App
   { analysis, cutoutBase64 }
   ↓
8. App sauvegarde dans Supabase
   ├─ Upload photo → Storage
   ├─ Upload cutout → Storage
   └─ INSERT cat → Database (avec location)
```

### 3. Carte Interactive

```
User ouvre Carte
   ↓
App récupère position GPS
   ↓
Supabase query :
  SELECT cats NEAR user_location WITHIN 5km
   ↓
Affichage pins sur MapLibre
```

### 4. Synchronisation

```
App → Supabase Realtime
   ↓
Écoute INSERT/UPDATE sur table cats
   ↓
Mise à jour UI temps réel
```

## Sécurité

### 1. Authentification
- JWT tokens Supabase (HS256)
- Refresh tokens automatiques
- Row Level Security (RLS) activé

### 2. API
- Bearer token requis pour `/analyze-cat`
- Rate limiting (20 req/hour/user)
- Validation payload (Zod)
- Limite taille image (5 MB)

### 3. Base de Données
- RLS policies sur toutes les tables
- Users ne peuvent modifier que leurs propres données
- Photos publiques en lecture, privées en écriture

### 4. Storage
- Bucket `cat-photos` public (lecture)
- Upload authentifié uniquement
- Policies RLS pour la propriété

## Performance

### 1. Frontend
- Code splitting (Expo)
- Lazy loading des images
- Cache MapLibre (tiles)
- Offline support (via Zustand + SecureStore)

### 2. Backend API
- Response time : ~2-4 secondes
  - OpenAI Vision : ~1-2s
  - Background removal : ~1-2s (parallèle)
- Rate limiting pour éviter surcharge
- Cold start (Render gratuit) : 30-50s

### 3. Base de Données
- Index sur `location` (PostGIS)
- Index sur `user_id`
- Query optimization pour recherche proximité

### 4. CDN
- Netlify/Vercel CDN global
- Cache assets statiques (1 an)
- Compression Brotli/Gzip

## Scalabilité

### Nombre d'Utilisateurs Supportés

#### Plan Gratuit
- **Utilisateurs actifs** : 100-500
- **Analyses/jour** : 1000-2000
- **Limite** : Cold start API (Render)

#### Plan Pro (~$50/mois)
- **Utilisateurs actifs** : 5000-10000
- **Analyses/jour** : 10000+
- **No cold start** (Render Starter)

### Bottlenecks Potentiels

1. **OpenAI API** : Rate limits (500 req/min)
   - Solution : Queueing system (BullMQ + Redis)

2. **Supabase Storage** : Bandwidth (100 GB/mois gratuit)
   - Solution : Compression images, CDN externe

3. **API Render** : CPU/RAM (plan gratuit)
   - Solution : Upgrade Starter ($7/mois)

4. **Analyse lente** : 2-4s par photo
   - Solution : 
     - Utiliser gpt-4o au lieu de gpt-4o-mini (plus rapide)
     - Désactiver background removal (SKIP_CUTOUT=1)

## Monitoring

### 1. API
- Logs Render/Railway
- Error tracking : Sentry (recommandé)
- Uptime monitoring : UptimeRobot

### 2. Frontend
- Analytics : Google Analytics ou Mixpanel
- Error tracking : Sentry
- Performance : Expo Application Insights

### 3. Base de Données
- Dashboard Supabase → Database Usage
- Query performance
- Storage usage

## Coûts Détaillés

### Scénario 1 : MVP (100 users, 500 analyses/jour)

| Service | Plan | Coût/mois |
|---------|------|-----------|
| Supabase | Free | $0 |
| Render | Free | $0 |
| Netlify | Free | $0 |
| OpenAI | Pay-as-you-go | $5 |
| **Total** | | **$5/mois** |

### Scénario 2 : Croissance (1000 users, 5000 analyses/jour)

| Service | Plan | Coût/mois |
|---------|------|-----------|
| Supabase | Pro | $25 |
| Render | Starter | $7 |
| Netlify | Free | $0 |
| OpenAI | Pay-as-you-go | $30 |
| **Total** | | **$62/mois** |

### Scénario 3 : Production (10000 users, 20000 analyses/jour)

| Service | Plan | Coût/mois |
|---------|------|-----------|
| Supabase | Pro | $25 |
| Render | Standard | $25 |
| Netlify | Pro | $19 |
| OpenAI | Pay-as-you-go | $100 |
| **Total** | | **$169/mois** |

## CI/CD

### 1. Backend API
```
Git push → GitHub
   ↓
Render détecte push (webhook)
   ↓
Docker build (server/Dockerfile)
   ↓
Deploy automatique
   ↓
Health check /health
   ↓
Live 🎉
```

### 2. Web
```
Git push → GitHub
   ↓
Netlify/Vercel détecte push
   ↓
npm run web:build
   ↓
Deploy dist/
   ↓
Live 🎉
```

### 3. Mobile
```
Code changes → Git push
   ↓
(Manuel) eas update --branch production
   ↓
OTA update pushed
   ↓
Users reçoivent update au prochain launch
```

Pour changements natifs :
```
eas build --platform all
   ↓
eas submit --platform ios
eas submit --platform android
   ↓
Review Apple/Google (1-3 jours)
```

## Disaster Recovery

### 1. Backup Supabase
- Backups quotidiens automatiques (plan Pro)
- Export manuel possible (SQL dump)

### 2. Backup Code
- GitHub (source of truth)
- Tous les configs en Git

### 3. Rollback
- API : Render → Deploy previous commit
- Web : Netlify → Deploy previous version
- Mobile : Impossible de rollback App Store/Play Store
  - Solution : OTA update avec fix

## Environnements

### Development
- API : `http://localhost:8787`
- Web : `http://localhost:8081`
- DB : Supabase Dev Project

### Staging/Preview (optionnel)
- API : `https://catdex-api-staging.onrender.com`
- Web : Netlify Deploy Previews
- DB : Supabase Staging Project

### Production
- API : `https://catdex-api.onrender.com`
- Web : `https://catdex.netlify.app`
- Mobile : App Store + Play Store
- DB : Supabase Production Project

## Prochaines Optimisations

1. **CDN pour photos** : Cloudinary ou Cloudflare R2
2. **Queue pour analyses** : BullMQ + Redis
3. **Cache API** : Redis pour résultats analyses
4. **Push notifications** : Expo Push Notifications
5. **Analytics avancés** : Mixpanel ou Amplitude
6. **A/B testing** : Expo Feature Flags
7. **Monitoring avancé** : Datadog ou New Relic

---

**Documentation complète** : Voir `DEPLOYMENT.md`, `QUICKSTART.md`, et guides dans `docs/`
