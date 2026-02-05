// NS-SHAFT Player

function Player() {
  this.reset();
}

Player.prototype.reset = function() {
  this.x = C.GAME_WIDTH / 2 - C.PLAYER_WIDTH / 2;
  this.y = 80;
  this.vx = 0;
  this.vy = 0;
  this.width = C.PLAYER_WIDTH;
  this.height = C.PLAYER_HEIGHT;
  this.hp = C.PLAYER_START_HP;
  this.maxHp = C.PLAYER_MAX_HP;
  this.isOnPlatform = false;
  this.currentPlatform = null;
  this.facing = 0; // -1 left, 0 neutral, 1 right
  this.invulnerable = 0;
  this.isAlive = true;
  this.walkFrame = 0;
  this.walkTimer = 0;
};

Player.prototype.update = function(direction, scrollSpeed) {
  // Horizontal movement
  if (direction !== 0) {
    this.vx = direction * C.PLAYER_SPEED;
    this.facing = direction;
  } else {
    this.vx *= 0.7;
    if (Math.abs(this.vx) < 0.1) this.vx = 0;
  }

  // Conveyor belt push (continuous while standing)
  if (this.isOnPlatform && this.currentPlatform && this.currentPlatform.type === 'conveyor') {
    this.vx += this.currentPlatform.direction * C.CONVEYOR_PUSH_SPEED * 0.15;
  }

  this.x += this.vx;

  // Screen wrap
  if (this.x + this.width < 0) this.x = C.GAME_WIDTH;
  if (this.x > C.GAME_WIDTH) this.x = -this.width;

  // Gravity
  this.vy += C.PLAYER_GRAVITY;
  if (this.vy > C.PLAYER_MAX_FALL_SPEED) this.vy = C.PLAYER_MAX_FALL_SPEED;
  this.y += this.vy;

  // If on platform, scroll up with platforms
  if (this.isOnPlatform) {
    this.y -= scrollSpeed;
  }

  this.isOnPlatform = false;
  this.currentPlatform = null;

  // Invulnerability countdown
  if (this.invulnerable > 0) this.invulnerable--;

  // Walk animation
  if (Math.abs(this.vx) > 0.5) {
    this.walkTimer++;
    if (this.walkTimer > 6) {
      this.walkTimer = 0;
      this.walkFrame = (this.walkFrame + 1) % 4;
    }
  } else {
    this.walkFrame = 0;
    this.walkTimer = 0;
  }
};

Player.prototype.landOnPlatform = function(platY, platform) {
  this.y = platY - this.height;
  this.vy = 0;
  this.isOnPlatform = true;
  this.currentPlatform = platform || null;
};

Player.prototype.takeDamage = function(amount) {
  if (this.invulnerable > 0) return;
  this.hp -= amount;
  if (this.hp <= 0) {
    this.hp = 0;
    this.isAlive = false;
  }
  this.invulnerable = C.INVULNERABLE_FRAMES;
};

Player.prototype.heal = function(amount) {
  this.hp += amount;
  if (this.hp > this.maxHp) this.hp = this.maxHp;
};

Player.prototype.getBounds = function() {
  return { x: this.x, y: this.y, w: this.width, h: this.height };
};

Player.prototype.draw = function(ctx) {
  // Invulnerability flicker
  if (this.invulnerable > 0 && this.invulnerable % 4 < 2) return;

  var x = Math.round(this.x);
  var y = Math.round(this.y);
  var f = this.facing;
  var wf = this.walkFrame;

  // Hair
  ctx.fillStyle = C.COLOR_PLAYER_HAIR;
  ctx.fillRect(x + 3, y, 14, 5);

  // Head (skin)
  ctx.fillStyle = C.COLOR_PLAYER_BODY;
  ctx.fillRect(x + 4, y + 3, 12, 8);

  // Eyes
  ctx.fillStyle = '#000';
  if (f <= 0) ctx.fillRect(x + 6, y + 5, 2, 2);
  if (f >= 0) ctx.fillRect(x + 12, y + 5, 2, 2);

  // Body (shirt)
  ctx.fillStyle = C.COLOR_PLAYER_SHIRT;
  ctx.fillRect(x + 3, y + 11, 14, 7);

  // Arms
  var armOffL = (wf === 1 || wf === 3) ? -1 : 0;
  var armOffR = (wf === 2 || wf === 0) ? -1 : 0;
  ctx.fillRect(x, y + 11 + armOffL, 3, 6);
  ctx.fillRect(x + 17, y + 11 + armOffR, 3, 6);

  // Hands
  ctx.fillStyle = C.COLOR_PLAYER_BODY;
  ctx.fillRect(x, y + 16 + armOffL, 3, 2);
  ctx.fillRect(x + 17, y + 16 + armOffR, 3, 2);

  // Pants
  ctx.fillStyle = C.COLOR_PLAYER_PANTS;
  ctx.fillRect(x + 4, y + 18, 5, 3);
  ctx.fillRect(x + 11, y + 18, 5, 3);

  // Legs / feet with walk animation
  ctx.fillStyle = C.COLOR_PLAYER_SHOES;
  var legOffL = 0, legOffR = 0;
  if (wf === 1) { legOffL = -1; legOffR = 1; }
  else if (wf === 3) { legOffL = 1; legOffR = -1; }
  ctx.fillRect(x + 4 + legOffL, y + 21, 5, 3);
  ctx.fillRect(x + 11 + legOffR, y + 21, 5, 3);
};
