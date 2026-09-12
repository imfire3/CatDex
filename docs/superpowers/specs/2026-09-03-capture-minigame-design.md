# Design — Capture mini-jeu (capsule CatDex)

| Champ | Valeur |
|-------|--------|
| **Date** | 2026-09-03 |
| **Axe** | Rituel de capture après photo |
| **Statut** | Spec validée pour planification |
| **Filtre** | Donne envie d’ouvrir CatDex demain ? |
| **Réf.** | [PRODUCT_VISION.md](../../PRODUCT_VISION.md), anti-vision « pas un Pokémon GO animalier » |

---

## Problème

Aujourd’hui, après le shutter : analyse Vision → Reveal. Pas de moment « j’ai capturé ce chat » — la photo se transforme en fiche sans rituel.

Le joueur décrit un besoin clair : **taper au bon moment** avec une boule en bas d’écran, puis **3 secousses** de succès, façon capture ludique — sans copier l’IP Nintendo / Pokéball.

---

## Objectif produit

Juste après la photo, avant Vision :

1. Afficher un overlay de mini-jeu sur la photo figée.
2. Capsule CatDex (brandée) traverse horizontalement ; cible fixe au centre.
3. Tap au passage de la capsule sur la cible → hit.
4. Miss → retry illimité sur la même photo.
5. Hit → 3 secousses (~1–1,5 s) → enchaîner le flux scanner actuel (Vision → respot / claim / reveal…).

Succès produit : la capture **se sent**, sans rallonger la session outdoor au-delà de quelques secondes de jeu + retries.

---

## Décisions figées

| Sujet | Choix |
|-------|--------|
| Objet | Capsule CatDex indigo/blanc (pas Pokéball) |
| Placement | Immédiatement après la photo, **avant** Vision |
| Intégration | Overlay dans le scanner (approche A) — pas de route `/capture` |
| Échec | Retry illimité, même photo |
| Mécanique | Cible fixe au centre ; capsule G↔D ; durée de traverse aléatoire |
| Skip v1 | Non |
| Claim / re-spot v1 | Pas de mini-jeu (photo neuve scanner uniquement) |

---

## Hors scope (V1)

- Skip / accessibilité avancée (VoiceOver timings dédiés)
- Mini-jeu sur claim ou re-spot
- Probabilité d’échec après les 3 secousses (« s’échappe »)
- Inventaire de capsules / items
- Sons dédiés (peut réutiliser haptics système si déjà branchés)
- Changement d’économie XP / `captureCount` (inchangé ; le mini-jeu est purement rituel UI)
- E2E obligatoire

---

## UX

### Parcours

```text
Caméra → shutter → photo en fond
  → overlay CaptureMinigame
      · cible fixe (centre)
      · capsule sur piste basse, G↔D (durée aléatoire)
      · tap dans fenêtre → hit
      · miss → feedback soft + retry (illimité)
  → hit → 3 secousses + « Capturé ! »
  → flux scanner actuel (Vision → …)
```

### Layout

- Fond : photo figée, légèrement assombrie
- Centre : anneau / cible brand (`colors.brand`)
- Bas : piste horizontale + capsule CatDex
- Hint : « Tape quand la capsule passe au centre »

### Mouvement & hit-test

- Boucle G→D puis D→G
- À chaque demi-cycle : durée tirée dans **[1,2 s ; 2,2 s]** (uniforme)
- Fenêtre de hit : **14 %** de la largeur utile centrée sur le milieu (tolérance ±7 % de largeur)
- Tap spam : un seul hit résolu à la fois (ignore taps pendant résolution / shake)

### Feedback

| Événement | Feedback |
|-----------|----------|
| Miss | Petite secousse / flash danger soft ; capsule continue |
| Hit | Freeze position → 3 secousses au centre → flash succès → sortie overlay |
| Durée shake | ~1,0–1,5 s total pour les 3 |

### Copy (FR)

| Clé | Texte |
|-----|--------|
| Hint | Tape quand la capsule passe au centre |
| Success | Capturé ! |

Tokens : `useTheme()` uniquement (`colors`, `spacing`, `motion`, etc.). Pas de hex ad hoc hors tokens brand.

---

## Architecture

### Modules

| Module | Rôle |
|--------|------|
| `CaptureMinigame` | Overlay UI (cible, capsule, hint, animations shake) |
| `useCaptureSwing` (ou util pur testable) | Position normalisée 0–1, durée aléatoire, hit-test au tap |
| Step scanner `captureMinigame` | Entre photo prise et lancement Vision |

### Données

- Aucun nouveau champ store / API.
- Photo URI déjà détenue par le scanner — inchangée.
- Succès mini-jeu = signal local pour enchaîner Vision ; pas de persistance.

### Cycle de vie

- App background → pause du swing ; reprise au foreground.
- Unmount / cancel scanner → cleanup animations / timers.

### Erreurs / edge

- Pas d’échec « hard » : seul le miss soft existe.
- Si l’overlay ne peut pas monter (edge rare) : fallback = enchaîner Vision sans mini-jeu (ne pas bloquer la capture réelle).

---

## Tests

| Type | Cas |
|------|-----|
| Unit | Hit-test : position dans / hors fenêtre → hit / miss |
| Unit | Durée aléatoire toujours dans [1,2 ; 2,2] |
| Unit | Pendant résolution hit, taps suivants ignorés |
| Manuel | Overlay après shutter ; 3 shakes ; enchaînement Vision |

---

## Critères d’acceptation

1. Après shutter (nouveau scan photo), l’overlay mini-jeu s’affiche sur la photo avant Vision.
2. Capsule CatDex brandée (pas Pokéball) traverse G↔D avec timing variable.
3. Tap dans la fenêtre centrale = hit → 3 secousses → suite du flux.
4. Tap hors fenêtre = miss + retry illimité sans reprendre de photo.
5. Claim / re-spot ne passent pas par ce mini-jeu en v1.
6. UI 100 % tokens `src/theme` via `useTheme()`.

---

## Suite

Après validation de ce fichier → plan d’implémentation (`docs/superpowers/plans/`) puis code.
