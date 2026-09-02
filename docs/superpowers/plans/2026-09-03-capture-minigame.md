# Capture Mini-jeu (capsule CatDex) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** After the scanner shutter (or gallery pick), show a CatDex capsule timing mini-game on the frozen photo; on hit, play 3 shakes then continue into the existing Vision / claim analysis flow.

**Architecture:** Pure hit-test + swing timing in `src/lib/captureSwing.ts` (unit-tested). UI overlay `CaptureMinigame` under `src/components/scanner/`. Scanner gains step `captureMinigame` between photo capture and `runAnalysis`. Claim path (`isClaimCapture`) skips the mini-game and goes straight to analyzing.

**Tech Stack:** Expo 54 / React Native, `react-native-reanimated`, Expo Router (`app/scanner.tsx`), `node:test` + `npx tsx --test`, design tokens via `useTheme()`.

**Spec:** [docs/superpowers/specs/2026-09-03-capture-minigame-design.md](../specs/2026-09-03-capture-minigame-design.md)

## Global Constraints

- Capsule CatDex brandée — **pas** de Pokéball / IP Nintendo
- Mini-jeu **après photo, avant Vision** ; claim skip ; re-spot déjà après Vision → pas concerné
- Retry miss **illimité** sur la même photo
- Aucun nouveau champ store / API / XP
- UI: `useTheme()` tokens only — no hardcoded hex / ad-hoc spacing
- Client tests: `node:test` + `assert/strict`, run with `npx tsx --test <file>`
- Copy FR exacte de la spec
- YAGNI: no skip button, no inventory, no escape-after-shake, no E2E

## File map

| File | Responsibility |
|------|----------------|
| `src/lib/captureSwing.ts` | Constantes + hit-test + durée aléatoire + résolution de tap |
| `src/lib/captureSwing.test.ts` | Unit tests purs |
| `src/components/scanner/CaptureMinigame.tsx` | Overlay photo + cible + capsule animée + 3 shakes |
| `app/scanner.tsx` | Step `captureMinigame` ; wire shutter / gallery → minigame → `runAnalysis` |

---

### Task 1: Pure swing math (`captureSwing`)

**Files:**
- Create: `src/lib/captureSwing.ts`
- Test: `src/lib/captureSwing.test.ts`

**Interfaces:**
- Consumes: nothing (pure)
- Produces:
  - `CAPTURE_SWING_MIN_MS = 1200`
  - `CAPTURE_SWING_MAX_MS = 2200`
  - `CAPTURE_HIT_WINDOW = 0.14` (fraction of track width, centered on 0.5)
  - `CAPTURE_SHAKE_TOTAL_MS = 1200`
  - `CaptureSwingPhase = 'swinging' | 'resolving' | 'success'`
  - `sampleSwingDurationMs(random?: () => number): number`
  - `isCaptureHit(normalizedX: number, hitWindow?: number): boolean`
  - `resolveCaptureTap(phase: CaptureSwingPhase, normalizedX: number): 'hit' | 'miss' | 'ignored'`

- [ ] **Step 1: Write the failing test**

```ts
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  CAPTURE_HIT_WINDOW,
  CAPTURE_SWING_MAX_MS,
  CAPTURE_SWING_MIN_MS,
  isCaptureHit,
  resolveCaptureTap,
  sampleSwingDurationMs,
} from './captureSwing';

describe('sampleSwingDurationMs', () => {
  it('stays within [1200, 2200]', () => {
    for (let i = 0; i < 50; i += 1) {
      const ms = sampleSwingDurationMs(() => i / 49);
      assert.ok(ms >= CAPTURE_SWING_MIN_MS);
      assert.ok(ms <= CAPTURE_SWING_MAX_MS);
    }
  });

  it('maps 0 → min and 1 → max', () => {
    assert.equal(sampleSwingDurationMs(() => 0), CAPTURE_SWING_MIN_MS);
    assert.equal(sampleSwingDurationMs(() => 1), CAPTURE_SWING_MAX_MS);
  });
});

describe('isCaptureHit', () => {
  it('hits at center', () => {
    assert.equal(isCaptureHit(0.5), true);
  });

  it('hits at edge of window', () => {
    const half = CAPTURE_HIT_WINDOW / 2;
    assert.equal(isCaptureHit(0.5 - half), true);
    assert.equal(isCaptureHit(0.5 + half), true);
  });

  it('misses outside window', () => {
    const half = CAPTURE_HIT_WINDOW / 2;
    assert.equal(isCaptureHit(0.5 - half - 0.001), false);
    assert.equal(isCaptureHit(0.5 + half + 0.001), false);
    assert.equal(isCaptureHit(0), false);
    assert.equal(isCaptureHit(1), false);
  });
});

describe('resolveCaptureTap', () => {
  it('returns hit / miss while swinging', () => {
    assert.equal(resolveCaptureTap('swinging', 0.5), 'hit');
    assert.equal(resolveCaptureTap('swinging', 0), 'miss');
  });

  it('ignores taps while resolving or success', () => {
    assert.equal(resolveCaptureTap('resolving', 0.5), 'ignored');
    assert.equal(resolveCaptureTap('success', 0.5), 'ignored');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test src/lib/captureSwing.test.ts`

Expected: FAIL (module not found / cannot find module)

- [ ] **Step 3: Write minimal implementation**

```ts
export const CAPTURE_SWING_MIN_MS = 1_200;
export const CAPTURE_SWING_MAX_MS = 2_200;
/** Total width of the hit zone as a fraction of the track (centered on 0.5). */
export const CAPTURE_HIT_WINDOW = 0.14;
/** Total duration for the 3 success shakes. */
export const CAPTURE_SHAKE_TOTAL_MS = 1_200;

export type CaptureSwingPhase = 'swinging' | 'resolving' | 'success';

export function sampleSwingDurationMs(random: () => number = Math.random): number {
  const t = Math.min(1, Math.max(0, random()));
  return Math.round(
    CAPTURE_SWING_MIN_MS + t * (CAPTURE_SWING_MAX_MS - CAPTURE_SWING_MIN_MS),
  );
}

export function isCaptureHit(
  normalizedX: number,
  hitWindow: number = CAPTURE_HIT_WINDOW,
): boolean {
  const half = hitWindow / 2;
  return Math.abs(normalizedX - 0.5) <= half;
}

export function resolveCaptureTap(
  phase: CaptureSwingPhase,
  normalizedX: number,
): 'hit' | 'miss' | 'ignored' {
  if (phase !== 'swinging') return 'ignored';
  return isCaptureHit(normalizedX) ? 'hit' : 'miss';
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test src/lib/captureSwing.test.ts`

Expected: PASS (all tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/captureSwing.ts src/lib/captureSwing.test.ts
git commit -m "feat(capture): add swing hit-test math"
```

---

### Task 2: `CaptureMinigame` overlay UI

**Files:**
- Create: `src/components/scanner/CaptureMinigame.tsx`

**Interfaces:**
- Consumes:
  - `sampleSwingDurationMs`, `resolveCaptureTap`, `CAPTURE_SHAKE_TOTAL_MS`, `CaptureSwingPhase` from `@/lib/captureSwing`
  - `useTheme`, `Text`, `BrandLogo`, `react-native-reanimated`, `AppState`, `useReducedMotion`
- Produces:
  - `CaptureMinigame` props:
    ```ts
    type CaptureMinigameProps = {
      photoUri: string;
      onCaptured: () => void;
      onBack?: () => void;
    };
    ```

- [ ] **Step 1: Create the component**

Implement `src/components/scanner/CaptureMinigame.tsx` with this behavior:

1. **Layout (absolute fill)**
   - Full-bleed `Image` (`photoUri`, `resizeMode="cover"`)
   - Dim layer: `StyleSheet.absoluteFill` with `backgroundColor: colors.text` and `opacity: 0.4` (ink scrim; no new token)
   - Center target: ring `width/height` = `spacing[64]`, `borderRadius: radius.full`, `borderWidth: 3`, `borderColor: colors.brand`, empty fill (or `colors.brandSoft` very light)
   - Bottom track: horizontal strip above safe area (~`spacing[96]` from bottom), full width with horizontal padding `spacing[24]`
   - Capsule: circle `spacing[56]`, half `colors.brand` / half `colors.surface` (split via two Views or SVG), optional tiny `BrandLogo` size ~`spacing[24]` centered
   - Hint `Text` above track: variant `bodySmall`, color `onBrand` or `surface` — copy **« Tape quand la capsule passe au centre »**
   - On success phase: show `Text` **« Capturé ! »** variant `title` color `onBrand` near center

2. **Swing animation**
   - `normalizedX` shared value 0 → 1 → 0…
   - Each half-cycle: `withTiming` to target (0 or 1) over `sampleSwingDurationMs()` then schedule next half-cycle
   - Map to `translateX` using measured track width: `x = normalizedX * (trackWidth - capsuleSize)`
   - Pause when `AppState` !== `active` (cancelAnimation / don’t advance); resume by restarting current half-cycle
   - If `useReducedMotion()`: slower fixed duration mid-range (e.g. always 1800 ms) still OK; shakes become a single short pulse

3. **Tap**
   - Large `Pressable` covering lower 45% of screen (accessibility: not only the ball)
   - On press: read current `normalizedX` (via shared value `.value` on UI thread → runOnJS, or keep a JS mirror updated by `useAnimatedReaction`)
   - `const result = resolveCaptureTap(phase, x)`
   - `miss`: brief flash (`colors.dangerSoft` overlay opacity pulse ~`motion.duration.fast`) + optional `Haptics.notificationAsync(Warning)`; keep swinging
   - `hit`: set phase `resolving`; cancel swing; move capsule to center; run 3 horizontal shakes (`withSequence` of translateX ±8, three times) totaling ~`CAPTURE_SHAKE_TOTAL_MS`; then phase `success`; wait ~300 ms; call `onCaptured()` once
   - `ignored`: no-op

4. **Back**
   - If `onBack` provided, top-left `AuthBackButton` like other scanner steps

5. **Cleanup**
   - On unmount: cancel animations / clear timers; never call `onCaptured` twice (ref guard)

Skeleton structure (adapt to tokens; do not invent hex):

```tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AppState,
  Image,
  Pressable,
  StyleSheet,
  View,
  type AppStateStatus,
  type LayoutChangeEvent,
} from 'react-native';
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthBackButton } from '@/components/Auth/AuthChrome';
import { BrandLogo } from '@/components/BrandLogo';
import { Text } from '@/components/Text';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import {
  CAPTURE_SHAKE_TOTAL_MS,
  resolveCaptureTap,
  sampleSwingDurationMs,
  type CaptureSwingPhase,
} from '@/lib/captureSwing';
import { useTheme } from '@/theme/ThemeProvider';

export type CaptureMinigameProps = {
  photoUri: string;
  onCaptured: () => void;
  onBack?: () => void;
};

export function CaptureMinigame({ photoUri, onCaptured, onBack }: CaptureMinigameProps) {
  // theme, insets, phase state, shared values, AppState pause,
  // swing loop, tap handler, shake sequence → onCaptured once
  return null; // replace with full UI
}
```

Fill in the full UI (no `return null` left). Prefer existing patterns from `AnalysisLoadingView.tsx` for Reanimated + haptics.

- [ ] **Step 2: Manual smoke (optional in this task)**

If Expo is running: temporarily import and render is not required yet — Task 3 wires it. Typecheck locally if available:

Run: `npx tsc --noEmit -p . 2>&1 | head -40`  
(or project’s usual typecheck script)

Expected: no errors in `CaptureMinigame.tsx`

- [ ] **Step 3: Commit**

```bash
git add src/components/scanner/CaptureMinigame.tsx
git commit -m "feat(capture): add CaptureMinigame overlay UI"
```

---

### Task 3: Wire scanner step `captureMinigame`

**Files:**
- Modify: `app/scanner.tsx`

**Interfaces:**
- Consumes: `CaptureMinigame` from `@/components/scanner/CaptureMinigame`
- Produces: step `'captureMinigame'` in `Step` union; after success → existing `runAnalysis` path

- [ ] **Step 1: Extend `Step` and import**

In `app/scanner.tsx`:

```ts
import { CaptureMinigame } from '@/components/scanner/CaptureMinigame';

type Step =
  | 'camera'
  | 'captureMinigame'
  | 'analyzing'
  // ...rest unchanged
```

- [ ] **Step 2: Helper to start analysis after mini-jeu**

Add near other handlers:

```ts
const beginAnalysisAfterCapture = (base64: string, imageUri: string, mimeType: string) => {
  setStep('analyzing');
  setAnalyzing(true);
  void runAnalysis(base64, imageUri, mimeType);
};
```

- [ ] **Step 3: Change shutter + gallery entry**

In `handleTakePicture`, after successful `setPhotoUri` / `setPhotoBase64` / `setPhotoMimeType`:

**Claim path — skip mini-jeu (spec):**

```ts
if (isClaimCapture) {
  beginAnalysisAfterCapture(rawBase64, durableUri, 'image/jpeg');
  return;
}
setStep('captureMinigame');
// do NOT setAnalyzing / runAnalysis yet
```

Same pattern in `handlePickFromLibrary` (admin gallery): if `isClaimCapture` → analysis; else `setStep('captureMinigame')`.

Remove the previous immediate:

```ts
setStep('analyzing');
setAnalyzing(true);
void runAnalysis(...);
```

from those non-claim branches.

- [ ] **Step 4: Render overlay**

Before the `analyzing` branch (near other step early-returns), add:

```tsx
if (step === 'captureMinigame' && photoUri && photoBase64) {
  return (
    <CaptureMinigame
      photoUri={photoUri}
      onBack={resetToCamera}
      onCaptured={() => {
        beginAnalysisAfterCapture(photoBase64, photoUri, photoMimeType);
      }}
    />
  );
}
```

If `step === 'captureMinigame'` but photo missing (edge): call `resetToCamera()` or fall through to camera — do not hang.

- [ ] **Step 5: Ensure `resetToCamera` clears the step**

`resetToCamera` already sets `setStep('camera')` — no extra fields needed.

- [ ] **Step 6: Re-run unit tests + manual checklist**

Run: `npx tsx --test src/lib/captureSwing.test.ts`

Expected: PASS

Manual:
1. Open scanner (non-claim) → take photo → mini-jeu appears on photo
2. Miss → capsule continues; retry works
3. Hit → 3 shakes + « Capturé ! » → analyzing / Vision
4. Claim flow from map pin → **no** mini-jeu → analyzing claim path
5. Back during mini-jeu → camera

- [ ] **Step 7: Commit**

```bash
git add app/scanner.tsx
git commit -m "feat(capture): gate Vision behind capsule minigame"
```

---

## Spec coverage (self-review)

| Spec requirement | Task |
|------------------|------|
| Capsule CatDex brand (no Pokéball) | Task 2 |
| After photo, before Vision | Task 3 |
| Overlay in scanner (approach A) | Task 2–3 |
| Unlimited miss retry | Task 2 (phase stays swinging) |
| Center target + G↔D random timing | Task 1–2 |
| Hit window 14% | Task 1 (`CAPTURE_HIT_WINDOW`) |
| 3 shakes ~1–1.5 s | Task 1 constant + Task 2 |
| Copy FR hint / Capturé ! | Task 2 |
| Claim skip / no respot minigame | Task 3 (`isClaimCapture`) |
| No store/API changes | — (none) |
| Unit tests hit / duration / ignore | Task 1 |
| AppState pause | Task 2 |
| Theme tokens | Task 2 |
| Fallback if photo missing | Task 3 edge |

No placeholders left. Types consistent across tasks (`CaptureSwingPhase`, `resolveCaptureTap`, `CaptureMinigameProps`).
