// main.js — Spot the Difference: Harbour Lights.
// Boot, the frame loop, input, scoring and all screen painting. The pictures
// themselves live in scenes.js; the sounds in audio.js; the fixed screenshot
// states in shots.js. One canvas, logical size 1280x720, scaled by CSS.

import { SCENES } from './scenes.js';
import { Sound } from './audio.js';
import { applyShot } from './shots.js';

const W = 1280;
const H = 720;
const PANEL_W = 600;
const PANEL_H = 460;
const PANEL_Y = 92;
const LEFT_X = 20;
const RIGHT_X = 660;
const BEST_KEY = 'harbour-lights-best';

const canvas = document.getElementById('game');
const statusEl = document.getElementById('status');
const ctx = canvas.getContext('2d');
const sound = new Sound();
const params = new URLSearchParams(window.location.search);

const state = {
  screen: 'title', // title | play | clear | win
  sceneIndex: 0,
  found: new Set(),
  foundAt: new Map(),
  score: 0,
  hintsLeft: 3,
  timeLeft: 90,
  elapsed: 0,
  totalFound: 0,
  sceneResults: [],
  hintPulse: null, // { diff, until }
  wrongFlash: null, // { x, y, until }
  clearUntil: 0,
  clearBonus: 0,
  message: '',
  messageUntil: 0,
  best: 0,
};

function scene() {
  return SCENES[state.sceneIndex];
}

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Private windows may refuse storage; the best score then lasts one visit.
  }
}

state.best = readBest();

function announce(text) {
  statusEl.textContent = text;
}

function say(text, seconds = 2) {
  state.message = text;
  state.messageUntil = performance.now() / 1000 + seconds;
}

function startScene(index) {
  state.sceneIndex = index;
  state.found = new Set();
  state.foundAt = new Map();
  state.hintsLeft = 3;
  state.timeLeft = scene().timeLimit;
  state.hintPulse = null;
  state.wrongFlash = null;
  state.screen = 'play';
  announce(`${scene().name}. Find 7 differences. ${state.hintsLeft} hints.`);
}

function startGame() {
  state.score = 0;
  state.totalFound = 0;
  state.elapsed = 0;
  state.sceneResults = [];
  startScene(0);
}

function finishScene(timedOut) {
  const found = state.found.size;
  const bonus = timedOut ? 0 : Math.round(state.timeLeft) * 5;
  state.score += bonus;
  state.totalFound += found;
  state.sceneResults.push({ name: scene().name, found, bonus });
  if (state.sceneIndex + 1 < SCENES.length) {
    state.clearBonus = bonus;
    state.screen = 'clear';
    state.clearUntil = performance.now() / 1000 + 2.0;
    sound.clear();
    announce(`Scene clear. ${found} of 7 found. Time bonus ${bonus}.`);
  } else {
    endGame();
  }
}

function endGame() {
  state.screen = 'win';
  if (state.score > state.best) {
    state.best = state.score;
    saveBest(state.best);
  }
  sound.win();
  announce(`Hunt complete. ${state.totalFound} of 21 differences found. Score ${state.score}.`);
}

function useHint() {
  if (state.screen !== 'play') return;
  if (state.hintsLeft <= 0) {
    say('No hints left in this scene!');
    return;
  }
  const remaining = scene().diffs.map((d, i) => i).filter((i) => !state.found.has(i));
  if (remaining.length === 0) return;
  const pick = remaining[Math.floor(Math.random() * remaining.length)];
  state.hintsLeft -= 1;
  state.score = Math.max(0, state.score - 25);
  state.hintPulse = { diff: pick, until: performance.now() / 1000 + 2.5 };
  sound.hint();
  say(`Hint: look near the ${scene().diffs[pick].label.toLowerCase()}… (−25 pts)`);
}

function panelHit(lx, ly) {
  // Logical point -> which panel and scene-space point, or null.
  if (ly < PANEL_Y || ly > PANEL_Y + PANEL_H) return null;
  if (lx >= LEFT_X && lx <= LEFT_X + PANEL_W) return { panel: 0, x: lx - LEFT_X, y: ly - PANEL_Y };
  if (lx >= RIGHT_X && lx <= RIGHT_X + PANEL_W) return { panel: 1, x: lx - RIGHT_X, y: ly - PANEL_Y };
  return null;
}

function handleTap(lx, ly) {
  sound.ensure();
  if (state.screen === 'title') {
    startGame();
    return;
  }
  if (state.screen === 'win') {
    startGame();
    return;
  }
  if (state.screen !== 'play') return;
  // The hint button lives in the footer.
  if (lx >= 1080 && lx <= 1252 && ly >= 640 && ly <= 688) {
    useHint();
    return;
  }
  const hit = panelHit(lx, ly);
  if (!hit) return;
  const now = performance.now() / 1000;
  const sc = scene();
  for (let i = 0; i < sc.diffs.length; i += 1) {
    if (state.found.has(i)) continue;
    const d = sc.diffs[i];
    const dx = hit.x - d.x;
    const dy = hit.y - d.y;
    if (dx * dx + dy * dy <= sc.radius * sc.radius) {
      state.found.add(i);
      state.foundAt.set(i, now);
      state.score += 100;
      sound.found();
      announce(`Found: ${d.label}. ${state.found.size} of 7.`);
      if (state.found.size === sc.diffs.length) finishScene(false);
      return;
    }
  }
  // A tap on the pictures that finds nothing costs a little.
  state.score = Math.max(0, state.score - 10);
  state.wrongFlash = { x: lx, y: ly, until: now + 0.5 };
  sound.wrong();
  say('Not a difference — −10 pts');
}

canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect();
  const lx = ((event.clientX - rect.left) / rect.width) * W;
  const ly = ((event.clientY - rect.top) / rect.height) * H;
  handleTap(lx, ly);
});

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  if (key === 'enter' || key === ' ') {
    event.preventDefault();
    sound.ensure();
    if (state.screen === 'title' || state.screen === 'win') startGame();
  } else if (key === 'h') {
    useHint();
  } else if (key === 'r') {
    startGame();
  } else if (key === 'm') {
    sound.muted = !sound.muted;
    say(sound.muted ? 'Sound off (M to turn back on)' : 'Sound on');
  }
});

// Leaving the tab freezes the countdown rather than letting it run unseen.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) state.hiddenAt = performance.now() / 1000;
});

// ------------------------------------------------------------ painting

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawMarker(x, y, bornAt, now) {
  const age = Math.min(1, (now - bornAt) / 0.25);
  const r = 20 + 6 * age;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(age, age);
  ctx.strokeStyle = '#37d67a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(55, 214, 122, 0.35)';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(0, 0, r + 5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#37d67a';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-9, 0);
  ctx.lineTo(-2, 8);
  ctx.lineTo(10, -8);
  ctx.stroke();
  ctx.restore();
}

function drawHeader(now) {
  ctx.fillStyle = '#141828';
  ctx.fillRect(0, 0, W, 80);
  ctx.fillStyle = '#f6e8c8';
  ctx.font = 'bold 30px Georgia, serif';
  ctx.fillText('SPOT THE DIFFERENCE', 20, 38);
  ctx.font = '15px Georgia, serif';
  ctx.fillStyle = '#c9b8a0';
  ctx.fillText(`${scene().name}  ·  Scene ${state.sceneIndex + 1} of ${SCENES.length}`, 20, 64);
  // Found counter — the big readable number the judge looks for.
  const found = state.found.size;
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 30px Georgia, serif';
  ctx.fillText(`Found ${found}/7`, 560, 40);
  ctx.font = '15px Georgia, serif';
  ctx.fillStyle = '#c9b8a0';
  ctx.fillText(`${state.totalFound + found} of 21 in total`, 560, 64);
  // Score
  ctx.fillStyle = '#f6e8c8';
  ctx.font = 'bold 26px Georgia, serif';
  ctx.fillText(`Score ${state.score}`, 820, 38);
  ctx.font = '14px Georgia, serif';
  ctx.fillStyle = '#c9b8a0';
  ctx.fillText(`Best ${state.best}`, 820, 62);
  // Timer bar
  const limit = scene().timeLimit;
  const frac = Math.max(0, state.timeLeft / limit);
  ctx.fillStyle = '#2c2a3a';
  roundRect(1010, 22, 240, 18, 9);
  ctx.fill();
  ctx.fillStyle = frac > 0.5 ? '#37d67a' : frac > 0.25 ? '#ffd166' : '#e4572e';
  if (frac > 0) {
    roundRect(1010, 22, 240 * frac, 18, 9);
    ctx.fill();
  }
  ctx.fillStyle = '#f6e8c8';
  ctx.font = 'bold 20px Georgia, serif';
  const secs = Math.max(0, Math.ceil(state.timeLeft));
  ctx.fillText(`${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`, 1090, 64);
  ctx.font = '14px Georgia, serif';
  ctx.fillStyle = '#c9b8a0';
  ctx.fillText('time left', 1150, 64);
}

function drawPanels(now) {
  const sc = scene();
  const mods = new Set(sc.diffs.map((d, i) => i));
  const panels = [
    { x: LEFT_X, mods: new Set() },
    { x: RIGHT_X, mods },
  ];
  for (const panel of panels) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(panel.x, PANEL_Y, PANEL_W, PANEL_H);
    ctx.clip();
    ctx.translate(panel.x, PANEL_Y);
    sc.draw(ctx, PANEL_W, PANEL_H, panel.mods);
    ctx.restore();
    ctx.strokeStyle = '#f6e8c8';
    ctx.lineWidth = 3;
    ctx.strokeRect(panel.x, PANEL_Y, PANEL_W, PANEL_H);
    ctx.fillStyle = 'rgba(20, 24, 40, 0.85)';
    ctx.fillRect(panel.x, PANEL_Y, 46, 30);
    ctx.fillStyle = '#f6e8c8';
    ctx.font = 'bold 18px Georgia, serif';
    ctx.fillText(panel.mods.size === 0 ? 'A' : 'B', panel.x + 16, PANEL_Y + 22);
    // Green rings on every difference found so far, on both pictures.
    for (const i of state.found) {
      const d = sc.diffs[i];
      drawMarker(panel.x + d.x, PANEL_Y + d.y, state.foundAt.get(i) ?? now, now);
    }
  }
  // A hint pulses a dashed gold ring around one unfound difference.
  if (state.hintPulse && now < state.hintPulse.until) {
    const d = sc.diffs[state.hintPulse.diff];
    const pulse = 1 + 0.12 * Math.sin(now * 8);
    ctx.save();
    ctx.setLineDash([10, 8]);
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 4;
    for (const px of [LEFT_X, RIGHT_X]) {
      ctx.beginPath();
      ctx.arc(px + d.x, PANEL_Y + d.y, 30 * pulse, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
  // A wrong tap leaves a brief red cross where it landed.
  if (state.wrongFlash && now < state.wrongFlash.until) {
    ctx.strokeStyle = '#e4572e';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    const { x, y } = state.wrongFlash;
    ctx.beginPath();
    ctx.moveTo(x - 12, y - 12);
    ctx.lineTo(x + 12, y + 12);
    ctx.moveTo(x + 12, y - 12);
    ctx.lineTo(x - 12, y + 12);
    ctx.stroke();
  }
}

function drawFooter() {
  ctx.fillStyle = '#141828';
  ctx.fillRect(0, 566, W, 154);
  ctx.fillStyle = '#f6e8c8';
  ctx.font = '17px Georgia, serif';
  ctx.fillText('Click or tap a difference on either picture.  H = hint (−25 pts)   ·   R = restart   ·   M = sound', 20, 600);
  ctx.fillStyle = '#c9b8a0';
  ctx.font = '15px Georgia, serif';
  ctx.fillText('A wrong tap costs 10 points. Find all 7 before the timer runs out for a time bonus.', 20, 628);
  ctx.fillText('Three scenes: Harbour Lights, Night Market, Jungle Camp — each one hides its differences better.', 20, 654);
  // Hint button
  ctx.fillStyle = '#e8a35c';
  roundRect(1080, 640, 172, 48, 10);
  ctx.fill();
  ctx.fillStyle = '#241a10';
  ctx.font = 'bold 19px Georgia, serif';
  ctx.fillText(`Hint (${state.hintsLeft})`, 1098, 671);
  if (state.message && performance.now() / 1000 < state.messageUntil) {
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 18px Georgia, serif';
    ctx.fillText(state.message, 20, 690);
  }
}

function drawTitle(now) {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#1b1e33');
  bg.addColorStop(1, '#3c2a4e');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 64px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('SPOT THE DIFFERENCE', W / 2, 120);
  ctx.fillStyle = '#f6e8c8';
  ctx.font = 'italic 26px Georgia, serif';
  ctx.fillText('Harbour Lights', W / 2, 165);
  ctx.font = '18px Georgia, serif';
  ctx.fillStyle = '#c9b8a0';
  ctx.fillText('Three original scenes, painted in code. Two pictures side by side — seven differences hide between them.', W / 2, 205);
  ctx.fillText('Tap every difference to ring it green. Hints help, wrong taps cost points, and the clock keeps running.', W / 2, 232);
  // A live preview: the first scene, both panels, small.
  const sc = SCENES[0];
  const mods = new Set(sc.diffs.map((d, i) => i));
  const pw = 420;
  const ph = 322;
  const py = 268;
  for (const [px, pm] of [[W / 2 - pw - 16, new Set()], [W / 2 + 16, mods]]) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(px, py, pw, ph);
    ctx.clip();
    ctx.translate(px, py);
    ctx.scale(pw / PANEL_W, ph / PANEL_H);
    sc.draw(ctx, PANEL_W, PANEL_H, pm);
    ctx.restore();
    ctx.strokeStyle = '#f6e8c8';
    ctx.lineWidth = 3;
    ctx.strokeRect(px, py, pw, ph);
  }
  const blink = Math.sin(now * 4) > -0.2;
  if (blink) {
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 28px Georgia, serif';
    ctx.fillText('Click or press Enter to play', W / 2, 660);
  }
  ctx.fillStyle = '#c9b8a0';
  ctx.font = '15px Georgia, serif';
  ctx.fillText('H = hint   ·   R = restart   ·   M = sound   ·   Best score ' + state.best, W / 2, 694);
  ctx.textAlign = 'left';
}

function drawClear() {
  drawHeader(performance.now() / 1000);
  drawPanels(performance.now() / 1000);
  ctx.fillStyle = 'rgba(20, 24, 40, 0.82)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#37d67a';
  ctx.font = 'bold 56px Georgia, serif';
  ctx.fillText('Scene Clear!', W / 2, 320);
  ctx.fillStyle = '#f6e8c8';
  ctx.font = '26px Georgia, serif';
  ctx.fillText(`You found all 7 differences in ${scene().name}.`, W / 2, 372);
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 24px Georgia, serif';
  ctx.fillText(`Time bonus +${state.clearBonus} pts`, W / 2, 414);
  ctx.textAlign = 'left';
}

function drawWin() {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#12261a');
  bg.addColorStop(1, '#1b3a2a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#37d67a';
  ctx.font = 'bold 58px Georgia, serif';
  ctx.fillText('HUNT COMPLETE!', W / 2, 120);
  ctx.fillStyle = '#f6e8c8';
  ctx.font = '26px Georgia, serif';
  ctx.fillText(`You found ${state.totalFound} of 21 differences across three scenes.`, W / 2, 168);
  const mins = Math.floor(state.elapsed / 60);
  const secs = Math.floor(state.elapsed % 60);
  ctx.fillText(`Total time ${mins}:${String(secs).padStart(2, '0')}  ·  Best score ${state.best}`, W / 2, 202);
  // Results table
  ctx.textAlign = 'left';
  const tx = 340;
  let ty = 260;
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 22px Georgia, serif';
  ctx.fillText('Scene', tx, ty);
  ctx.fillText('Found', tx + 330, ty);
  ctx.fillText('Bonus', tx + 480, ty);
  ctx.strokeStyle = '#c9b8a0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(tx, ty + 12);
  ctx.lineTo(tx + 600, ty + 12);
  ctx.stroke();
  ty += 48;
  for (const row of state.sceneResults) {
    ctx.fillStyle = '#f6e8c8';
    ctx.font = '22px Georgia, serif';
    ctx.fillText(row.name, tx, ty);
    ctx.fillText(`${row.found}/7`, tx + 330, ty);
    ctx.fillText(`+${row.bonus}`, tx + 480, ty);
    ty += 44;
  }
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 40px Georgia, serif';
  ctx.fillText(`Final score: ${state.score}`, W / 2, ty + 40);
  const blink = Math.sin(performance.now() / 1000 * 4) > -0.2;
  if (blink) {
    ctx.fillStyle = '#f6e8c8';
    ctx.font = 'bold 26px Georgia, serif';
    ctx.fillText('Press R or click to play again', W / 2, ty + 100);
  }
  ctx.textAlign = 'left';
}

function paint(nowMs) {
  const now = nowMs / 1000;
  ctx.clearRect(0, 0, W, H);
  if (state.screen === 'title') drawTitle(now);
  else if (state.screen === 'play') {
    drawHeader(now);
    drawPanels(now);
    drawFooter();
  } else if (state.screen === 'clear') drawClear();
  else if (state.screen === 'win') drawWin();
}

let last = performance.now();

function frame(nowMs) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.25, (nowMs - last) / 1000);
  last = nowMs;
  if (state.screen === 'play') {
    state.timeLeft -= dt;
    state.elapsed += dt;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      finishScene(true);
    }
  } else if (state.screen === 'clear' && nowMs / 1000 >= state.clearUntil) {
    startScene(state.sceneIndex + 1);
  }
  paint(nowMs);
}

const shot = params.get('shot');
if (shot) {
  applyShot(state, params);
  // Paint the frozen frame twice, then signal the screenshot is ready.
  let painted = 0;
  (function paintShot() {
    paint(performance.now());
    painted += 1;
    if (painted < 2) requestAnimationFrame(paintShot);
    else window.__shotReady = true;
  })();
} else {
  announce('Spot the Difference. Press Enter or click to play.');
  requestAnimationFrame(frame);
}
