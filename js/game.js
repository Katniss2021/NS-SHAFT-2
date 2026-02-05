// NS-SHAFT Game - State machine, collisions, orchestrator

function Game(canvas, ctx) {
  this.canvas = canvas;
  this.ctx = ctx;
  this.renderer = new Renderer(ctx);
  this.platformManager = new PlatformManager();
  this.player = new Player();
  this.audio = new AudioManager();

  this.scaleInfo = { scale: 1, offsetX: 0, offsetY: 0 };
  this.input = new InputManager(canvas, this.scaleInfo);

  this.state = 'menu'; // 'menu' | 'playing' | 'gameover' | 'easter_egg'
  this.score = 0;
  this.level = 0;
  this.scrollSpeed = C.PLATFORM_BASE_SPEED;
  this.highScores = [];
  this.isNewRecord = false;
  this.frameCount = 0;
  this.gameOverTimer = 0;

  // Easter egg (floor 100)
  this.easterEggImage = new Image();
  this.easterEggImage.src = 'Selfie.jpg';
  this.easterEggTriggered = false;
  this.easterEggTimer = 0;
  this.easterEggPhase = 'idle'; // 'idle' | 'revealing' | 'showing' | 'fading'
}

Game.prototype.init = function() {
  this.highScores = loadFromStorage('ns-shaft-highscores', []);
  this.state = 'menu';
  this.frameCount = 0;
};

Game.prototype.start = function() {
  this.state = 'playing';
  this.score = 0;
  this.level = 0;
  this.scrollSpeed = C.PLATFORM_BASE_SPEED;
  this.isNewRecord = false;
  this.easterEggTriggered = false;
  this.player.reset();
  this.platformManager.init();
  this.platformManager.level = 0;
  this.audio.unlock();
  this.audio.playMenuSelect();
};

Game.prototype.update = function() {
  this.frameCount++;

  switch (this.state) {
    case 'menu':
      if (this.input.consumeAction()) {
        this.start();
      }
      break;

    case 'playing':
      this.updatePlaying();
      break;

    case 'gameover':
      this.gameOverTimer++;
      if (this.gameOverTimer > C.GAMEOVER_DELAY && this.input.consumeAction()) {
        this.state = 'menu';
        this.frameCount = 0;
      }
      break;

    case 'easter_egg':
      this.updateEasterEgg();
      break;
  }
};

Game.prototype.updatePlaying = function() {
  var direction = this.input.getDirection();

  // Update player
  this.player.update(direction, this.scrollSpeed);

  // Track recycled count before update for scoring
  var prevRecycled = this.platformManager.recycledCount;

  // Update platforms
  this.platformManager.update(this.scrollSpeed);

  // Score: count platforms that were recycled this frame
  var newRecycled = this.platformManager.recycledCount - prevRecycled;
  if (newRecycled > 0) {
    this.score += newRecycled * C.SCORE_PER_PLATFORM;
    this.updateDifficulty();
  }

  // Easter egg trigger at floor 100
  if (this.score >= 100 && !this.easterEggTriggered) {
    this.easterEggTriggered = true;
    this.easterEggTimer = 0;
    this.easterEggPhase = 'revealing';
    this.state = 'easter_egg';
    this.audio.playEasterEgg();
    return;
  }

  // Collision detection
  this.checkCollisions();

  // Check death: fall off bottom
  if (this.player.y > C.GAME_HEIGHT) {
    this.doGameOver();
    return;
  }

  // Check death: HP depleted
  if (!this.player.isAlive) {
    this.doGameOver();
    return;
  }

  // Check ceiling collision
  if (this.player.y < C.SPIKE_CEILING_Y + C.SPIKE_HEIGHT) {
    this.player.takeDamage(C.HP_DAMAGE_SPIKE);
    this.player.y = C.SPIKE_CEILING_Y + C.SPIKE_HEIGHT;
    this.player.vy = 2;
    this.audio.playDamage();
    if (!this.player.isAlive) {
      this.doGameOver();
      return;
    }
  }
};

Game.prototype.updateEasterEgg = function() {
  this.easterEggTimer++;

  var REVEAL_FRAMES = 120;  // 2s
  var SHOW_FRAMES = 180;    // 3s
  var FADE_FRAMES = 30;     // 0.5s

  if (this.easterEggPhase === 'revealing' && this.easterEggTimer >= REVEAL_FRAMES) {
    this.easterEggPhase = 'showing';
    this.easterEggTimer = 0;
  } else if (this.easterEggPhase === 'showing') {
    // Tap to skip
    if (this.input.consumeAction()) {
      this.easterEggPhase = 'fading';
      this.easterEggTimer = 0;
    } else if (this.easterEggTimer >= SHOW_FRAMES) {
      this.easterEggPhase = 'fading';
      this.easterEggTimer = 0;
    }
  } else if (this.easterEggPhase === 'fading' && this.easterEggTimer >= FADE_FRAMES) {
    this.easterEggPhase = 'idle';
    this.state = 'playing';
  }
};

Game.prototype.checkCollisions = function() {
  if (this.player.vy <= 0) return; // Only check when falling

  var platforms = this.platformManager.getActivePlatforms();
  var pb = this.player.getBounds();
  var feetY = pb.y + pb.h;
  var prevFeetY = feetY - this.player.vy;

  for (var i = 0; i < platforms.length; i++) {
    var plat = platforms[i];
    var platB = plat.getBounds();

    // Horizontal overlap
    if (pb.x + pb.w <= platB.x || pb.x >= platB.x + platB.w) continue;

    // Vertical: feet were above platform's old top, now at or below new top
    var platTop = platB.y;
    var platTopPrev = platTop + this.scrollSpeed; // platform was here last frame
    if (prevFeetY <= platTopPrev && feetY >= platTop) {
      this.player.landOnPlatform(platTop, plat);

      // Platform-specific effects
      var hpBefore = this.player.hp;
      plat.onLand(this.player);

      // Play appropriate sound
      if (this.player.hp < hpBefore) {
        this.audio.playDamage();
      } else if (plat.type === 'spring') {
        this.audio.playSpring();
      } else {
        this.audio.playLand();
        if (this.player.hp > hpBefore) {
          this.audio.playHeal();
        }
      }

      break;
    }
  }
};

Game.prototype.updateDifficulty = function() {
  this.level = Math.floor(this.score / C.LEVEL_UP_INTERVAL);
  this.scrollSpeed = Math.min(
    C.PLATFORM_BASE_SPEED + this.level * C.PLATFORM_SPEED_INCREMENT,
    C.PLATFORM_MAX_SPEED
  );
  this.platformManager.level = this.level;
};

Game.prototype.doGameOver = function() {
  this.state = 'gameover';
  this.gameOverTimer = 0;
  this.audio.playGameOver();

  // Save high score
  this.highScores.push(this.score);
  this.highScores.sort(function(a, b) { return b - a; });
  this.highScores = this.highScores.slice(0, 10);

  if (this.score === this.highScores[0] && this.score > 0) {
    this.isNewRecord = true;
  }

  saveToStorage('ns-shaft-highscores', this.highScores);
};

Game.prototype.renderGameScene = function() {
  this.renderer.clear();
  this.renderer.drawWalls();
  this.platformManager.draw(this.ctx);
  this.player.draw(this.ctx);
  this.renderer.drawCeiling();
  this.renderer.drawHUD(this.player.hp, this.player.maxHp, this.score, this.level);
};

Game.prototype.render = function() {
  switch (this.state) {
    case 'menu':
      this.renderer.drawMenu(this.highScores[0] || 0, this.frameCount);
      break;

    case 'playing':
      this.renderGameScene();
      break;

    case 'gameover':
      this.renderGameScene();
      this.renderer.drawGameOver(this.score, this.highScores[0] || 0, this.isNewRecord, this.gameOverTimer);
      break;

    case 'easter_egg':
      this.renderGameScene();
      this.renderer.drawEasterEgg(
        this.easterEggImage,
        this.easterEggPhase,
        this.easterEggTimer
      );
      break;
  }
};

Game.prototype.resize = function() {
  var windowW = window.innerWidth;
  var windowH = window.innerHeight;
  var banner = document.getElementById('banner');
  var bannerH = banner ? banner.offsetHeight : 0;
  var availableH = windowH - bannerH;
  var gameAspect = C.GAME_WIDTH / C.GAME_HEIGHT;
  var displayW, displayH;

  if ((windowW / availableH) > gameAspect) {
    // Available space is wider than game: fit to height
    displayH = availableH;
    displayW = availableH * gameAspect;
  } else {
    // Available space is taller than game: fit to width
    displayW = windowW;
    displayH = windowW / gameAspect;
  }

  this.canvas.style.width = displayW + 'px';
  this.canvas.style.height = displayH + 'px';

  this.scaleInfo.scale = C.GAME_WIDTH / displayW;
  this.scaleInfo.offsetX = (windowW - displayW) / 2;
  this.scaleInfo.offsetY = bannerH + (availableH - displayH) / 2;
};
