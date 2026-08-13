# CatDex — bêta web gratuite

## Choix retenu

Pour la première bêta :

```text
Navigateur iPhone / ordinateur
        ↓
Netlify (application Expo Web)
        ↓
Supabase (comptes, base, photos)
        ↓
Render (API CatDex) → OpenAI Vision
```

- **Netlify** héberge l'interface et fournit un lien public.
- **Supabase** conserve les comptes, les chats et les photos.
- **Render** exécute l'API même lorsque le Mac est éteint. La clé OpenAI reste
  uniquement sur Render et n'est jamais envoyée au navigateur.

Les trois services proposent une formule gratuite adaptée à une petite bêta.
OpenAI reste facturé à l'usage selon le compte API.

## Ordre de mise en ligne

1. Créer un nouveau projet Supabase en suivant
   [`SUPABASE_CLEAN_START.md`](./SUPABASE_CLEAN_START.md).
2. Créer le service Render depuis `render.yaml` et renseigner ses variables.
3. Connecter le dépôt GitHub à Netlify.
4. Renseigner dans Netlify :
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `EXPO_PUBLIC_API_URL` avec l'URL Render réelle.
5. Dans Supabase, ajouter l'URL Netlify dans les URL autorisées
   d'authentification.
6. Tester le parcours complet avec un compte de test.

## Configuration Netlify

Le dépôt contient déjà `netlify.toml` :

- commande : `npx expo export --platform web`
- dossier publié : `dist`
- redirection SPA vers `index.html`

Une fois le site publié, Safari permet de choisir **Partager → Sur l'écran
d'accueil**. Cela crée une icône CatDex sur l'iPhone, sans passer par l'App
Store. Ce raccourci reste une application web et nécessite une connexion.

## Ordinateur (desktop)

La bêta web est conçue pour le **mobile**. Sur un écran large (≥ 480 px),
l’UI est forcée dans un cadre téléphone (~390 px) centré, avec la mention
« Bêta web · aperçu mobile ». Sur iPhone / Android, l’app remplit l’écran.

## Validation avant partage

- inscription et connexion e-mail ;
- autorisation caméra ou sélection d'une photo ;
- analyse IA ;
- sauvegarde et réouverture d'un chat ;
- carte et localisation ;
- déconnexion puis reconnexion ;
- suppression d'un compte de test ;
- ouverture des pages confidentialité et conditions.

## Plus tard : application iOS

Le même projet Expo pourra produire une application iOS avec EAS. La
publication App Store sera traitée après validation de la bêta web et après
création du compte Apple Developer payant.
