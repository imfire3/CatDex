## 2026-09-03 capture minigame final fixes

- Branch: `feat/capture-minigame`
- Commit message: `fix(capture): harden minigame reanimated styles`
- Status: requested review findings fixed in `src/components/scanner/CaptureMinigame.tsx`
- Tests:
  - `npx tsx --test src/lib/captureSwing.test.ts` -> pass (7/7)
  - `npx tsc --noEmit -p .` -> pass
- Fixes:
  - moved bottom-zone success opacity out of `useAnimatedStyle` so the worklet no longer reads React `phase` state
  - replaced the UI-thread `currentTargetRef.current` read in the swing completion callback with a captured primitive `nextTarget`
  - replaced the center-marker hardcoded `marginLeft: -4` with `-spacing[4]`
