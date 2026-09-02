# Design — Re-spot (même chat)

| Champ | Valeur |
|-------|--------|
| **Date** | 2026-09-02 |
| **Axe** | Re-spot (recommandé — idées produit CatDex) |
| **Statut** | Spec validée pour planification |
| **Filtre** | Donne envie d’ouvrir CatDex demain ? |
| **Réf.** | [PRODUCT_VISION.md](../../PRODUCT_VISION.md), [collection-game-review.md](../../audits/collection-game-review.md) |

---

## Problème

L’histoire cible à 7 jours :

> « J’en ai 12. Il y a un gris près du métro que je cherche encore. »

Aujourd’hui **impossible** : chaque scan Vision crée une nouvelle entrée CatDex (`cat_${Date.now()}_…`). `lastSeenAt` / `views` ne bougent qu’à l’ouverture de fiche ou au claim `sourceWorldId` déjà capturé. Il n’y a **pas** de reconnaissance du même animal de quartier après une nouvelle photo.

Sans continuité d’identité, XP / missions / « Chat du jour » restent du maquillage.

---

## Objectif produit

Après une analyse Vision réussie, si un chat **déjà dans le CatDex du joueur** ressemble (lieu + pelage), proposer :

> **« C’est encore {Nom} ? »**

- **Oui** → même fiche : `views + 1`, `lastSeenAt` maintenant, mise à jour position + photo (dernier aperçu), toast « {Nom}, revu ici ».
- **Non** → flux actuel : Reveal (`/reward`) → `addCat` (nouvelle fiche).
- **Aucun candidat** → flux actuel sans friction.

Règle Bible n°4 : **le joueur confirme**. Pas d’auto-merge silencieux.

---

## Hors scope (V1)

- Matching ML / embeddings / re-ID vision
- Fusion de fiches déjà créées en doublon
- Re-spot sur chats **communauté** non claimés (claim `sourceWorldId` reste le chemin existant)
- Changement d’économie XP serveur
- Push notifications
- Missions « revoir un chat » (peut consommer `lastSeenAt` plus tard — pas dans ce ticket)

---

## UX

### Placement dans la boucle

```text
Map → Scanner (Vision) → [Re-spot confirm?] → Reveal → CatDex → Map
                              │
                              └─ Oui → déjàCaptured-like → Map
```

Le confirm re-spot s’insère **après Vision, avant** `setPending` / `/reward`.

### Écran confirm (nouveau step scanner ou sheet)

- Photo nouvelle (gauche / haut) + vignette fiche existante
- Titre : `C’est encore {name} ?`
- Sous-titre : distance + couleur (ex. `~40 m · Gris tigré`)
- CTA primaire : `Oui, c’est {name}` → `recordRespot(catId, …)` → toast → Map
- CTA secondaire : `Non, un nouveau chat` → `enterReveal` classique
- Si plusieurs candidats : liste max **3**, triés par score ; le joueur en choisit un ou « nouveau »

### Copy (FR)

| Clé | Texte |
|-----|--------|
| Title | C’est encore {name} ? |
| Subtitle | Vu près d’ici · {color} |
| Confirm | Oui, c’est {name} |
| Reject | Non, un nouveau chat |
| Toast success | {name}, revu ici |
| Toast XP (cosmétique, comme aujourd’hui) | +15 XP |

Réutiliser le ton de `alreadyCaptured` / `ERROR_CATALOG.alreadyCaptured` quand possible.

---

## Heuristique V1 (pas de ML)

### Entrées

Candidats = chats **owned** (`useCatsStore.cats`), lifestyle quelconque sauf si on veut limiter aux `sauvage` — **inclure les deux** (un chat domestique peut être rephotographié).

Signaux (sur `Cat` + `CatAnalysis`) :

| Signal | Source | Poids relatif |
|--------|--------|----------------|
| Distance | `distanceMeters(capture, cat)` via `@/lib/constants` | Filtre dur + score |
| Couleur | `analysis.color` (normalisé lower/trim) | Fort |
| Motif | `analysis.coatPattern` | Moyen |
| Poil | `analysis.coat` | Faible |
| Race | `analysis.breed` | Faible (souvent « Européen ») |

### Constantes (fixées)

```ts
export const RESPOT_MAX_DISTANCE_M = 250;
export const RESPOT_MIN_SCORE = 0.55;
export const RESPOT_MAX_CANDIDATES = 3;
```

### Score (0–1)

1. Exclure si `distanceMeters > RESPOT_MAX_DISTANCE_M`.
2. `geoScore = 1 - distance / RESPOT_MAX_DISTANCE_M` (clamp 0–1).
3. `colorScore` = 1 si égalité normalisée, 0.5 si l’un contient l’autre, sinon 0.
4. `patternScore` = idem sur `coatPattern` (absent → 0.5 neutre, ne pas pénaliser).
5. `coatScore` = égalité `coat` → 1, sinon 0.5.
6. `breedScore` = égalité breed → 1, sinon 0.5.
7. `score = 0.45 * geoScore + 0.30 * colorScore + 0.15 * patternScore + 0.05 * coatScore + 0.05 * breedScore`.
8. Garder `score >= RESPOT_MIN_SCORE`, tri décroissant, top `RESPOT_MAX_CANDIDATES`.

Fonction pure exportée :

```ts
findRespotCandidates(
  ownedCats: Cat[],
  sighting: {
    latitude: number;
    longitude: number;
    analysis: Pick<CatAnalysis, 'color' | 'coatPattern' | 'coat' | 'breed'>;
  },
  options?: Partial<{ maxDistanceM: number; minScore: number; maxCandidates: number }>,
): Array<{ cat: Cat; score: number; distanceM: number }>
```

---

## Données & store

### Nouveau : `recordRespot`

Étend le store cats (ou wrap `incrementViews`) :

```ts
recordRespot: (id: string, patch: {
  latitude: number;
  longitude: number;
  photoUri?: string;
}) => Promise<Cat | undefined>
```

Comportement :

1. Trouve le chat par `id` / `remoteId`.
2. Persiste la nouvelle photo si `photoUri` (réutiliser `persistCatPhoto`).
3. Met à jour immuablement : `views + 1`, `lastSeenAt = now`, `latitude`, `longitude`, `photoUri` (si fourni).
4. **Ne change pas** : `id`, `number`, `name`, `discoveredAt`, `analysis` (la fiche narrative reste stable — CREATIVE_FIELDS : « Si même chat recapturé → garder le nom original »).
5. Sync cloud optionnelle best-effort si déjà `remoteId` (même niveau que les updates actuelles ; si pas d’API update, rester local + toast sync plus tard — ne pas bloquer).

### `updateCat` patch

Élargir `Partial<Pick<Cat, …>>` pour autoriser `latitude` | `longitude` | `photoUri` | `lastSeenAt` | `views` **ou** n’utiliser que `recordRespot` dédié (préféré — une responsabilité claire).

### Pending capture

Pas de nouveau store obligatoire : le confirm re-spot peut vivre en step local `scanner` (`step: 'respotConfirm'`) avec state `respotCandidates` + photo/analysis en mémoire, sans passer par `pendingCapture`.

---

## Interaction avec claim existant

| Cas | Comportement |
|-----|----------------|
| Claim `sourceWorldId` déjà owned | Garder `alreadyCaptured` actuel (pas d’heuristique) |
| Claim première fois | Skip Vision → Reveal → `addCat` (inchangé) |
| Capture libre + Vision | Heuristique re-spot **après** Vision |
| Capture libre, 0 candidat | Reveal inchangé |

---

## Erreurs & edge cases

- GPS refusé / coords invalides → pas de candidats (score geo impossible) → Reveal.
- Collection vide → Reveal.
- Persist photo échoue sur re-spot → garder ancienne `photoUri`, quand même bump `views` / coords / `lastSeenAt`.
- Double-tap confirm → guard ref (comme `addingRef` sur reward).

---

## Tests

Framework existant : `node:test` + `node:assert/strict`, fichiers `src/lib/*.test.ts`, run via `npx tsx --test src/lib/respotCandidates.test.ts` (tsx du `server/` ou npx).

Couvrir :

1. Chat loin (> 250 m) → exclu.
2. Même couleur + proche → score élevé, classé 1er.
3. Couleur différente + proche → sous seuil ou score bas.
4. Pattern manquant → neutre, ne casse pas le match couleur+geo.
5. Max 3 candidats.
6. (Store) `recordRespot` incrémente views et met à jour lat/lng (test unitaire du helper store si extrait, sinon test de la fonction pure de merge).

---

## Métriques de succès (produit)

- % de Vision suivies d’un prompt re-spot
- % Oui vs Non sur le prompt
- Captures / user / semaine **et** re-spots / user / semaine
- Interviews S1 : histoire = « mon » chat / quartier (pas l’IA)

---

## Découpage livraison

1. Lib heuristique + tests (shippable sans UI)
2. `recordRespot` store + tests / smoke
3. UI confirm dans scanner + branchement post-Vision
4. Polish copy / toast / retour Map

Pas de missions / share card / carte vide dans ce ticket.
