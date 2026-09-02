# Re-spot Same Cat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** After Vision analysis, ask the player « C’est encore {Nom} ? » when a nearby owned cat matches by place + coat; on Yes, bump the same CatDex entry instead of creating a duplicate.

**Architecture:** Pure heuristic in `src/lib/respotCandidates.ts` scores owned cats (geo + color + pattern). Scanner runs it after a successful Vision call (non-claim). A new `respotConfirm` step lets the player confirm or reject. Confirm calls `recordRespot` on the cats store (views, lastSeenAt, coords, optional new photo) and returns to the map. Reject continues into the existing Reveal → `addCat` path.

**Tech Stack:** Expo 54 / React Native, Zustand (`src/store/cats.ts`), Expo Router (`app/scanner.tsx`), `node:test` + `npx tsx --test`, design tokens via `useTheme()`.

**Spec:** [docs/superpowers/specs/2026-09-02-respot-same-cat-design.md](../specs/2026-09-02-respot-same-cat-design.md)

## Global Constraints

- No ML / vision re-ID — heuristic + player confirm only
- Do not change `name`, `number`, `discoveredAt`, or `analysis` on re-spot
- Do not auto-merge without confirmation
- Claim / `alreadyCaptured` (`sourceWorldId`) path stays unchanged
- UI: `useTheme()` tokens only — no hardcoded hex / spacing
- Client tests: `node:test` + `assert/strict`, run with `npx tsx --test <file>`
- Copy in French as specified in the design spec
- YAGNI: no missions, share card, or empty-map work in this plan

## File map

| File | Responsibility |
|------|----------------|
| `src/lib/respotCandidates.ts` | Pure scoring + `findRespotCandidates` |
| `src/lib/respotCandidates.test.ts` | Unit tests for heuristic |
| `src/lib/applyRespot.ts` | Pure merge of cat + patch (testable) |
| `src/lib/applyRespot.test.ts` | Unit tests for merge |
| `src/store/cats.ts` | Add `recordRespot` using `applyRespot` + `persistCatPhoto` |
| `app/scanner.tsx` | Post-Vision branch + `respotConfirm` UI |

---

### Task 1: Heuristic `findRespotCandidates`

**Files:**
- Create: `src/lib/respotCandidates.ts`
- Test: `src/lib/respotCandidates.test.ts`

**Interfaces:**
- Consumes: `Cat`, `CatAnalysis` from `@/types/cat`; `distanceMeters` from `@/lib/constants`
- Produces:
  - `RESPOT_MAX_DISTANCE_M = 250`
  - `RESPOT_MIN_SCORE = 0.55`
  - `RESPOT_MAX_CANDIDATES = 3`
  - `RespotCandidate = { cat: Cat; score: number; distanceM: number }`
  - `findRespotCandidates(ownedCats, sighting, options?) => RespotCandidate[]`

- [ ] **Step 1: Write the failing test**

```ts
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { findRespotCandidates, RESPOT_MAX_DISTANCE_M } from './respotCandidates';
import type { Cat } from '@/types/cat';

function makeCat(overrides: Partial<Cat> & Pick<Cat, 'id' | 'latitude' | 'longitude'>): Cat {
  return {
    number: 1,
    name: 'Paprika',
    photoUri: '',
    discoveredAt: '2026-01-01T00:00:00.000Z',
    views: 1,
    analysis: {
      color: 'Gris',
      breed: 'Européen',
      coat: 'Court',
      description: 'Gris du métro',
      coatPattern: 'Tigré',
    },
    ...overrides,
  };
}

describe('findRespotCandidates', () => {
  it('excludes cats farther than max distance', () => {
    const owned = [
      makeCat({ id: 'far', latitude: 48.86, longitude: 2.4 }),
    ];
    // ~1.1 km north
    const result = findRespotCandidates(owned, {
      latitude: 48.87,
      longitude: 2.4,
      analysis: { color: 'Gris', coatPattern: 'Tigré', coat: 'Court', breed: 'Européen' },
    });
    assert.equal(result.length, 0);
  });

  it('ranks a nearby same-color cat first', () => {
    const owned = [
      makeCat({ id: 'match', name: 'Paprika', latitude: 48.8601, longitude: 2.4 }),
      makeCat({
        id: 'other',
        name: 'Roux',
        latitude: 48.8601,
        longitude: 2.4,
        analysis: {
          color: 'Roux',
          breed: 'Européen',
          coat: 'Court',
          description: 'x',
          coatPattern: 'Uni',
        },
      }),
    ];
    const result = findRespotCandidates(owned, {
      latitude: 48.86,
      longitude: 2.4,
      analysis: { color: 'Gris', coatPattern: 'Tigré', coat: 'Court', breed: 'Européen' },
    });
    assert.ok(result.length >= 1);
    assert.equal(result[0].cat.id, 'match');
    assert.ok(result[0].score >= 0.55);
    assert.ok(result[0].distanceM < RESPOT_MAX_DISTANCE_M);
  });

  it('treats missing pattern as neutral (still can match on color+geo)', () => {
    const owned = [
      makeCat({
        id: 'no-pattern',
        latitude: 48.86005,
        longitude: 2.4,
        analysis: {
          color: 'Gris',
          breed: 'Européen',
          coat: 'Court',
          description: 'x',
        },
      }),
    ];
    const result = findRespotCandidates(owned, {
      latitude: 48.86,
      longitude: 2.4,
      analysis: { color: 'Gris', coat: 'Court', breed: 'Européen' },
    });
    assert.equal(result.length, 1);
    assert.equal(result[0].cat.id, 'no-pattern');
  });

  it('returns at most 3 candidates', () => {
    const owned = Array.from({ length: 5 }, (_, i) =>
      makeCat({
        id: `c${i}`,
        name: `Cat${i}`,
        latitude: 48.86 + i * 0.00005,
        longitude: 2.4,
      }),
    );
    const result = findRespotCandidates(owned, {
      latitude: 48.86,
      longitude: 2.4,
      analysis: { color: 'Gris', coatPattern: 'Tigré', coat: 'Court', breed: 'Européen' },
    });
    assert.ok(result.length <= 3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test src/lib/respotCandidates.test.ts`

Expected: FAIL — `Cannot find module './respotCandidates'` (or similar)

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/respotCandidates.ts`:

```ts
import { distanceMeters } from '@/lib/constants';
import type { Cat, CatAnalysis } from '@/types/cat';

export const RESPOT_MAX_DISTANCE_M = 250;
export const RESPOT_MIN_SCORE = 0.55;
export const RESPOT_MAX_CANDIDATES = 3;

export type RespotSighting = {
  latitude: number;
  longitude: number;
  analysis: Pick<CatAnalysis, 'color' | 'coatPattern' | 'coat' | 'breed'>;
};

export type RespotCandidate = {
  cat: Cat;
  score: number;
  distanceM: number;
};

function normalizeToken(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

/** 1 exact, 0.5 substring either way, 0 none. Empty either side → neutral 0.5 when `neutralIfMissing`. */
function textScore(
  a: string | undefined,
  b: string | undefined,
  neutralIfMissing = false,
): number {
  const left = normalizeToken(a);
  const right = normalizeToken(b);
  if (!left || !right) return neutralIfMissing ? 0.5 : 0;
  if (left === right) return 1;
  if (left.includes(right) || right.includes(left)) return 0.5;
  return 0;
}

export function findRespotCandidates(
  ownedCats: Cat[],
  sighting: RespotSighting,
  options?: Partial<{
    maxDistanceM: number;
    minScore: number;
    maxCandidates: number;
  }>,
): RespotCandidate[] {
  const maxDistanceM = options?.maxDistanceM ?? RESPOT_MAX_DISTANCE_M;
  const minScore = options?.minScore ?? RESPOT_MIN_SCORE;
  const maxCandidates = options?.maxCandidates ?? RESPOT_MAX_CANDIDATES;
  const sa = sighting.analysis;

  const scored: RespotCandidate[] = [];

  for (const cat of ownedCats) {
    const distanceM = distanceMeters(
      sighting.latitude,
      sighting.longitude,
      cat.latitude,
      cat.longitude,
    );
    if (distanceM > maxDistanceM) continue;

    const geoScore = 1 - distanceM / maxDistanceM;
    const colorScore = textScore(sa.color, cat.analysis.color, false);
    const patternScore = textScore(sa.coatPattern, cat.analysis.coatPattern, true);
    const coatScore = textScore(sa.coat, cat.analysis.coat, true);
    const breedScore = textScore(sa.breed, cat.analysis.breed, true);

    const score =
      0.45 * geoScore +
      0.3 * colorScore +
      0.15 * patternScore +
      0.05 * coatScore +
      0.05 * breedScore;

    if (score < minScore) continue;
    scored.push({ cat, score, distanceM });
  }

  return scored
    .sort((a, b) => b.score - a.score || a.distanceM - b.distanceM)
    .slice(0, maxCandidates);
}
```

- [ ] **Step 4: Run tests and make sure they pass**

Run: `npx tsx --test src/lib/respotCandidates.test.ts`

Expected: PASS (all 4 tests)

If the « far » test fails because 48.86→48.87 is still under 250 m in some projections, adjust the far cat to `latitude: 48.90` (≈4 km) in the test.

- [ ] **Step 5: Commit**

```bash
git add src/lib/respotCandidates.ts src/lib/respotCandidates.test.ts
git commit -m "$(cat <<'EOF'
feat(respot): add pure heuristic for same-cat candidates

Score owned cats by distance and coat signals so the scanner can
ask before creating a duplicate CatDex entry.
EOF
)"
```

---

### Task 2: Pure `applyRespot` merge helper

**Files:**
- Create: `src/lib/applyRespot.ts`
- Test: `src/lib/applyRespot.test.ts`

**Interfaces:**
- Consumes: `Cat` from `@/types/cat`
- Produces:
  - `RespotPatch = { latitude: number; longitude: number; photoUri?: string; nowIso?: string }`
  - `applyRespot(cat: Cat, patch: RespotPatch): Cat` — immutable; bumps `views`, sets `lastSeenAt`, coords, optional photo; never touches name/number/analysis/discoveredAt

- [ ] **Step 1: Write the failing test**

```ts
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { applyRespot } from './applyRespot';
import type { Cat } from '@/types/cat';

const base: Cat = {
  id: 'cat_1',
  number: 7,
  name: 'Paprika',
  photoUri: 'file://old.jpg',
  latitude: 48.86,
  longitude: 2.4,
  discoveredAt: '2026-01-01T00:00:00.000Z',
  lastSeenAt: '2026-01-02T00:00:00.000Z',
  views: 2,
  analysis: {
    color: 'Gris',
    breed: 'Européen',
    coat: 'Court',
    description: 'stable',
  },
};

describe('applyRespot', () => {
  it('bumps views and updates location without renaming', () => {
    const next = applyRespot(base, {
      latitude: 48.861,
      longitude: 2.401,
      photoUri: 'file://new.jpg',
      nowIso: '2026-09-02T12:00:00.000Z',
    });
    assert.equal(next.views, 3);
    assert.equal(next.lastSeenAt, '2026-09-02T12:00:00.000Z');
    assert.equal(next.latitude, 48.861);
    assert.equal(next.longitude, 2.401);
    assert.equal(next.photoUri, 'file://new.jpg');
    assert.equal(next.name, 'Paprika');
    assert.equal(next.number, 7);
    assert.equal(next.discoveredAt, base.discoveredAt);
    assert.equal(next.analysis.description, 'stable');
    assert.notEqual(next, base);
  });

  it('keeps previous photo when photoUri omitted', () => {
    const next = applyRespot(base, {
      latitude: 48.861,
      longitude: 2.401,
      nowIso: '2026-09-02T12:00:00.000Z',
    });
    assert.equal(next.photoUri, 'file://old.jpg');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test src/lib/applyRespot.test.ts`

Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation**

```ts
import type { Cat } from '@/types/cat';

export type RespotPatch = {
  latitude: number;
  longitude: number;
  photoUri?: string;
  /** Injected for tests; defaults to `new Date().toISOString()`. */
  nowIso?: string;
};

export function applyRespot(cat: Cat, patch: RespotPatch): Cat {
  return {
    ...cat,
    views: cat.views + 1,
    lastSeenAt: patch.nowIso ?? new Date().toISOString(),
    latitude: patch.latitude,
    longitude: patch.longitude,
    photoUri: patch.photoUri ?? cat.photoUri,
  };
}
```

- [ ] **Step 4: Run tests and make sure they pass**

Run: `npx tsx --test src/lib/applyRespot.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/applyRespot.ts src/lib/applyRespot.test.ts
git commit -m "$(cat <<'EOF'
feat(respot): add immutable applyRespot merge helper

Keep name and analysis stable while bumping views and lastSeenAt.
EOF
)"
```

---

### Task 3: Store `recordRespot`

**Files:**
- Modify: `src/store/cats.ts`
- Test: optional smoke — prefer verifying via `applyRespot` (already covered). Manually typecheck.

**Interfaces:**
- Consumes: `applyRespot` from `@/lib/applyRespot`; `persistCatPhoto` from `@/lib/photoStorage`
- Produces on `CatsState`:
  - `recordRespot: (id: string, patch: { latitude: number; longitude: number; photoUri?: string }) => Promise<Cat | undefined>`

- [ ] **Step 1: Extend `CatsState` type**

In `src/store/cats.ts`, add to the type and implement:

```ts
import { applyRespot } from '@/lib/applyRespot';

// on CatsState:
recordRespot: (
  id: string,
  patch: { latitude: number; longitude: number; photoUri?: string },
) => Promise<Cat | undefined>;
```

- [ ] **Step 2: Implement `recordRespot`**

Inside the store creator (same pattern as `addCat` — await hydration):

```ts
recordRespot: async (id, patch) => {
  await waitForCatsHydration();
  const existing = get().cats.find(
    (cat) => cat.id === id || cat.remoteId === id,
  );
  if (!existing) return undefined;

  let nextPhoto = existing.photoUri;
  if (patch.photoUri) {
    try {
      nextPhoto = await persistCatPhoto(existing.id, patch.photoUri);
    } catch (error) {
      console.warn('[cats] respot photo persist failed', error);
      nextPhoto = existing.photoUri;
    }
  }

  const updated = applyRespot(existing, {
    latitude: patch.latitude,
    longitude: patch.longitude,
    photoUri: nextPhoto,
  });

  set((state) => ({
    cats: state.cats.map((cat) =>
      cat.id === existing.id || cat.remoteId === existing.id ? updated : cat,
    ),
  }));

  return updated;
},
```

Do **not** change `name` / `analysis`. Cloud update is best-effort later — do not block V1 on a new Supabase update API.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`

Expected: no errors related to `recordRespot`

- [ ] **Step 4: Commit**

```bash
git add src/store/cats.ts
git commit -m "$(cat <<'EOF'
feat(respot): persist re-spot via cats store recordRespot

Update coords and optional photo while reusing applyRespot for views.
EOF
)"
```

---

### Task 4: Scanner — post-Vision branch + confirm UI

**Files:**
- Modify: `app/scanner.tsx`

**Interfaces:**
- Consumes: `findRespotCandidates` / `RespotCandidate`; `recordRespot` from cats store; existing `enterReveal`, `ErrorState` / `Button` / `Text` / `useTheme`
- Produces: new step `'respotConfirm'`; state for candidates + pending sighting fields

- [ ] **Step 1: Extend step union and local state**

Near the existing `Step` / state declarations:

```ts
| 'respotConfirm'

const [respotCandidates, setRespotCandidates] = useState<RespotCandidate[]>([]);
const [respotSighting, setRespotSighting] = useState<{
  analysis: CatAnalysis;
  imageUri: string;
  photoBase64?: string;
  photoMimeType?: string;
  latitude: number;
  longitude: number;
} | null>(null);
const respotBusyRef = useRef(false);
```

Import:

```ts
import {
  findRespotCandidates,
  type RespotCandidate,
} from '@/lib/respotCandidates';
import { formatDistanceMeters } from '@/lib/constants';
```

Wire `recordRespot` from `useCatsStore`.

- [ ] **Step 2: Branch after successful Vision (non-claim)**

Replace the direct `await enterReveal(...)` after `isNoCatFound` check in the Vision success path with:

```ts
const location = await ensureLocation(); // if not already captured in this path — reuse the same lat/lng you use in enterReveal
const lat = location.coords.latitude;
const lng = location.coords.longitude;

// Claim captures skip heuristic — they already know identity.
if (!isClaimCapture) {
  const candidates = findRespotCandidates(useCatsStore.getState().cats, {
    latitude: lat,
    longitude: lng,
    analysis: nextAnalysis,
  });
  if (candidates.length > 0) {
    setRespotCandidates(candidates);
    setRespotSighting({
      analysis: nextAnalysis,
      imageUri: cutoutUri ?? imageUri,
      photoBase64: base64,
      photoMimeType: mimeType,
      latitude: lat,
      longitude: lng,
    });
    setPhotoUri(cutoutUri ?? imageUri);
    setAnalysis(nextAnalysis);
    setStep('respotConfirm');
    return;
  }
}

await enterReveal(nextAnalysis, cutoutUri ?? imageUri, {
  mocked,
  photoBase64: base64,
  photoMimeType: mimeType,
});
```

**Important:** Read the surrounding `runAnalysis` carefully — `ensureLocation()` is already called earlier in many paths. Reuse the same latitude/longitude that `enterReveal` would persist (today `enterReveal` calls `ensureLocation` internally). Prefer threading coords so heuristic and pending capture stay consistent: either call `ensureLocation` once before the candidate check and pass coords into `enterReveal`, or call it inside the branch and again in `enterReveal` (acceptable for V1 if GPS is cached).

If `enterReveal` always re-fetches location, still run candidates with that same helper result from a single `const loc = await ensureLocation()` in this branch and, if needed, small refactor of `enterReveal` to accept optional `latitude`/`longitude` overrides so the stored pending matches the heuristic. Prefer the optional override:

```ts
// in enterReveal options:
latitude?: number;
longitude?: number;
// then:
const location = /* use options lat/lng if both defined, else ensureLocation() */;
```

- [ ] **Step 3: Confirm / reject handlers**

```ts
const handleRespotConfirm = async (candidate: RespotCandidate) => {
  if (!respotSighting || respotBusyRef.current) return;
  respotBusyRef.current = true;
  try {
    const updated = await recordRespot(candidate.cat.id, {
      latitude: respotSighting.latitude,
      longitude: respotSighting.longitude,
      photoUri: respotSighting.imageUri,
    });
    const name = updated?.name ?? candidate.cat.name;
    showToast({
      title: `${name}, revu ici`,
      description: '+15 XP',
      tone: 'success',
    });
    setRespotCandidates([]);
    setRespotSighting(null);
    router.replace('/(tabs)/map');
  } finally {
    respotBusyRef.current = false;
  }
};

const handleRespotReject = async () => {
  if (!respotSighting) return;
  const sighting = respotSighting;
  setRespotCandidates([]);
  setRespotSighting(null);
  await enterReveal(sighting.analysis, sighting.imageUri, {
    photoBase64: sighting.photoBase64,
    photoMimeType: sighting.photoMimeType,
    latitude: sighting.latitude,
    longitude: sighting.longitude,
  });
};
```

- [ ] **Step 4: Render `respotConfirm` UI**

Place **before** the `alreadyCaptured` block (or after auth gate), using theme tokens:

```tsx
if (step === 'respotConfirm' && respotSighting && respotCandidates.length > 0) {
  const primary = respotCandidates[0];
  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing[24],
          paddingBottom: Math.max(insets.bottom, spacing[24]),
          paddingHorizontal: spacing[24],
          gap: spacing[16],
        },
      ]}
    >
      <Text variant="title" color="textBrand">
        {respotCandidates.length === 1
          ? `C’est encore ${primary.cat.name} ?`
          : 'Tu l’as déjà croisé ?'}
      </Text>
      <Text variant="bodySmall" color="textSecondary">
        {`Vu près d’ici · ${primary.cat.analysis.color || 'Pelage inconnu'} · ${formatDistanceMeters(primary.distanceM)}`}
      </Text>
      {/* Optional: Image of respotSighting.imageUri + primary.cat.photoUri */}
      {respotCandidates.map((candidate) => (
        <Button
          key={candidate.cat.id}
          variant="primary"
          title={`Oui, c’est ${candidate.cat.name}`}
          onPress={() => {
            void handleRespotConfirm(candidate);
          }}
        />
      ))}
      <Button
        variant="secondary"
        title="Non, un nouveau chat"
        onPress={() => {
          void handleRespotReject();
        }}
      />
    </View>
  );
}
```

Use existing `Button` / `Text` from `@/components`. Prefer a simple layout over a new component for V1; extract `RespotConfirmPanel` only if `scanner.tsx` becomes unreadable (>~50 lines added in one block — then create `src/components/RespotConfirmPanel.tsx`).

- [ ] **Step 5: Manual smoke checklist**

1. Empty collection → Vision → Reveal (no confirm).
2. One owned cat nearby + same color → confirm appears → Oui → Map, same `#` / name, `views` +1.
3. Confirm → Non → Reveal → new cat.
4. Claim pin already owned → still `alreadyCaptured`, no heuristic.
5. Cat >250 m away, same color → no confirm.

- [ ] **Step 6: Typecheck + unit tests**

Run:

```bash
npx tsc --noEmit
npx tsx --test src/lib/respotCandidates.test.ts src/lib/applyRespot.test.ts
```

Expected: PASS / no errors

- [ ] **Step 7: Commit**

```bash
git add app/scanner.tsx src/components/RespotConfirmPanel.tsx
git commit -m "$(cat <<'EOF'
feat(respot): ask before adding a duplicate CatDex entry

After Vision, offer matching nearby owned cats; confirm updates the
same fiche, reject continues to the classic reveal flow.
EOF
)"
```

(Only add `RespotConfirmPanel.tsx` if you extracted it.)

---

### Task 5: Backlog ticket + docs pointer

**Files:**
- Create: `docs/backlog/tickets/S1-T-respot-same-cat.md`
- Modify: `docs/backlog/sprint-1-core-loop.md` (add bullet under Zones)

- [ ] **Step 1: Write ticket**

```markdown
# S1 — Re-spot même chat

| Champ | Valeur |
|-------|--------|
| **Sprint** | 1 — Core loop |
| **Statut** | Ready |
| **Spec** | `docs/superpowers/specs/2026-09-02-respot-same-cat-design.md` |
| **Plan** | `docs/superpowers/plans/2026-09-02-respot-same-cat.md` |

## Problème
Chaque photo crée une nouvelle fiche — impossible de « chercher encore le gris près du métro ».

## Acceptation
- [ ] Heuristique + tests verts
- [ ] Oui → même id, views+1, lastSeenAt, coords/photo
- [ ] Non → Reveal / addCat inchangé
- [ ] Claim alreadyCaptured inchangé
- [ ] Aucun auto-merge sans confirm
```

- [ ] **Step 2: Link from Sprint 1**

In `docs/backlog/sprint-1-core-loop.md`, under Zones, add:

```markdown
5. Re-spot — [tickets/S1-T-respot-same-cat.md](./tickets/S1-T-respot-same-cat.md)
```

- [ ] **Step 3: Commit**

```bash
git add docs/backlog/tickets/S1-T-respot-same-cat.md docs/backlog/sprint-1-core-loop.md docs/superpowers/specs/2026-09-02-respot-same-cat-design.md docs/superpowers/plans/2026-09-02-respot-same-cat.md
git commit -m "$(cat <<'EOF'
docs(respot): add design spec, plan, and Sprint 1 ticket

Lock the same-cat re-spot heuristic and scanner confirm flow for
implementation.
EOF
)"
```

---

## Spec coverage checklist

| Spec requirement | Task |
|------------------|------|
| Heuristic distance + coat scoring | Task 1 |
| Constants 250 m / 0.55 / max 3 | Task 1 |
| Immutable merge, keep name/analysis | Task 2 |
| `recordRespot` store + photo persist | Task 3 |
| Confirm UI post-Vision | Task 4 |
| Reject → Reveal | Task 4 |
| Claim path untouched | Task 4 (branch `!isClaimCapture`) |
| Tests `node:test` | Tasks 1–2 |
| Backlog ticket | Task 5 |
| No ML / missions / share | Global constraints |

## Self-review notes

- No TBD placeholders in task steps
- `findRespotCandidates` / `applyRespot` / `recordRespot` signatures consistent across tasks
- Far-distance test may need `latitude: 48.90` if 0.01° ≈ 1.1 km still passes an accidental weak filter — adjust in Task 1 if needed
