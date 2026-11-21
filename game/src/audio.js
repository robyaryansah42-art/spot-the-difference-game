// audio.js — all sound is synthesised with WebAudio; no audio files, no network.
// A tiny synth that plays short blips and chimes for finds, mistakes, hints
// and the win fanfare. It stays silent until the first click or keypress,
// because browsers only allow audio after a user gesture.

export class Sound {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  tone(freq, startAt, dur, type, vol) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + startAt;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  // a warm two-note chime when a difference is found
  found() {
    this.ensure();
    this.tone(660, 0, 0.16, 'sine', 0.22);
    this.tone(990, 0.09, 0.26, 'sine', 0.2);
  }

  // a low buzz for a wrong tap
  wrong() {
    this.ensure();
    this.tone(140, 0, 0.18, 'sawtooth', 0.1);
  }

  // a soft blip for a hint
  hint() {
    this.ensure();
    this.tone(520, 0, 0.12, 'triangle', 0.16);
    this.tone(780, 0.08, 0.14, 'triangle', 0.14);
  }

  // a short tick for a plain click
  tick() {
    this.ensure();
    this.tone(440, 0, 0.06, 'triangle', 0.08);
  }

  // a rising arpeggio when a scene is cleared
  clear() {
    this.ensure();
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, i * 0.1, 0.22, 'sine', 0.18));
  }

  // a longer fanfare for the final win screen
  win() {
    this.ensure();
    [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => this.tone(f, i * 0.13, 0.3, 'sine', 0.18));
  }
}
