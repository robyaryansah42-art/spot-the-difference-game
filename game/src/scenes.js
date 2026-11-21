// scenes.js — the three original scenes of Harbour Lights.
// Every scene is drawn procedurally on canvas. draw(ctx, w, h, mods) paints
// the base picture; `mods` is a Set of difference ids that change the right
// panel only. Each scene lists its 7 differences with the spot to tap.

function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function poly(ctx, points, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function gull(ctx, x, y, s, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x - 7 * s, y, 7 * s, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + 7 * s, y, 7 * s, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
}

function star(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    ctx[i === 0 ? 'moveTo' : 'lineTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
}

// ---------------------------------------------------------------- scene 1
function drawHarbour(ctx, W, H, mods) {
  const m = (i) => mods.has(i);
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#2c2a55');
  sky.addColorStop(0.55, '#b45a4e');
  sky.addColorStop(1, '#eda763');
  rect(ctx, 0, 0, W, 300, sky);
  // low sun and its glow
  circle(ctx, 470, 205, 52, 'rgba(255, 214, 130, 0.35)');
  circle(ctx, 470, 205, 34, '#ffd98a');
  // drifting clouds
  ctx.fillStyle = 'rgba(255, 190, 150, 0.55)';
  for (const [cx, cy, cw] of [[120, 70, 90], [250, 110, 70], [380, 55, 80]]) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, cw / 2, 14, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // gulls; the fourth only appears on the right panel
  gull(ctx, 180, 80, 1, '#2c2a55');
  gull(ctx, 240, 120, 0.8, '#2c2a55');
  gull(ctx, 350, 70, 0.9, '#2c2a55');
  if (m(1)) gull(ctx, 300, 95, 1, '#2c2a55');
  // sea
  rect(ctx, 0, 300, W, 160, '#274b63');
  ctx.strokeStyle = 'rgba(255, 214, 130, 0.5)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(430 - i * 18, 320 + i * 24);
    ctx.lineTo(510 + i * 18, 320 + i * 24);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(180, 220, 235, 0.35)';
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(40 + i * 90, 340 + (i % 3) * 30);
    ctx.lineTo(110 + i * 90, 340 + (i % 3) * 30);
    ctx.stroke();
  }
  // distant headland
  poly(ctx, [[0, 300], [0, 270], [90, 285], [170, 300]], '#3a3a5e');
  // harbour house with one lit window
  rect(ctx, 420, 235, 90, 65, '#5b3a4e');
  poly(ctx, [[415, 235], [465, 205], [515, 235]], '#3c2438');
  rect(ctx, 448, 252, 18, 18, m(5) ? '#3c2438' : '#ffd98a');
  rect(ctx, 482, 252, 18, 18, '#ffd98a');
  rect(ctx, 460, 272, 16, 28, '#2e1a2c');
  // lighthouse
  rect(ctx, 78, 130, 34, 170, '#f2ead8');
  ctx.fillStyle = '#c65a4a';
  ctx.fillRect(78, 165, 34, 22);
  ctx.fillRect(78, 225, 34, 22);
  rect(ctx, 70, 118, 50, 14, '#2e2a3a');
  // lamp: lit with a beam on the left, dark on the right
  if (m(0)) {
    circle(ctx, 95, 108, 11, '#4a4a5e');
  } else {
    circle(ctx, 95, 108, 11, '#ffe9a8');
    ctx.fillStyle = 'rgba(255, 233, 168, 0.30)';
    ctx.beginPath();
    ctx.moveTo(95, 108);
    ctx.lineTo(240, 70);
    ctx.lineTo(240, 145);
    ctx.closePath();
    ctx.fill();
  }
  // little flag on top; missing on the right
  if (!m(6)) {
    ctx.strokeStyle = '#2e2a3a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(95, 118);
    ctx.lineTo(95, 62);
    ctx.stroke();
    poly(ctx, [[95, 62], [128, 70], [95, 82]], '#e4572e');
  }
  // pier
  rect(ctx, 0, 385, 260, 18, '#6b4a33');
  rect(ctx, 0, 403, 260, 10, '#54382a');
  for (const px of [30, 90, 150, 210]) rect(ctx, px, 403, 10, 26, '#54382a');
  // crates on the pier; one vanishes on the right
  rect(ctx, 110, 360, 26, 26, '#a9803e');
  ctx.strokeStyle = '#7a5c28';
  ctx.lineWidth = 2;
  ctx.strokeRect(110, 360, 26, 26);
  if (!m(3)) {
    rect(ctx, 142, 360, 26, 26, '#c69a4e');
    ctx.strokeRect(142, 360, 26, 26);
  }
  // moored boats; the big sail changes colour on the right
  poly(ctx, [[300, 340], [300, 265], [360, 340]], m(2) ? '#d94f3d' : '#f2ead8');
  if (m(2)) {
    ctx.strokeStyle = '#f2ead8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(300, 285);
    ctx.lineTo(340, 320);
    ctx.stroke();
  }
  ctx.strokeStyle = '#2e2a3a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(300, 260);
  ctx.lineTo(300, 345);
  ctx.stroke();
  poly(ctx, [[285, 340], [375, 340], [360, 362], [300, 362]], '#7a4a2e');
  poly(ctx, [[430, 350], [430, 305], [470, 350]], '#e8dcc0');
  poly(ctx, [[420, 350], [480, 350], [468, 366], [432, 366]], '#5b3a2e');
  // buoy, orange on the left, green on the right
  circle(ctx, 520, 388, 12, m(4) ? '#3fae6a' : '#e8722a');
  ctx.fillStyle = '#f2ead8';
  ctx.fillRect(516, 372, 8, 8);
}

// ---------------------------------------------------------------- scene 2
function drawMarket(ctx, W, H, mods) {
  const m = (i) => mods.has(i);
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#141a3a');
  sky.addColorStop(1, '#2c2350');
  rect(ctx, 0, 0, W, H, sky);
  // stars
  for (const [sx, sy, sr] of [[60, 40, 2], [200, 30, 1.6], [330, 55, 2], [480, 35, 1.6], [560, 70, 2], [140, 90, 1.5]]) {
    circle(ctx, sx, sy, sr, '#ffe9a8');
  }
  // string lights across the top; one bulb is dark on the right
  ctx.strokeStyle = '#0c0c1a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 55);
  ctx.quadraticCurveTo(300, 105, 600, 55);
  ctx.stroke();
  const bulbXs = [60, 140, 220, 300, 380, 460, 540];
  bulbXs.forEach((bx, bi) => {
    const by = 55 + Math.sin((bx / 600) * Math.PI) * 38;
    const lit = !(m(4) && bi === 4);
    circle(ctx, bx, by + 12, 8, lit ? '#ffd166' : '#3a3a55');
    if (lit) circle(ctx, bx, by + 12, 13, 'rgba(255, 209, 102, 0.25)');
  });
  // ground
  rect(ctx, 0, 380, W, 80, '#3a2a3e');
  rect(ctx, 0, 380, W, 6, '#54405a');
  // left stall: striped awning, one stripe changes colour on the right
  poly(ctx, [[40, 150], [280, 150], [265, 200], [55, 200]], '#e4572e');
  for (let i = 0; i < 4; i++) {
    const x0 = 40 + i * 60;
    poly(ctx, [[x0, 150], [x0 + 30, 150], [x0 + 22, 200], [x0 - 8, 200]], m(3) && i === 2 ? '#3fae6a' : '#f6e8c8');
  }
  rect(ctx, 55, 200, 10, 150, '#6b4a33');
  rect(ctx, 255, 200, 10, 150, '#6b4a33');
  rect(ctx, 45, 330, 230, 16, '#8a5a3a');
  // fruit on the counter; one apple fewer on the right
  const apples = m(2) ? 4 : 5;
  for (let i = 0; i < apples; i++) circle(ctx, 90 + i * 34, 318, 12, i % 2 ? '#d94f3d' : '#e8722a');
  for (let i = 0; i < 3; i++) circle(ctx, 210 + i * 18, 322, 9, '#7fb069');
  // hanging lantern; red on the left, green on the right
  ctx.strokeStyle = '#0c0c1a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(120, 200);
  ctx.lineTo(120, 228);
  ctx.stroke();
  circle(ctx, 120, 242, 16, m(0) ? '#3fae6a' : '#d94f3d');
  circle(ctx, 120, 242, 21, m(0) ? 'rgba(63, 174, 106, 0.25)' : 'rgba(217, 79, 61, 0.25)');
  // vendor behind the counter; hat colour changes on the right
  circle(ctx, 350, 250, 26, '#e8b98a');
  poly(ctx, [[318, 248], [382, 248], [350, 212]], m(5) ? '#3fae6a' : '#e8a35c');
  rect(ctx, 318, 244, 64, 8, m(5) ? '#2f7a4e' : '#b4762e');
  circle(ctx, 336, 248, 3, '#2c2a3a');
  circle(ctx, 364, 248, 3, '#2c2a3a');
  ctx.strokeStyle = '#2c2a3a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(350, 258, 8, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  rect(ctx, 322, 280, 56, 60, '#4a6b8a');
  // sign board with a painted star
  rect(ctx, 400, 180, 150, 70, '#2e2a3a');
  ctx.strokeStyle = '#e8a35c';
  ctx.lineWidth = 3;
  ctx.strokeRect(400, 180, 150, 70);
  star(ctx, 430, 215, 14, '#ffd166');
  ctx.fillStyle = '#f6e8c8';
  ctx.font = 'bold 26px Georgia, serif';
  ctx.fillText('TEA', 455, 224);
  // right stall with jars
  poly(ctx, [[420, 300], [580, 300], [568, 340], [432, 340]], '#3fae6a');
  rect(ctx, 432, 340, 8, 40, '#6b4a33');
  rect(ctx, 560, 340, 8, 40, '#6b4a33');
  for (let i = 0; i < 3; i++) {
    rect(ctx, 440 + i * 45, 268, 30, 34, ['#e8a35c', '#d94f3d', '#7fb069'][i]);
    ctx.fillStyle = '#f6e8c8';
    ctx.fillRect(444 + i * 45, 262, 22, 8);
  }
  // basket on the ground; gone on the right
  if (!m(6)) {
    ctx.fillStyle = '#a9803e';
    ctx.beginPath();
    ctx.ellipse(95, 400, 34, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7a5c28';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(95, 398, 26, Math.PI, 0);
    ctx.stroke();
  }
  // the market cat, asleep on a crate; missing on the right
  if (!m(1)) {
    rect(ctx, 455, 385, 70, 26, '#8a5a3a');
    ctx.fillStyle = '#e8e8e8';
    ctx.beginPath();
    ctx.ellipse(490, 382, 26, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    circle(ctx, 512, 372, 10, '#e8e8e8');
    poly(ctx, [[506, 364], [510, 352], [516, 362]], '#e8e8e8');
    poly(ctx, [[516, 362], [522, 352], [524, 364]], '#e8e8e8');
    ctx.fillStyle = '#2c2a3a';
    ctx.fillRect(516, 370, 4, 2);
  }
}

// ---------------------------------------------------------------- scene 3
function drawCamp(ctx, W, H, mods) {
  const m = (i) => mods.has(i);
  const sky = ctx.createLinearGradient(0, 0, 0, 320);
  sky.addColorStop(0, '#0e2418');
  sky.addColorStop(1, '#2c5a34');
  rect(ctx, 0, 0, W, 320, sky);
  // moon: full on the left, crescent on the right
  circle(ctx, 520, 70, 30, '#f2ead8');
  if (m(4)) circle(ctx, 532, 62, 26, '#0e2418');
  // stars
  for (const [sx, sy, sr] of [[80, 50, 2], [180, 35, 1.6], [300, 60, 2], [420, 40, 1.6], [560, 110, 2], [60, 130, 1.5], [250, 100, 1.5]]) {
    circle(ctx, sx, sy, sr, '#ffe9a8');
  }
  // fireflies; one is missing on the right
  const flies = [[90, 180], [200, 140], [340, 110], [430, 170], [500, 110], [560, 200]];
  flies.forEach(([fx, fy], i) => {
    if (m(0) && i === 4) return;
    circle(ctx, fx, fy, 4, '#d8f79a');
    circle(ctx, fx, fy, 9, 'rgba(216, 247, 154, 0.3)');
  });
  // jungle trees
  for (const [tx, ty, ts, col] of [[40, 300, 1.2, '#1d4a2c'], [560, 290, 1.1, '#1d4a2c'], [90, 320, 0.9, '#27603a'], [520, 320, 0.85, '#27603a']]) {
    rect(ctx, tx - 6 * ts, ty - 90 * ts, 12 * ts, 90 * ts, '#4a3220');
    circle(ctx, tx, ty - 110 * ts, 46 * ts, col);
    circle(ctx, tx - 30 * ts, ty - 85 * ts, 30 * ts, col);
    circle(ctx, tx + 30 * ts, ty - 85 * ts, 30 * ts, col);
  }
  // ground
  rect(ctx, 0, 320, W, 140, '#3a5a2e');
  rect(ctx, 0, 320, W, 8, '#4a6b3a');
  // tent with a little flag; the flag changes colour on the right
  poly(ctx, [[120, 380], [180, 250], [240, 380]], '#d94f3d');
  poly(ctx, [[180, 250], [240, 380], [180, 380]], '#b73a2c');
  ctx.strokeStyle = '#2e2a3a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(180, 250);
  ctx.lineTo(180, 215);
  ctx.stroke();
  poly(ctx, [[180, 215], [208, 222], [180, 232]], m(1) ? '#3fae6a' : '#ffd166');
  rect(ctx, 168, 350, 24, 30, '#2e2a3a');
  // hammock between two posts
  ctx.strokeStyle = '#8a5a3a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(300, 300);
  ctx.lineTo(300, 380);
  ctx.moveTo(470, 300);
  ctx.lineTo(470, 380);
  ctx.stroke();
  ctx.strokeStyle = '#e8a35c';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(300, 315);
  ctx.quadraticCurveTo(385, 355, 470, 315);
  ctx.stroke();
  // bird on a branch; gone on the right
  ctx.strokeStyle = '#4a3220';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(440, 150);
  ctx.lineTo(520, 135);
  ctx.stroke();
  if (!m(2)) {
    circle(ctx, 488, 128, 12, '#4a90d9');
    circle(ctx, 498, 124, 7, '#4a90d9');
    poly(ctx, [[504, 124], [514, 127], [504, 130]], '#e8a35c');
    ctx.fillStyle = '#2c2a3a';
    ctx.fillRect(499, 121, 3, 3);
  }
  // campfire
  circle(ctx, 300, 410, 26, 'rgba(255, 180, 80, 0.25)');
  poly(ctx, [[282, 415], [300, 378], [318, 415]], '#e8722a');
  poly(ctx, [[290, 415], [300, 388], [310, 415]], '#ffd166');
  ctx.strokeStyle = '#4a3220';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(278, 418);
  ctx.lineTo(322, 408);
  ctx.moveTo(322, 418);
  ctx.lineTo(278, 408);
  ctx.stroke();
  // spare log by the fire; missing on the right
  if (!m(5)) {
    ctx.strokeStyle = '#6b4a33';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(340, 428);
    ctx.lineTo(392, 420);
    ctx.stroke();
    circle(ctx, 392, 420, 5, '#c69a4e');
  }
  // backpack; orange on the left, teal on the right
  rect(ctx, 420, 385, 44, 40, m(3) ? '#2e8a7a' : '#e8722a');
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(420, 385, 44, 10);
  ctx.strokeStyle = '#2e2a3a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(442, 385, 12, Math.PI, 0);
  ctx.stroke();
  // wildflower; yellow on the left, pink on the right
  ctx.strokeStyle = '#27603a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(90, 330);
  ctx.lineTo(90, 300);
  ctx.stroke();
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    circle(ctx, 90 + Math.cos(a) * 8, 296 + Math.sin(a) * 8, 5, m(6) ? '#e87ab0' : '#ffd166');
  }
  circle(ctx, 90, 296, 5, '#e8722a');
}

export const SCENES = [
  {
    id: 'harbour',
    name: 'Harbour Lights',
    sub: 'Dusk at the old pier — 7 differences hide between the two pictures.',
    timeLimit: 90,
    radius: 34,
    draw: drawHarbour,
    diffs: [
      { x: 95, y: 108, label: 'Lighthouse lamp' },
      { x: 300, y: 95, label: 'Extra gull' },
      { x: 330, y: 300, label: 'Sail colour' },
      { x: 155, y: 373, label: 'Missing crate' },
      { x: 520, y: 388, label: 'Buoy colour' },
      { x: 457, y: 261, label: 'Dark window' },
      { x: 110, y: 70, label: 'Missing flag' },
    ],
  },
  {
    id: 'market',
    name: 'Night Market',
    sub: 'Lanterns, tea and a sleeping cat — 7 differences hide between the two pictures.',
    timeLimit: 75,
    radius: 30,
    draw: drawMarket,
    diffs: [
      { x: 120, y: 242, label: 'Lantern colour' },
      { x: 490, y: 378, label: 'Missing cat' },
      { x: 224, y: 318, label: 'Missing apple' },
      { x: 170, y: 175, label: 'Awning stripe' },
      { x: 380, y: 100, label: 'Dark bulb' },
      { x: 350, y: 228, label: 'Hat colour' },
      { x: 95, y: 400, label: 'Missing basket' },
    ],
  },
  {
    id: 'camp',
    name: 'Jungle Camp',
    sub: 'Fireflies and a campfire under the moon — 7 differences hide between the two pictures.',
    timeLimit: 60,
    radius: 26,
    draw: drawCamp,
    diffs: [
      { x: 500, y: 110, label: 'Missing firefly' },
      { x: 194, y: 222, label: 'Flag colour' },
      { x: 488, y: 128, label: 'Missing bird' },
      { x: 442, y: 405, label: 'Backpack colour' },
      { x: 520, y: 70, label: 'Moon phase' },
      { x: 366, y: 424, label: 'Missing log' },
      { x: 90, y: 296, label: 'Flower colour' },
    ],
  },
];
