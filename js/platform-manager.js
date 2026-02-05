// NS-SHAFT Platform Manager - Spawning, scrolling, recycling

function PlatformManager() {
  this.platforms = [];
  this.level = 0;
  this.recycledCount = 0;
}

PlatformManager.prototype.init = function() {
  this.platforms = [];
  this.recycledCount = 0;
  var startY = 100;
  for (var i = 0; i < C.PLATFORM_COUNT; i++) {
    var x = randomRange(C.PLATFORM_MARGIN, C.GAME_WIDTH - C.PLATFORM_WIDTH - C.PLATFORM_MARGIN);
    var y = startY + i * C.PLATFORM_GAP_Y;
    // First 3 platforms are always normal for a safe start
    var plat = (i < 3) ? new NormalPlatform(x, y) : this.createRandomPlatform(x, y);
    this.platforms.push(plat);
  }
};

PlatformManager.prototype.createRandomPlatform = function(x, y) {
  var type = this.getRandomType();
  switch (type) {
    case 'spike':    return new SpikePlatform(x, y);
    case 'conveyor': return new ConveyorPlatform(x, y, Math.random() < 0.5 ? -1 : 1);
    case 'crumble':  return new CrumblePlatform(x, y);
    case 'spring':   return new SpringPlatform(x, y);
    default:         return new NormalPlatform(x, y);
  }
};

PlatformManager.prototype.getRandomType = function() {
  var l = Math.min(this.level, 15);
  var weights = {
    normal:   Math.max(0.25, 0.70 - l * 0.03),
    spike:    Math.min(0.30, 0.05 + l * 0.017),
    conveyor: 0.15,
    crumble:  Math.min(0.25, 0.10 + l * 0.01),
    spring:   0.05
  };
  return weightedRandom(weights);
};

PlatformManager.prototype.update = function(scrollSpeed) {
  var lowestY = 0;

  for (var i = 0; i < this.platforms.length; i++) {
    var p = this.platforms[i];
    p.update(scrollSpeed);
    if (p.y > lowestY) lowestY = p.y;
  }

  // Recycle platforms that scrolled off the top
  for (var i = 0; i < this.platforms.length; i++) {
    var p = this.platforms[i];
    if (p.y + p.height < -10 || (!p.isActive && p.y < 0)) {
      this.recyclePlatform(i, lowestY);
      // Recalculate lowest
      lowestY = 0;
      for (var j = 0; j < this.platforms.length; j++) {
        if (this.platforms[j].y > lowestY) lowestY = this.platforms[j].y;
      }
    }
  }
};

PlatformManager.prototype.recyclePlatform = function(index, lowestY) {
  var newY = lowestY + C.PLATFORM_GAP_Y;
  var newX = randomRange(C.PLATFORM_MARGIN, C.GAME_WIDTH - C.PLATFORM_WIDTH - C.PLATFORM_MARGIN);
  var newPlat = this.createRandomPlatform(newX, newY);
  this.platforms[index] = newPlat;
  this.recycledCount++;
};

PlatformManager.prototype.draw = function(ctx) {
  for (var i = 0; i < this.platforms.length; i++) {
    if (this.platforms[i].isActive) {
      this.platforms[i].draw(ctx);
    }
  }
};

PlatformManager.prototype.getActivePlatforms = function() {
  var result = [];
  for (var i = 0; i < this.platforms.length; i++) {
    if (this.platforms[i].isActive) result.push(this.platforms[i]);
  }
  return result;
};
