---
name: catdex-flow-qa
description: >
  Run CatDex end-to-end user-flow QA against beta or local web. Detects blocking
  vs non-blocking bugs, walks the flow catalog, and optionally fixes P0s. Use when
  the user says /catdex-flow-qa, flow QA, game flow test, beta smoke, or asks to
  test CatDex user journeys.
---

# CatDex Flow QA

## Modes

- **report only** (default): walk flows, classify issues, do not change code.
- **fix P0s**: after the report, fix blocking issues, then re-run failed flows only.

Parse the user message for a target URL (default `https://catdex-beta.netlify.app`) and mode.

## Severity

| Level | Meaning |
|-------|---------|
| **Blocking (P0)** | Core loop broken: white screen, spinner >10s with no recovery, crash, auth dead-end, capture/collection data loss, ungated sensitive game route when product requires auth |
| **Non-blocking (P1/P2)** | Layout, copy, slow animation flash, stub UX (forgot password), desktop stretch, cold API that recovers |

Rule: *Can a new player finish Map → Capture → Collection?* If no → P0.

## Execution

1. Read [flows.md](flows.md) for the checklist.
2. Prefer browser MCP (`cursor-ide-browser`) on the target URL. Use Playwright CLI only if the user asks for scripted E2E.
3. Wait for splash (spinner) up to ~10s before failing a load.
4. For each flow: navigate → snapshot/screenshot → note URL + evidence.
5. Without a test account, mark post-auth flows **blocked / not tested** — do not invent credentials. If the user provides an account (or asks you to create one), use it and delete nothing.
6. Also ping `EXPO_PUBLIC_API_URL` / `https://catdex-api.onrender.com/health` and note cold-start latency.

## Auth gates (expected)

Unauthenticated users must land on `/(auth)/welcome` for:

- `/map`, `/catdex`, `/missions`, `/profile`
- `/scanner` (capture requires account + completed onboarding)

Legal pages may stay public.

## Report format

```text
## Flow QA — <target>
Date: …
Mode: report only | fix P0s

### Blocking
- [F#] title — evidence (URL, steps, screenshot note)

### Non-blocking
- [F#] …

### Passed
- F# …

### Not tested
- … (reason)

### Next
1. …
```

## Fix mode

1. Fix P0s only unless the user expands scope.
2. Re-run only failed flows.
3. Do not commit unless the user asks.
