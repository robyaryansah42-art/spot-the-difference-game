# Spot the Difference — Harbour Lights

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/robyaryansah42-art/spot-the-difference-game/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/robyaryansah42-art/spot-the-difference-game/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

A spot-the-difference game for the make.fun bounty
[best-spot-the-difference-game-20261121-0451](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451):
two near-identical pictures side by side, green ring markers on the
differences found, several still unfound, and a "Found 3/7" counter of how
many remain.

Three original scenes, all art drawn procedurally on canvas — no borrowed
images, no network requests, no external assets:

- **Harbour Lights** — dusk at the old pier: lighthouse, boats, gulls, crates.
- **Night Market** — lanterns, a tea stall, a sleeping cat, string lights.
- **Jungle Camp** — a tent, campfire and hammock under a moonlit sky.

Each scene hides 7 differences. Click or tap a difference on either picture
to mark it (satisfying green ring + check, +100 pts); a wrong tap costs
10 pts. 3 hints per scene (H key or the Hint button, −25 pts each), a
countdown timer with a time bonus, and rising difficulty — smaller tap
targets and shorter timers in later scenes. Keyboard + mouse, WebAudio
synth sounds only (M to mute), R to restart, and a win screen with a
per-scene results table.

## Play it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome.

## Screenshots

Deterministic states via URL query (`?shot=start|play|end&seed=1`):
title screen, mid-play with 3 of 7 found, and the win screen.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```
