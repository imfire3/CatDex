# CatDex — repartir sur un Supabase propre

## Principe de sécurité

Ne pas supprimer l'ancien projet immédiatement. Créer un **nouveau projet
gratuit**, valider CatDex dessus, puis archiver l'ancien seulement après les
tests. Cela évite de perdre une configuration ou des données utiles.

## 1. Créer le projet

Dans Supabase :

1. créer un projet distinct, par exemple `catdex-beta` ;
2. conserver le mot de passe de base dans un gestionnaire de mots de passe ;
3. relever l'URL du projet et la clé publique `anon` ;
4. ne jamais mettre la clé `service_role` dans l'application ou dans Git.

## 2. Installer le schéma dans l'ordre

Dans le SQL Editor, exécuter chaque fichier séparément et dans cet ordre :

1. `supabase/migrations/20260804_init.sql`
2. `supabase/migrations/20260805_auto_confirm_email.sql`
3. `supabase/migrations/20260805_ensure_cat_analysis.sql`
4. `supabase/migrations/20260806_analysis_feedback.sql`
5. `supabase/migrations/20260807_lot0_security.sql`

`20260809_delete_account_note.sql` est uniquement une note opérationnelle et
ne modifie pas le schéma.

Ne pas utiliser une ancienne copie isolée du SQL : l'erreur historique
`cats.owner_id does not exist` indique qu'un schéma incomplet avait été
appliqué.

## 3. Configurer l'authentification

Pour la première bêta, activer uniquement **e-mail + mot de passe**. Laisser
Google et Apple désactivés afin d'éviter une configuration OAuth incomplète.

Dans Authentication → URL Configuration :

- Site URL : l'URL Netlify de production ;
- Redirect URLs : l'URL Netlify suivie de `/**` ;
- ajouter `http://localhost:8081/**` uniquement pour les tests locaux.

## 4. Configurer les services

Application et Netlify, variables publiques :

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Render, secrets serveur :

- `SUPABASE_URL`
- `SUPABASE_JWT_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`

La clé `service_role` sert uniquement à la suppression complète d'un compte.

## 5. Vérifier avant de basculer

1. créer un utilisateur de test ;
2. vérifier la ligne correspondante dans `profiles` ;
3. capturer un chat et vérifier `cats.owner_id` ;
4. vérifier la photo sous `cats/{userId}/...` dans Storage ;
5. se reconnecter et retrouver la collection ;
6. supprimer le compte de test et confirmer la disparition des données.

Les contrôles RLS complémentaires sont dans
[`RLS_PROD_VERIFY.md`](./RLS_PROD_VERIFY.md).
