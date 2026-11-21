// shots.js — deterministic screenshot states for the dossier.
// ?shot=start shows the title screen, ?shot=play shows scene 1 mid-hunt with
// three differences already found (green rings on both panels) and four still
// hidden, and ?shot=end shows the win screen. The same query always paints
// the same frame, so the screenshots are reproducible.

import { SCENES } from './scenes.js';

export function applyShot(state, params) {
  const shot = params.get('shot');
  if (!shot) return false;
  if (shot === 'start') {
    state.screen = 'title';
    state.sceneIndex = 0;
    return true;
  }
  if (shot === 'play') {
    state.screen = 'play';
    state.sceneIndex = 0;
    state.found = new Set([0, 2, 4]);
    // Markers were "found" long before this frame, so they draw at full size.
    state.foundAt = new Map([[0, 0], [2, 0], [4, 0]]);
    state.score = 300;
    state.hintsLeft = 3;
    state.timeLeft = 64;
    state.elapsed = 26;
    state.wrongFlash = null;
    state.hintPulse = null;
    return true;
  }
  if (shot === 'end') {
    state.screen = 'win';
    state.sceneIndex = SCENES.length - 1;
    state.found = new Set([0, 1, 2, 3, 4, 5, 6]);
    state.score = 2450;
    state.totalFound = 21;
    state.elapsed = 198;
    state.sceneResults = [
      { name: SCENES[0].name, found: 7, bonus: 320 },
      { name: SCENES[1].name, found: 7, bonus: 410 },
      { name: SCENES[2].name, found: 7, bonus: 520 },
    ];
    return true;
  }
  return false;
}
