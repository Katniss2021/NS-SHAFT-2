// NS-SHAFT Platform Types

// --- Base Platform ---
function Platform(x, y, type) {
  this.x = x;
  this.y = y;
  this.width = C.PLATFORM_WIDTH;
  this.height = C.PLATFORM_HEIGHT;
  this.type = type || 'normal';
  this.isActive = true;
}

Platform.prototype.update = function(scrollSpeed) {
  this.y -= scrollSpeed;
};

Platform.prototype.onLand = function(player) {};

Platform.prototype.getBounds = function() {
  return { x: this.x, y: this.y, w: this.width, h: this.height };
};

Platform.prototype.draw = function(ctx) {};

// --- Normal Platform ---
function NormalPlatform(x, y) {
  Platform.call(this, x, y, 'normal');
}
NormalPlatform.prototype = Object.create(Platform.prototype);

NormalPlatform.prototype.onLand = function(player) {
  player.heal(C.HP_HEAL_NORMAL);
};

NormalPlatform.prototype.draw = function(ctx) {
  ctx.fillStyle = C.COLOR_PLATFORM_NORMAL;
  ctx.fillRect(this.x, this.y, this.width, this.height);
  ctx.fillStyle = C.COLOR_PLATFORM_NORMAL_TOP;
  ctx.fillRect(this.x, this.y, this.width, 2);
};

// --- Spike Platform ---
function SpikePlatform(x, y) {
  Platform.call(this, x, y, 'spike');
}
SpikePlatform.prototype = Object.create(Platform.prototype);

SpikePlatform.prototype.onLand = function(player) {
  player.takeDamage(C.HP_DAMAGE_SPIKE);
};

SpikePlatform.prototype.draw = function(ctx) {
  // Base
  ctx.fillStyle = C.COLOR_PLATFORM_SPIKE_BASE;
  ctx.fillRect(this.x, this.y + 3, this.width, this.height - 3);
  // Spikes on top
  ctx.fillStyle = C.COLOR_PLATFORM_SPIKE;
  var spikeW = 8;
  for (var sx = this.x; sx < this.x + this.width; sx += spikeW) {
    var sw = Math.min(spikeW, this.x + this.width - sx);
    ctx.beginPath();
    ctx.moveTo(sx, this.y + 3);
    ctx.lineTo(sx + sw, this.y + 3);
    ctx.lineTo(sx + sw / 2, this.y - 2);
    ctx.closePath();
    ctx.fill();
  }
};

// --- Conveyor Platform ---
function ConveyorPlatform(x, y, direction) {
  Platform.call(this, x, y, 'conveyor');
  this.direction = direction; // -1 left, 1 right
  this.arrowOffset = 0;
}
ConveyorPlatform.prototype = Object.create(Platform.prototype);

ConveyorPlatform.prototype.onLand = function(player) {
  player.heal(C.HP_HEAL_NORMAL);
};

ConveyorPlatform.prototype.update = function(scrollSpeed) {
  Platform.prototype.update.call(this, scrollSpeed);
  this.arrowOffset = (this.arrowOffset + this.direction * 0.5) % 8;
  if (this.arrowOffset < 0) this.arrowOffset += 8;
};

ConveyorPlatform.prototype.draw = function(ctx) {
  ctx.fillStyle = C.COLOR_PLATFORM_CONVEYOR;
  ctx.fillRect(this.x, this.y, this.width, this.height);
  ctx.fillStyle = C.COLOR_PLATFORM_CONVEYOR_TOP;
  ctx.fillRect(this.x, this.y, this.width, 2);

  // Arrow indicators
  ctx.fillStyle = '#ffffff';
  var arrowChar = this.direction > 0 ? '>' : '<';
  ctx.font = 'bold 7px monospace';
  ctx.textBaseline = 'top';
  var step = 14;
  var offset = Math.floor(this.arrowOffset);
  for (var ax = this.x + 3 + offset; ax < this.x + this.width - 3; ax += step) {
    ctx.fillText(arrowChar, ax, this.y + 1);
  }
};

// --- Crumble Platform ---
function CrumblePlatform(x, y) {
  Platform.call(this, x, y, 'crumble');
  this.crumbling = false;
  this.timer = C.CRUMBLE_LIFETIME;
}
CrumblePlatform.prototype = Object.create(Platform.prototype);

CrumblePlatform.prototype.onLand = function(player) {
  player.heal(C.HP_HEAL_NORMAL);
  if (!this.crumbling) {
    this.crumbling = true;
    this.timer = C.CRUMBLE_LIFETIME;
  }
};

CrumblePlatform.prototype.update = function(scrollSpeed) {
  Platform.prototype.update.call(this, scrollSpeed);
  if (this.crumbling) {
    this.timer--;
    if (this.timer <= 0) {
      this.isActive = false;
    }
  }
};

CrumblePlatform.prototype.draw = function(ctx) {
  if (!this.isActive) return;

  var shakeX = 0, shakeY = 0;
  if (this.crumbling) {
    shakeX = (Math.random() - 0.5) * 3;
    shakeY = (Math.random() - 0.5) * 2;
  }

  var alpha = this.crumbling ? Math.max(0.3, this.timer / C.CRUMBLE_LIFETIME) : 1;
  ctx.globalAlpha = alpha;

  ctx.fillStyle = C.COLOR_PLATFORM_CRUMBLE;
  ctx.fillRect(this.x + shakeX, this.y + shakeY, this.width, this.height);
  ctx.fillStyle = C.COLOR_PLATFORM_CRUMBLE_TOP;
  ctx.fillRect(this.x + shakeX, this.y + shakeY, this.width, 2);

  // Crack lines when crumbling
  if (this.crumbling) {
    ctx.strokeStyle = '#aa8822';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x + shakeX + this.width * 0.3, this.y + shakeY);
    ctx.lineTo(this.x + shakeX + this.width * 0.4, this.y + shakeY + this.height);
    ctx.moveTo(this.x + shakeX + this.width * 0.7, this.y + shakeY);
    ctx.lineTo(this.x + shakeX + this.width * 0.6, this.y + shakeY + this.height);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
};

CrumblePlatform.prototype.resetCrumble = function() {
  this.crumbling = false;
  this.timer = C.CRUMBLE_LIFETIME;
  this.isActive = true;
};

// --- Spring Platform ---
function SpringPlatform(x, y) {
  Platform.call(this, x, y, 'spring');
  this.compressed = false;
  this.compressTimer = 0;
}
SpringPlatform.prototype = Object.create(Platform.prototype);

SpringPlatform.prototype.onLand = function(player) {
  player.vy = C.SPRING_BOUNCE_VY;
  player.isOnPlatform = false;
  this.compressed = true;
  this.compressTimer = 10;
};

SpringPlatform.prototype.update = function(scrollSpeed) {
  Platform.prototype.update.call(this, scrollSpeed);
  if (this.compressed) {
    this.compressTimer--;
    if (this.compressTimer <= 0) this.compressed = false;
  }
};

SpringPlatform.prototype.draw = function(ctx) {
  // Base
  ctx.fillStyle = C.COLOR_PLATFORM_SPRING;
  ctx.fillRect(this.x, this.y + 2, this.width, this.height - 2);

  // Spring coils
  var coilH = this.compressed ? 2 : 5;
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 2;
  var cx = this.x + this.width / 2;
  ctx.beginPath();
  for (var i = 0; i < 4; i++) {
    var cy = this.y - coilH + i * (coilH / 3);
    var halfW = (this.width / 2 - 8) * (i % 2 === 0 ? 1 : -1);
    ctx.moveTo(cx - halfW, cy);
    ctx.lineTo(cx + halfW, cy + coilH / 4);
  }
  ctx.stroke();

  // Top plate
  ctx.fillStyle = C.COLOR_PLATFORM_SPRING_TOP;
  ctx.fillRect(this.x + 4, this.y - coilH - 2, this.width - 8, 3);
};
