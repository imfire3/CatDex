# CatDex flow catalog

| ID | Flow | Blocking if… |
|----|------|----------------|
| F1 | Welcome → Join → Signup | Can't reach form / submit broken / validation absent |
| F2 | Login → post-auth redirect | Stuck spinner / wrong redirect / no error on bad creds |
| F3 | Map load + pins / HUD | Blank map forever / crash |
| F4 | Capture (camera or gallery on web) | Can't open scanner when authed / analyze hard-fails with no recovery / scanner open while logged out |
| F5 | Reward → CatDex entry | Capture OK but cat never appears |
| F6 | Cat detail | Crash / empty forever |
| F7 | Profile / settings / logout | Can't leave session / settings crash |
| F8 | Missions list | Screen crash |

## Partial on web beta

- Real GPS / native camera differ from desktop browser; note limits.
- Render free-tier cold start (~30–60s) on first `/health` or `/analyze` after idle — P1 unless it never recovers.
