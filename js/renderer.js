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

Renderer.prototype.drawEasterEgg = function(image, phase, timer) {
  var ctx = this.ctx;
  var REVEAL_FRAMES = 120;
  var FADE_FRAMES = 30;

  // Dark overlay
  var overlayAlpha = 0.82;
  if (phase === 'fading') {
    overlayAlpha = 0.82 * (1 - timer / FADE_FRAMES);
  }
  ctx.fillStyle = 'rgba(0, 0, 0, ' + overlayAlpha + ')';
  ctx.fillRect(0, 0, C.GAME_WIDTH, C.GAME_HEIGHT);

  if (!image || !image.complete) return;

  // Calculate image display dimensions (fit in ~300x180 area)
  var maxW = 300;
  var maxH = 180;
  var imgAspect = image.width / image.height;
  var drawW, drawH;
  if (imgAspect > maxW / maxH) {
    drawW = maxW;
    drawH = maxW / imgAspect;
  } else {
    drawH = maxH;
    drawW = maxH * imgAspect;
  }
  var drawX = (C.GAME_WIDTH - drawW) / 2;
  var drawY = 100;

  // Content alpha for fade
  var contentAlpha = 1;
  if (phase === 'fading') {
    contentAlpha = 1 - timer / FADE_FRAMES;
  }
  ctx.globalAlpha = contentAlpha;

  // === STRIP REVEAL (BLINDS EFFECT) ===
  var NUM_STRIPS = 20;
  var stripH = drawH / NUM_STRIPS;

  if (phase === 'revealing') {
    var progress = timer / REVEAL_FRAMES; // 0 to 1

    for (var i = 0; i < NUM_STRIPS; i++) {
      // Stagger: center strips start first, edges last
      var distFromCenter = Math.abs(i - NUM_STRIPS / 2) / (NUM_STRIPS / 2);
      var stripDelay = (1 - distFromCenter) * 0.3; // center delay=0.3, edge delay=0
      // Invert: center starts earlier
      var stripProgress = clamp((progress - (0.3 - stripDelay)) / 0.7, 0, 1);
      // Ease-out
      stripProgress = 1 - Math.pow(1 - stripProgress, 2);

      if (stripProgress <= 0) continue;

      var srcY = (i * image.height) / NUM_STRIPS;
      var srcH = image.height / NUM_STRIPS;
      var destY = drawY + i * stripH;
      var revealW = drawW * stripProgress;

      // Alternate strips: even from left, odd from right
      var destX;
      if (i % 2 === 0) {
        destX = drawX;
      } else {
        destX = drawX + drawW - revealW;
      }

      ctx.save();
      ctx.beginPath();
      ctx.rect(destX, destY, revealW, stripH + 0.5);
      ctx.clip();
      ctx.drawImage(image, 0, srcY, image.width, srcH + 1,
                    drawX, destY, drawW, stripH + 0.5);
      ctx.restore();
    }
  } else {
    // 'showing' or 'fading' — full image
    ctx.drawImage(image, drawX, drawY, drawW, drawH);
  }

  // Gold border around image
  ctx.strokeStyle = '#ffcc33';
  ctx.lineWidth = 2;
  ctx.strokeRect(drawX - 2, drawY - 2, drawW + 4, drawH + 4);

  // "大西瓜谢谢你！" text
  var textY = drawY + drawH + 20;
  ctx.font = 'bold 16px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#000';
  ctx.fillText('\u5927\u897F\u74DC\uFF0CKat\uFF0CKaori \uFF1A\uFF09', C.GAME_WIDTH / 2 + 1, textY + 1);
  ctx.fillStyle = '#ffcc33';
  ctx.fillText('\u5927\u897F\u74DC\uFF0CKat\uFF0CKaori \uFF1A\uFF09', C.GAME_WIDTH / 2, textY);

  // "FLOOR 100!" badge
  this.drawText('FLOOR 100!', C.GAME_WIDTH / 2, textY + 26, 11, '#ffffff', 'center');

  // "Tap to continue" hint during showing phase
  if (phase === 'showing') {
    if (Math.floor(timer / 30) % 2 === 0) {
      this.drawText('TAP TO CONTINUE', C.GAME_WIDTH / 2, C.GAME_HEIGHT - 40, 9, '#555555', 'center');
    }
  }

  ctx.globalAlpha = 1;
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
