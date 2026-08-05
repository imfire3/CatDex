# Configuration Supabase pour CatDex

Ce guide vous explique comment configurer Supabase pour l'application CatDex.

## Prérequis

1. Créez un compte sur [Supabase](https://supabase.com)
2. Créez un nouveau projet Supabase

## Étapes de configuration

### 1. Obtenir les clés API

1. Allez sur votre projet Supabase
2. Cliquez sur l'icône **Settings** (engrenage) dans la sidebar
3. Allez dans **API**
4. Copiez les valeurs suivantes :
   - **Project URL** (format : `https://xxxxx.supabase.co`)
   - **anon public** key

### 2. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet (ou copiez `.env.example`) :

```bash
cp .env.example .env
```

Puis remplacez les valeurs par vos clés :

```env
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key-ici
```

### 3. Créer les tables de la base de données

1. Allez dans **SQL Editor** dans votre projet Supabase
2. Créez une nouvelle query
3. Copiez le contenu du fichier `supabase/schema.sql`
4. Exécutez la query (bouton **Run**)

Cela créera :
- ✅ Table `profiles` (profils utilisateurs)
- ✅ Table `cats` (chats découverts)
- ✅ Table `sightings` (observations de chats)
- ✅ Table `cat_analysis` (analyses IA des chats)
- ✅ Indexes pour la performance
- ✅ Row Level Security (RLS)
- ✅ Triggers automatiques
- ✅ Fonctions utilitaires (recherche de chats à proximité)

### 4. Configurer l'authentification

#### OAuth Google (optionnel)

1. Allez dans **Authentication** > **Providers**
2. Activez **Google**
3. Suivez les instructions pour obtenir les credentials OAuth :
   - Créez un projet sur [Google Cloud Console](https://console.cloud.google.com/)
   - Activez l'API Google+ 
   - Créez des credentials OAuth 2.0
   - Ajoutez l'URI de redirection Supabase

#### OAuth Apple (optionnel)

1. Allez dans **Authentication** > **Providers**
2. Activez **Apple**
3. Suivez les instructions pour obtenir les credentials :
   - Créez un Service ID sur [Apple Developer](https://developer.apple.com/)
   - Configurez Sign in with Apple
   - Ajoutez l'URI de redirection Supabase

#### Email/Password (activé par défaut)

L'authentification par email/mot de passe est activée par défaut dans Supabase.

**Obligatoire** — désactiver la confirmation email (sinon pas de session
après « Créer mon compte ») :
1. Allez dans **Authentication** → **Providers** → **Email**
2. Décochez **Confirm email** / **Enable email confirmations**

### 5. Configurer le Storage (pour les photos)

1. Allez dans **Storage**
2. Créez un nouveau bucket nommé **`cats`**
3. Définissez les politiques d'accès :
   - Public read : ✅ (pour voir les photos)
   - Authenticated insert : ✅ (pour uploader des photos)

Ou exécutez ce SQL :

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('cats', 'cats', true);

-- Allow public access to read
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'cats');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'cats' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'cats'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 6. Configurer les URL Schemes (Deep Linking)

Pour que l'OAuth fonctionne sur mobile, ajoutez dans `app.json` :

```json
{
  "expo": {
    "scheme": "catdex",
    "ios": {
      "bundleIdentifier": "com.catdex.app"
    },
    "android": {
      "package": "com.catdex.app"
    }
  }
}
```

### 7. Tester la configuration

Lancez l'application :

```bash
npm start
```

Testez l'inscription avec email/mot de passe pour vérifier que :
- ✅ L'utilisateur est créé dans `auth.users`
- ✅ Le profil est créé automatiquement dans `profiles`
- ✅ L'authentification fonctionne

## Fonctionnalités configurées

### Authentification
- ✅ Email/Password
- ✅ Google OAuth (si configuré)
- ✅ Apple OAuth (si configuré)
- ✅ Session persistante
- ✅ Auto-refresh des tokens

### Base de données
- ✅ Profils utilisateurs
- ✅ Gestion des chats découverts
- ✅ Historique des observations
- ✅ Analyses IA des photos de chats
- ✅ Recherche géospatiale (PostGIS)

### Sécurité
- ✅ Row Level Security (RLS)
- ✅ Policies pour chaque table
- ✅ Protection des données utilisateurs

### Performance
- ✅ Indexes géospatiaux
- ✅ Indexes sur les clés étrangères
- ✅ Triggers automatiques

## Fonctions utiles

### Trouver les chats à proximité

```typescript
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase.rpc('find_nearby_cats', {
  user_lat: 48.8566,
  user_lon: 2.3522,
  radius_meters: 5000 // 5km
});
```

### Uploader une photo de chat

```typescript
const uploadCatPhoto = async (uri: string, catId: string) => {
  const ext = uri.split('.').pop();
  const fileName = `${catId}.${ext}`;
  
  const { data, error } = await supabase.storage
    .from('cats')
    .upload(fileName, {
      uri,
      type: `image/${ext}`,
      name: fileName,
    });
    
  if (error) throw error;
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('cats')
    .getPublicUrl(fileName);
    
  return publicUrl;
};
```

## Dépannage

### Erreur : "Invalid API key"
- Vérifiez que `EXPO_PUBLIC_SUPABASE_URL` et `EXPO_PUBLIC_SUPABASE_ANON_KEY` sont corrects
- Redémarrez le serveur Expo après avoir modifié `.env`

### Erreur : "relation does not exist"
- Vérifiez que vous avez bien exécuté le fichier `schema.sql`
- Vérifiez que toutes les queries ont réussi

### OAuth ne fonctionne pas
- Vérifiez que les redirect URIs sont corrects dans Google/Apple
- Vérifiez que le scheme est bien configuré dans `app.json`

## Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Supabase Auth with React Native](https://supabase.com/docs/guides/auth/native-mobile-login)
- [PostGIS Documentation](https://postgis.net/docs/)

## Support

Pour toute question, consultez :
- [Supabase Discord](https://discord.supabase.com)
- [Documentation CatDex](../README.md)
