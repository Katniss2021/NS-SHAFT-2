// NS-SHAFT Renderer - All drawing operations

function Renderer(ctx) {
  this.ctx = ctx;
  this.blinkTimer = 0;
}

Renderer.prototype.clear = function() {
  var ctx = this.ctx;
  // Dark gradient background
  var grad = ctx.createLinearGradient(0, 0, 0, C.GAME_HEIGHT);
  grad.addColorStop(0, C.COLOR_BG);
  grad.addColorStop(1, C.COLOR_BG_GRADIENT);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, C.GAME_WIDTH, C.GAME_HEIGHT);
};

Renderer.prototype.drawWalls = function() {
  var ctx = this.ctx;
  ctx.fillStyle = C.COLOR_WALL;
  // Left wall texture
  for (var y = 0; y < C.GAME_HEIGHT; y += 16) {
    ctx.fillRect(0, y, 4, 14);
  }
  // Right wall texture
  for (var y = 0; y < C.GAME_HEIGHT; y += 16) {
    ctx.fillRect(C.GAME_WIDTH - 4, y, 4, 14);
  }
};

Renderer.prototype.drawCeiling = function() {
  var ctx = this.ctx;
  // Ceiling bar
  ctx.fillStyle = '#333355';
  ctx.fillRect(0, 0, C.GAME_WIDTH, C.SPIKE_CEILING_Y + 4);

  // Spikes hanging down
  ctx.fillStyle = C.COLOR_CEILING_SPIKE;
  var spikeW = 12;
  var spikeH = C.SPIKE_HEIGHT - 4;
  for (var x = 0; x < C.GAME_WIDTH; x += spikeW) {
    ctx.beginPath();
    ctx.moveTo(x, C.SPIKE_CEILING_Y + 4);
    ctx.lineTo(x + spikeW, C.SPIKE_CEILING_Y + 4);
    ctx.lineTo(x + spikeW / 2, C.SPIKE_CEILING_Y + 4 + spikeH);
    ctx.closePath();
    ctx.fill();
  }
};

Renderer.prototype.drawText = function(text, x, y, size, color, align) {
  var ctx = this.ctx;
  ctx.font = 'bold ' + size + 'px "Courier New", monospace';
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'top';
  // Shadow
  ctx.fillStyle = C.COLOR_TEXT_SHADOW;
  ctx.fillText(text, x + 1, y + 1);
  // Text
  ctx.fillStyle = color || C.COLOR_TEXT;
  ctx.fillText(text, x, y);
};

Renderer.prototype.drawHPBar = function(hp, maxHp) {
  var ctx = this.ctx;
  var x = 10, y = C.SPIKE_HEIGHT + 4;
  var barW = 80, barH = 8;
  var ratio = hp / maxHp;

  // Background
  ctx.fillStyle = C.COLOR_HP_BG;
  ctx.fillRect(x, y, barW, barH);

  // Fill
  ctx.fillStyle = ratio > 0.3 ? C.COLOR_HP_FG : C.COLOR_HP_LOW;
  ctx.fillRect(x, y, barW * ratio, barH);

  // Border
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, barW, barH);

  // Text
  this.drawText('HP', x + barW + 4, y - 1, 8, C.COLOR_TEXT);
};

Renderer.prototype.drawHUD = function(hp, maxHp, score, level) {
  this.drawHPBar(hp, maxHp);
  this.drawText('FLOOR ' + score, C.GAME_WIDTH - 10, C.SPIKE_HEIGHT + 3, 10, C.COLOR_TEXT, 'right');
  this.drawText('LV ' + level, C.GAME_WIDTH - 10, C.SPIKE_HEIGHT + 16, 8, '#aaaaaa', 'right');
};

Renderer.prototype.drawMenu = function(highScore, frameCount) {
  var ctx = this.ctx;
  this.clear();
  this.drawWalls();

  // Title
  this.drawText('NS-SHAFT', C.GAME_WIDTH / 2, 120, 28, C.COLOR_MENU_TITLE, 'center');

  // Subtitle
  this.drawText('Go Down The Shaft!', C.GAME_WIDTH / 2, 160, 10, '#aaaaaa', 'center');

  // Blink "Tap to Start"
  if (Math.floor(frameCount / 30) % 2 === 0) {
    this.drawText('TAP TO START', C.GAME_WIDTH / 2, 220, 14, C.COLOR_TEXT, 'center');
  }

  // High score
  if (highScore > 0) {
    this.drawText('BEST: ' + highScore, C.GAME_WIDTH / 2, 270, 12, '#ffcc33', 'center');
  }

  // Controls info
  this.drawText('Arrow Keys / Touch', C.GAME_WIDTH / 2, 380, 9, '#666666', 'center');
  this.drawText('to move left & right', C.GAME_WIDTH / 2, 394, 9, '#666666', 'center');
};

Renderer.prototype.drawGameOver = function(score, highScore, isNewRecord, frameCount) {
  var ctx = this.ctx;

  // Dark overlay
  ctx.fillStyle = C.COLOR_OVERLAY;
  ctx.fillRect(0, 0, C.GAME_WIDTH, C.GAME_HEIGHT);

  // Game Over text
  this.drawText('GAME OVER', C.GAME_WIDTH / 2, 140, 24, C.COLOR_GAMEOVER, 'center');

  // Score
  this.drawText('FLOOR: ' + score, C.GAME_WIDTH / 2, 190, 16, C.COLOR_TEXT, 'center');

  // Best
  this.drawText('BEST: ' + highScore, C.GAME_WIDTH / 2, 220, 12, '#ffcc33', 'center');

  // New record
  if (isNewRecord) {
    if (Math.floor(frameCount / 15) % 2 === 0) {
      this.drawText('NEW RECORD!', C.GAME_WIDTH / 2, 250, 14, '#ff6633', 'center');
    }
  }

  // Restart prompt
  if (frameCount > C.GAMEOVER_DELAY) {
    if (Math.floor(frameCount / 30) % 2 === 0) {
      this.drawText('TAP TO RESTART', C.GAME_WIDTH / 2, 300, 12, C.COLOR_TEXT, 'center');
    }
  }
};
