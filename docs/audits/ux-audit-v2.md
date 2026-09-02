# CatDex — UX / UI Audit v2

| Champ | Valeur |
|-------|--------|
| **Date** | 2026-09-02 |
| **Source** | Revue code Expo Router (`app/`) + vision produit |
| **Vs v1** | ToastHost monté · favoris persistés · settings notifs plus honnêtes · intro recentrée |
| **Statut** | Référence active (v1 reste historique) |

**Filtre :** *Est-ce que ça donne envie d’ouvrir CatDex demain ?*  
**Boucle :** Map → Scanner → Reveal → CatDex → Map (sessions 30–90 s).

**Scores indicatifs :** UX ~6.5/10 · Boucle cœur ~7/10 · Intégrité méta (missions/notifs) ~4/10 · Sessions courtes ~5.5/10

---

## Funnel & pertes utilisateur

```text
Compte → Intro → Map (GPS) → Scan → Analyse → Reveal → CatDex → Map
   │        │       │          │        │         │
   drop  fiction  empty HUD  caméra   pad 2s   édition trop lourde
```

| Moment | Perte typique |
|--------|----------------|
| Signup avant magie | Abandon avant 1ʳᵉ capture |
| Mot de passe oublié | Dead-end (`Alert` bientôt) |
| Map sans GPS / 0 pin | « Il n’y a rien » |
| Analyse lente / erreur | Sortie scanner |
| Reveal édition dense | Abandon dehors (> 90 s) |
| Missions XP factices | Perte de confiance au retour |

---

## Par feature

### Welcome / Auth / Intro
- **OK :** Welcome brandé, erreurs auth inline, permissions reportées sur map.
- **Douleur :** Signup dense ; forgot-password mort ; intro cinéma + loader artificiel avant GPS réel.
- **Amélios :** Guest jusqu’à 1ʳᵉ capture · intro 1 écran · reset réel ou masquer le lien.

### Map
- **OK :** Claim, tip 1ʳᵉ visite, banner GPS, distance si localisé.
- **Douleur :** HUD dense ; empty quartier silencieux ; pins demo/community sans GPS trompeurs.
- **Amélios :** Empty CTA unique « Photographier ici » · alléger HUD (Capture + recenter) · spotlight FAB après tip.

### Scanner (+ respot)
- **OK :** Error catalog, respot confirm, alreadyCaptured.
- **Douleur :** `MIN_ANALYSIS_MS = 2000` ; galerie admin-only ; fichier monolithe.
- **Amélios :** Pad ≤ 800 ms · import photo pour tous · respot 1 primaire + « autre chat ».

### Reward / Reveal
- **OK :** Confirmation joueur, haptics, retour map.
- **Douleur :** Trop éditable pour la rue ; pas de CTA CatDex ; lieu sous-joué vs XP.
- **Amélios :** Reveal 2 temps (Ajouter → Affiner) · « Voir dans le CatDex » · lieu = XP.

### CatDex
- **OK :** Empty soigné, favoris persistés, discoverables.
- **Douleur :** 7 chips custom ; labels rareté confus ; cible opaque.
- **Amélios :** Filtres Tous / À découvrir / Favoris · `Chip` DS · labels alignés `catDexRarityLabel`.

### Fiche chat
- **OK :** Boundary, thème pelage.
- **Douleur :** Étoiles = vues ; pas de « Voir sur la carte » ; `views` ≠ captures (re-spot).
- **Amélios :** CTA carte · **Capturé X fois** (`captureCount`) · favori inline.

### Missions
- **Critique :** RewardLabel XP sans grant ; toast « Autres collections » no-op ; dual store vs UI.
- **Amélios :** Retirer XP chiffré **ou** grant réel · unifier · hide onglet si thin.

### Profil / Badges / Notifs / Settings
- **Douleur :** « Voir tous les badges » toast ; inbox vs prefs homonymes ; switches push actifs sans envoi.
- **Amélios :** Alertes de quartier · switches disabled/Bientôt · couper meta non branchée.

### Morts
- `app/discovery.tsx` non branché · CTAs toast no-op · routes permissions legacy.

---

## Priorités (petit × fort)

1. Honnêteté progression (missions XP / toasts / push)
2. Alléger Reveal + analyse (30–90 s)
3. Empty / spotlight map
4. Purge `discovery` + CTAs morts
5. Finaliser re-spot : `captureCount` visible (fiche de base, pas de nouvelle entrée)
6. Guest / 1ʳᵉ capture sans mur compte (si produit OK)

---

## Lien technique lié

Staging réel : https://staging--cat-dex.netlify.app (pas `catdex-beta`).  
`EXPO_PUBLIC_API_URL` local corrigé vers staging ; redeploy alias requis pour la bêta web.
