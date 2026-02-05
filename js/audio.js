// NS-SHAFT Audio Manager - Procedural sound effects via Web Audio API

function AudioManager() {
  this.ctx = null;
  this.masterGain = null;
  this.unlocked = false;
  this.enabled = true;
}

AudioManager.prototype.unlock = function() {
  if (this.unlocked) return;

  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) { this.enabled = false; return; }

  this.ctx = new AC();
  this.masterGain = this.ctx.createGain();
  this.masterGain.gain.value = 0.3;
  this.masterGain.connect(this.ctx.destination);

  if (this.ctx.state === 'suspended') {
    this.ctx.resume();
  }

  this.unlocked = true;
};

AudioManager.prototype.playLand = function() {
  if (!this.unlocked || !this.enabled) return;
  var ctx = this.ctx;
  var bufferSize = Math.floor(ctx.sampleRate * 0.04);
  var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  var data = buffer.getChannelData(0);
  for (var i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  var source = ctx.createBufferSource();
  source.buffer = buffer;
  var filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 400;
  source.connect(filter);
  filter.connect(this.masterGain);
  source.start();
};

AudioManager.prototype.playDamage = function() {
  if (!this.unlocked || !this.enabled) return;
  var ctx = this.ctx;
  var t = ctx.currentTime;
  var osc = ctx.createOscillator();
  var gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(400, t);
  osc.frequency.exponentialRampToValueAtTime(80, t + 0.2);
  gain.gain.setValueAtTime(0.2, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
  osc.connect(gain);
  gain.connect(this.masterGain);
  osc.start(t);
  osc.stop(t + 0.25);
};

AudioManager.prototype.playHeal = function() {
  if (!this.unlocked || !this.enabled) return;
  var ctx = this.ctx;
  var t = ctx.currentTime;
  var osc = ctx.createOscillator();
  var gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(523, t);
  osc.frequency.setValueAtTime(659, t + 0.08);
  gain.gain.setValueAtTime(0.1, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
  osc.connect(gain);
  gain.connect(this.masterGain);
  osc.start(t);
  osc.stop(t + 0.16);
};

AudioManager.prototype.playSpring = function() {
  if (!this.unlocked || !this.enabled) return;
  var ctx = this.ctx;
  var t = ctx.currentTime;
  var osc = ctx.createOscillator();
  var gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(200, t);
  osc.frequency.exponentialRampToValueAtTime(800, t + 0.05);
  osc.frequency.exponentialRampToValueAtTime(300, t + 0.15);
  gain.gain.setValueAtTime(0.2, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  osc.connect(gain);
  gain.connect(this.masterGain);
  osc.start(t);
  osc.stop(t + 0.2);
};

AudioManager.prototype.playGameOver = function() {
  if (!this.unlocked || !this.enabled) return;
  var ctx = this.ctx;
  var t = ctx.currentTime;
  var notes = [440, 349, 294, 220];
  for (var i = 0; i < notes.length; i++) {
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'sine';
    var noteT = t + i * 0.18;
    osc.frequency.setValueAtTime(notes[i], noteT);
    gain.gain.setValueAtTime(0.15, noteT);
    gain.gain.exponentialRampToValueAtTime(0.001, noteT + 0.17);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(noteT);
    osc.stop(noteT + 0.17);
  }
};

AudioManager.prototype.playEasterEgg = function() {
  if (!this.unlocked || !this.enabled) return;
  var ctx = this.ctx;
  var t = ctx.currentTime;
  // Happy ascending arpeggio: C5 → E5 → G5 → C6
  var notes = [523, 659, 784, 1047];
  for (var i = 0; i < notes.length; i++) {
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'sine';
    var noteT = t + i * 0.15;
    osc.frequency.setValueAtTime(notes[i], noteT);
    gain.gain.setValueAtTime(0.15, noteT);
    gain.gain.exponentialRampToValueAtTime(0.001, noteT + 0.3);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(noteT);
    osc.stop(noteT + 0.3);
  }
};

AudioManager.prototype.playMenuSelect = function() {
  if (!this.unlocked || !this.enabled) return;
  var ctx = this.ctx;
  var t = ctx.currentTime;
  var osc = ctx.createOscillator();
  var gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(600, t);
  osc.frequency.exponentialRampToValueAtTime(900, t + 0.06);
  gain.gain.setValueAtTime(0.1, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  osc.connect(gain);
  gain.connect(this.masterGain);
  osc.start(t);
  osc.stop(t + 0.08);
};
