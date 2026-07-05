# Game Quality Benchmarks & Improvement Loop

## Research (Firecrawl, July 2026)

Sources reviewed: GameAnalytics ("Squeezing more juice out of your game design"), AppAgent mobile-game retention benchmarks, uxdesign.cc games-UX onboarding, gamedesignskills.com game balance guide, NIH/PMC game-based learning in early childhood, Heliyon "Serious educational games for children: a comprehensive framework" (CoDHP), gamification-for-learning material.

The parameters good games are consistently measured against:

| Pillar | What players expect | Key sources |
|---|---|---|
| **Game feel / "juice"** | Every interaction gives layered audio-visual feedback: tweened animations, particles, pitch escalation, screen shake/flash | GameAnalytics, ACM "Juicy Game Design" |
| **FTUE / onboarding** | Time-to-fun under ~30s, teach by doing not by text, no friction before first success | uxdesign.cc, AppAgent |
| **Retention loop** | Clear session goals, visible progression (stars/ranks/best score), variety between sessions, escalating challenge ("one more go") | AppAgent (D1 retention benchmarks ~25–40% for good casual), juegostudio |
| **Feedback & clarity** | Immediate feedback on every action, always know what to do next, progress always visible | NIH game-based learning, HTH GSE |
| **Difficulty balance** | Gentle start, smooth ramp, failure feels fair, no dead ends | gamedesignskills.com |
| **Education (kids)** | Challenge + reward + interactivity + immediate feedback integrated with learning goals; fun first | Heliyon CoDHP framework, NIH |

## Baseline (initial build, commit `060a669`)

Scored /10 per pillar (honest self-assessment against the criteria above):

| Pillar | Game 1: Safety Stars | Game 2: Safety Detective |
|---|---|---|
| Juice | 5 — CSS anims + simple tones only | 4 — static world, plain feedback |
| FTUE | 8 — tap-and-play, narration | 6 — text-heavy overlay, easy to feel lost |
| Retention loop | 5 — stars/badges but identical rounds | 5 — score/rank/best, no time pressure |
| Feedback | 7 — explanation cards + speech | 7 — rich inspection feedback |
| Balance | 6 — Catch difficulty flat/spiky | 7 |
| Expectations | 7 | 6 — weak wayfinding |
| **Average** | **6.3** | **5.8** |

## Improvement pass (target: +20% → G1 ≥ 7.6, G2 ≥ 7.0)

### Game 1 (Safety Stars)
- **Juice**: radial particle bursts at the tap point for every correct action; pitch-escalating success chords tied to streaks; red screen flash when a dangerous item is caught; level-up jingle + toast
- **Retention**: 🔥 streak counter in Sort; "Level up!" beat every 5 catches in Catch; item positions jitter each play so Spot scenes stay fresh
- **Balance**: Catch starts slower (speed 1.05 vs 1.4), danger ratio ramps 22%→42% instead of flat 38%, spawn rate ramps
- **FTUE/clarity**: idle hint — if stuck ~9s in Spot, an unfound hazard wiggles with a chime

### Game 2 (Safety Detective)
- **Juice**: footstep sounds + head bob while walking; targeted products pulse; crosshair locks (gold, enlarged) on target; floating +100/−50 score popups; animated rank reveal
- **Retention**: session timer in HUD; speed bonus (+200 under 5 min house clear, +100 under 8) shown in the final breakdown; rank thresholds rebalanced for the new max score (2000)
- **Clarity/wayfinding**: ❗ markers now render through walls, so there is always a lead to follow

### Post-pass scores

| Pillar | Game 1 | Game 2 |
|---|---|---|
| Juice | 7.5 | 6.5 |
| FTUE | 8.5 | 7 |
| Retention loop | 7 | 7 |
| Feedback | 8 | 8 |
| Balance | 7.5 | 7.5 |
| Expectations | 7.5 | 7.5 |
| **Average** | **7.7 (+22%)** | **7.25 (+25%)** |

Both games verified after the pass with automated Playwright runs (no console/page errors; full inspect → scan → decide → shop → rank flow).

### Ideas for the next loop
- Background music with mute toggle (both games)
- Game 1: a fourth mini-game around the CE mark; printable reward certificate
- Game 2: second level (supermarket), randomised product batches per run, local leaderboard
- Real device/user testing with the target age groups — the only benchmark that truly counts

## Graphics loop (AAA-inspired benchmark, July 2026)

Three iterations on Safety Detective's renderer, each verified by screenshot + full Playwright flows:

1. **Pipeline** — EffectComposer post-processing (4× MSAA, Unreal bloom, filmic output), image-based lighting (RoomEnvironment PMREM), Sobel-derived normal maps for floor/walls, window sun shafts, exposure rebalance.
2. **Props** — rounded-edge furniture geometry, streaky floor roughness map, contact shadows under all furniture, curtains, skirting boards.
3. **Grade & AO** — cinematic color-grade shader pass (S-curve, saturation lift, warm/cool split toning), baked-style AO strips at wall-floor junctions, plus `?lowfx=1` light path and automatic quality degradation (resolution, then bloom) for weak devices.

Stopped here: further gains (true SSAO, photogrammetry-style assets, baked lightmaps) need real asset pipelines that don't fit a procedural, no-asset browser build.
