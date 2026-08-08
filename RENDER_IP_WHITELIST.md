# 🔒 Configuration IP Whitelist Render.com

## Adresses IP à Autoriser

```
74.220.48.0/24
74.220.56.0/24
```

## 📋 Où Configurer sur Render.com

### Option 1 : Pare-feu / Firewall Rules

Si tu dois restreindre l'accès à ton API :

1. Va sur https://dashboard.render.com
2. Sélectionne ton service **catdex-api**
3. Onglet **Settings**
4. Scroll jusqu'à **"Network"** ou **"Security"**
5. Cherche **"IP Whitelist"** ou **"Allowed IPs"**

### Option 2 : Variables d'Environnement (si c'est pour Supabase)

Si ces IPs sont pour que Render puisse accéder à Supabase :

1. Dashboard Supabase → Ton projet
2. **Settings** → **Database**
3. Section **"Connection Pooling"** ou **"Network Restrictions"**
4. Ajoute les IPs Render :
   ```
   74.220.48.0/24
   74.220.56.0/24
   ```

### Option 3 : Configuration dans l'API (si filtrage applicatif)

Si tu veux filtrer les IPs dans le code de l'API, modifie `server/src/index.ts` :

```typescript
import { Hono } from 'hono';

const app = new Hono();

// Middleware IP whitelist
const allowedIPs = [
  '74.220.48.0/24',
  '74.220.56.0/24'
];

app.use('*', async (c, next) => {
  const clientIP = c.req.header('x-forwarded-for') || 
                   c.req.header('x-real-ip') || 
                   'unknown';
  
  // Vérifier si l'IP est autorisée
  // (nécessite une lib pour vérifier les CIDR ranges)
  
  await next();
});
```

## 🎯 Cas d'Usage Communs

### 1. Render → Supabase

**Problème** : Supabase bloque les connexions de Render

**Solution** : Ajoute les IPs Render dans Supabase :
1. Dashboard Supabase → Settings → Database
2. **Connection Pooling** → **Allowed IP Addresses**
3. Ajoute :
   ```
   74.220.48.0/24
   74.220.56.0/24
   ```

### 2. Restreindre l'Accès Public à l'API

**Problème** : Tu veux que seules certaines IPs puissent accéder à l'API

**Solution** : Configure le pare-feu Render ou utilise un middleware

### 3. IPs Sortantes de Render (Outbound)

Ces IPs sont probablement les **IPs sortantes** de Render.com, utilisées quand ton API fait des requêtes externes.

**Utilisation** :
- Autoriser Render dans un pare-feu externe
- Whitelister dans Supabase, Firebase, etc.
- Autoriser dans une API tierce

## 🌐 IPs Render.com Officielles

Les plages IP officielles de Render.com varient selon la région.

**Source officielle** : https://render.com/docs/static-outbound-ip-addresses

### Régions Render

```
# Oregon (US West)
35.160.0.0/16
44.224.0.0/16
52.24.0.0/16
...

# Ohio (US East)
3.128.0.0/16
18.216.0.0/16
...

# Frankfurt (Europe)
3.64.0.0/16
18.156.0.0/16
...
```

**Note** : Les IPs `74.220.48.0/24` et `74.220.56.0/24` peuvent être spécifiques à ta région.

## 🔧 Configuration Recommandée

### Dans Supabase (Si connexion DB)

1. Dashboard Supabase → Settings → Database
2. Scroll jusqu'à **"Restrict access to specific IP addresses"**
3. Désactive temporairement pour tester :
   - Décoche **"Restrict access"**
   - Sauvegarde
   - Teste l'API Render

4. Si ça marche, réactive et ajoute les IPs :
   - Coche **"Restrict access"**
   - Ajoute :
     ```
     74.220.48.0/24
     74.220.56.0/24
     ```
   - Ajoute aussi ton IP locale pour dev
   - Sauvegarde

### Dans l'API (Variables d'Environnement)

Tu peux aussi stocker ces IPs comme variable :

```env
# Render Environment
ALLOWED_IPS=74.220.48.0/24,74.220.56.0/24
```

Puis dans le code :
```typescript
const allowedIPs = process.env.ALLOWED_IPS?.split(',') || [];
```

## 🐛 Dépannage

### Erreur : "Connection refused" ou "Timeout"

1. **Vérifie que les IPs sont bien ajoutées** dans le pare-feu de destination
2. **Test sans restriction** d'abord (retire temporairement le whitelist)
3. **Vérifie les logs Render** :
   ```
   Dashboard Render → Service → Logs
   ```

### Erreur : "IP not allowed"

L'IP de Render n'est pas dans la whitelist.

**Solution** :
1. Check les logs pour voir l'IP réelle de Render
2. Ajoute cette IP dans la whitelist
3. Redémarre le service Render

## 📝 Exemple Complet

### Supabase avec Render

```yaml
# supabase/config.toml (si self-hosted)
[api]
allowed_ips = [
  "74.220.48.0/24",
  "74.220.56.0/24"
]
```

### Render avec Supabase Cloud

Dashboard Supabase → Settings → Database → Connection Pooling :
```
IPv4 Address: 74.220.48.0/24
IPv4 Address: 74.220.56.0/24
```

## 🔗 Ressources

- **Render IP Docs** : https://render.com/docs/static-outbound-ip-addresses
- **Supabase Network** : https://supabase.com/docs/guides/platform/network-restrictions

---

**Besoin d'aide spécifique ?** Dis-moi quel service tu essaies de configurer ! 🔧
