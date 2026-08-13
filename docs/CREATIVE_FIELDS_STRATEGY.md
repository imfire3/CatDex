# Stratégie des Champs Créatifs CatDex

**Date:** 2026-08-13  
**Objectif:** Générer systématiquement des noms, traits, et descriptions cohérents et ludiques

---

## 🎯 PHILOSOPHIE

CatDex est un **jeu de collection de chats de quartier**. Chaque fiche doit être :

1. **Factuelle** pour les caractéristiques physiques (couleur, pelage, race)
2. **Creative** pour les éléments narratifs (nom, traits, description)
3. **Cohérente** avec la photo (pose, lieu, apparence)

---

## 📋 CHAMPS PAR CATÉGORIE

### OBSERVABLES (factuels)

Ces champs sont remplis **uniquement** si visibles sur la photo:

- `coatColor` — couleur(s) du pelage
- `coatPattern` — motif (tigré, bicolore…)
- `furLength` — longueur du poil (court, mi-long, long)
- `eyeColor` — couleur des yeux
- `size` — taille (petit, moyen, grand)
- `estimatedAge` — âge apparent (chaton, adulte, senior)
- `sex` — sexe si identifiable
- `distinctiveFeatures` — marques visibles (poitrine blanche, chaussettes…)
- `breed` + `breedConfidence` — race si morphologie claire

**Règle:** Si invisible → champ vide (`""` ou `[]`)

### CRÉATIFS (déduits/générés)

Ces champs sont **toujours remplis**, déduits de la photo:

#### 1. `name` (nom du chat)

**Format:** 1–2 mots, max 18 lettres

**Recette:**
```
[Pelage/Lieu] + [Pose/Attitude]
```

**Exemples:**
- `"Paprika Zen"` — roux + assis calmement
- `"Oreo Sieste"` — noir et blanc + allongé
- `"Rouille Balcon"` — roux + sur un balcon
- `"Asphalte Scout"` — gris foncé + dans la rue, vigilant
- `"Tigrou Turbo"` — tigré + en mouvement
- `"Meringue Ninja"` — blanc + caché/furtif

**Interdit:**
Chat, Minou, Félix, Garfield, Ombre, Roux, Noir, Blanc, Gris, Miaou, Kitty

**Fallback côté frontend:**
Si OpenAI retourne `""` malgré le prompt, le frontend appelle `withFunnyCatName()` qui génère un nom stable basé sur l'apparence.

#### 2. `personalityTraits` (traits de personnalité)

**Format:** Tableau de **exactement 3 traits** en français

**Source:** Déduits de la pose, l'expression, le contexte

**Exemples:**
- Assis calme → `["Observateur", "Zen", "Vigilant"]`
- Tapi dans l'ombre → `["Furtif", "Discret", "Prudent"]`
- Allongé détendu → `["Détendu", "Paisible", "Confiant"]`
- En mouvement → `["Joueur", "Vif", "Espiègle"]`
- Regard fixe → `["Curieux", "Attentif", "Concentré"]`

**Ton:** Adjectifs simples, positifs, cohérents avec la pose

**Règle:** Ne **jamais** laisser vide — inventer depuis la pose si nécessaire

#### 3. `description` (description narrative)

**Format:** 2–3 phrases en français

**Structure obligatoire:**
1. Type de chat + couleur + pelage
2. Lieu/environnement visible
3. Pose/attitude

**Exemples:**

**Chat urbain:**
```
"Chat roux à poils mi-longs, photographié sur un balcon ensoleillé. 
Il est assis et observe la rue en contrebas d'un air vigilant."
```

**Chat discret:**
```
"Chat noir aux yeux verts, tapi dans l'ombre d'une ruelle. 
Sa posture ramassée et son regard fixe trahissent une nature 
discrète et prudente."
```

**Chat détendu:**
```
"Chat tigré gris et blanc, allongé sur le trottoir près d'un jardin. 
Il semble détendu et habitué à la présence humaine."
```

**Ton:** Observateur, joueur, **jamais** robotique ou technique

**Interdit:**
- "Ce chat appartient à…"
- "Il va bientôt…"
- "On peut supposer que…"
- Jargon de race ("de type Persian", "morphologie brachycéphale")

---

## 🔄 FLOW COMPLET

```
PHOTO
  ↓
OpenAI Vision (temperature: 0.2)
  ↓
PROMPT: "Observe physique + Crée nom/traits/description cohérents"
  ↓
JSON structuré avec:
  - Champs physiques: vides si invisibles
  - Nom: toujours rempli (pelage+pose+lieu)
  - Traits: toujours 3 traits
  - Description: toujours 2-3 phrases
  ↓
Backend normalizeFormAnalysis()
  - Ne force aucune valeur
  - Passe les champs créatifs tel quel
  ↓
Frontend withFunnyCatName()
  - Fallback UNIQUEMENT si name === ""
  - Génère nom stable depuis apparence
  ↓
CaptureReveal
  - Affiche les valeurs
  - Placeholders uniquement pour champs vides
```

---

## 📝 PROMPT OPENAI

### Système (catdexVisionPrompt.ts)

```
Tu analyses une photo pour CatDex — un jeu de collection de chats de quartier.
Tu dois OBSERVER les caractéristiques physiques ET CRÉER une fiche ludique.

OBLIGATOIRES (même si incertains) :
- name : surnom drôle (pelage/lieu + pose/attitude)
- personalityTraits : TOUJOURS 3 traits déduits de la pose
- description : 2–3 phrases (type + lieu + attitude)

OPTIONNELS (vides si invisibles) :
- coatColor, furLength, eyeColor, etc.
```

### User

```
Analyse cette photo pour CatDex. Si c'est un chat, renvoie : 
un surnom drôle (pelage + pose + lieu), 3 traits de personnalité 
déduits de la pose, une description narrative 2-3 phrases 
(type + lieu + attitude). Champs physiques vides si invisibles.
```

---

## ✅ VALIDATION

### Cas de test

#### Chat noir assis dans une ruelle

**Attendu:**
```json
{
  "name": "Asphalte Guetteur",
  "coatColor": "Noir",
  "furLength": "court",
  "personalityTraits": ["Vigilant", "Discret", "Territorial"],
  "description": "Chat noir à poils courts, posté à l'entrée d'une ruelle sombre. Sa posture droite et son regard fixe suggèrent un chat vigilant et territorial."
}
```

#### Chat roux allongé sur un balcon

**Attendu:**
```json
{
  "name": "Rouille Sieste",
  "coatColor": "Roux et blanc",
  "furLength": "mi-long",
  "personalityTraits": ["Détendu", "Zen", "Confiant"],
  "description": "Chat roux et blanc à poils mi-longs, allongé sur un balcon ensoleillé. Il semble parfaitement à l'aise et profite du soleil dans une posture décontractée."
}
```

#### Chat tigré en mouvement

**Attendu:**
```json
{
  "name": "Tigrou Sprint",
  "coatColor": "Gris tigré",
  "furLength": "court",
  "personalityTraits": ["Vif", "Joueur", "Énergique"],
  "description": "Chat tigré gris à poils courts, capturé en pleine course dans un jardin. Son mouvement rapide et son attitude enjouée révèlent un chat jeune et joueur."
}
```

---

## 🛡️ FALLBACK FRONTEND

Si OpenAI retourne `name: ""` malgré le prompt, le frontend génère un nom via `withFunnyCatName()`:

```typescript
// src/lib/funnyCatName.ts
export function withFunnyCatName(analysis: CatAnalysis): CatAnalysis {
  const name = analysis.suggestedName?.trim();
  if (name) return analysis;
  
  // Génère un nom stable depuis couleur + race + seed
  const generated = suggestNameForAppearance(
    analysis.color || 'Mystère',
    analysis.breed || '',
    analysis.color + analysis.breed
  );
  
  return {
    ...analysis,
    suggestedName: generated,
  };
}
```

**Exemples générés:**
- Chat noir → `"Encre"`, `"Nox"`, `"Ombre"`
- Chat roux → `"Caramel"`, `"Flamme"`, `"Moka"`
- Chat gris → `"Brume"`, `"Argent"`, `"Mistral"`

---

## 🎨 EXEMPLES DE COHÉRENCE

### Lieu + Pose + Nom

| Lieu | Pose | Couleur | Nom suggéré |
|------|------|---------|-------------|
| Balcon | Assis vigilant | Roux | `"Rouille Vigie"` |
| Ruelle | Tapi caché | Noir | `"Asphalte Ninja"` |
| Jardin | Allongé détendu | Tigré | `"Feuille Zen"` |
| Trottoir | Marche confiante | Blanc | `"Neige Promeneur"` |
| Parking | Assis observateur | Gris | `"Béton Radar"` |

### Pose + Traits

| Pose | Traits suggérés |
|------|----------------|
| Assis calme | `["Observateur", "Calme", "Vigilant"]` |
| Tapi/caché | `["Furtif", "Discret", "Prudent"]` |
| Allongé | `["Détendu", "Zen", "Paisible"]` |
| En mouvement | `["Vif", "Joueur", "Énergique"]` |
| Regard fixe | `["Curieux", "Attentif", "Concentré"]` |

---

## 🚫 ANTI-PATTERNS

### ❌ Descriptions robotiques

**Mauvais:**
```
"Chat de type Persian avec des caractéristiques morphologiques 
brachycéphales. Face profile: flat. Coat: long and silky."
```

**Bon:**
```
"Chat persan au pelage long et soyeux, installé sur un coussin. 
Son visage rond et ses grands yeux lui donnent un air majestueux."
```

### ❌ Inventions narratives

**Mauvais:**
```
"Ce chat appartient probablement à un résident du quartier. 
Il va bientôt rentrer chez lui pour son repas."
```

**Bon:**
```
"Chat habitué au quartier, souvent visible dans cette rue. 
Il semble territorial et se déplace avec assurance."
```

### ❌ Noms génériques

**Mauvais:**
```
"Minou", "Chat", "Félix", "Roux", "Noir"
```

**Bon:**
```
"Paprika Zen", "Asphalte Scout", "Meringue Ninja"
```

---

## 📊 MÉTRIQUES DE QUALITÉ

### Nom

- ✅ 1–2 mots
- ✅ ≤ 18 lettres
- ✅ Évoque pelage/lieu + pose
- ✅ Unique, pas générique

### Traits

- ✅ Exactement 3 traits
- ✅ En français
- ✅ Cohérents avec la pose
- ✅ Positifs/neutres (pas "Agressif", "Méchant")

### Description

- ✅ 2–3 phrases
- ✅ Mentionne type + couleur
- ✅ Mentionne lieu visible
- ✅ Décrit pose/attitude
- ✅ Ton joueur/observateur
- ❌ Pas de jargon technique
- ❌ Pas d'histoire inventée

---

## 🔄 ÉVOLUTION FUTURE

### Phase 2: Personnalisation poussée

- Traits basés sur l'heure (nuit → "Noctambule")
- Traits basés sur la météo si détectable
- Noms saisonniers (automne → couleurs chaudes)

### Phase 3: Cohérence multi-captures

- Si même chat recapturé → garder le nom original
- Traits évolutifs selon les captures (timide → confiant)

---

## 📚 RÉFÉRENCES

- Prompt: `server/src/catdexVisionPrompt.ts`
- Fallback: `src/lib/funnyCatName.ts`
- Tests: `server/src/normalizeFormAnalysis.test.ts`
- Type: `src/types/cat.ts` (`CatAnalysis`)
