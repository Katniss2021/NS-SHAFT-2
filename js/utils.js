// NS-SHAFT Utility Functions

function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
  return Math.floor(randomRange(min, max + 1));
}

function weightedRandom(weights) {
  const entries = Object.entries(weights);
  let total = 0;
  for (let i = 0; i < entries.length; i++) total += entries[i][1];
  let r = Math.random() * total;
  for (let i = 0; i < entries.length; i++) {
    r -= entries[i][1];
    if (r <= 0) return entries[i][0];
  }
  return entries[0][0];
}

function aabbOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Storage full or unavailable
  }
}

function loadFromStorage(key, defaultValue) {
  try {
    const stored = localStorage.getItem(key);
    return stored !== null ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}
