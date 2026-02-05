// NS-SHAFT Input Manager - Keyboard + Touch

function InputManager(canvas, gameScaleInfo) {
  this.canvas = canvas;
  this.scaleInfo = gameScaleInfo;
  this.keys = { left: false, right: false, action: false };
  this._actionPressed = false;

  this._onKeyDown = this.onKeyDown.bind(this);
  this._onKeyUp = this.onKeyUp.bind(this);
  this._onTouchStart = this.onTouchStart.bind(this);
  this._onTouchMove = this.onTouchMove.bind(this);
  this._onTouchEnd = this.onTouchEnd.bind(this);
  this._onMouseDown = this.onMouseDown.bind(this);
  this._onMouseUp = this.onMouseUp.bind(this);

  document.addEventListener('keydown', this._onKeyDown);
  document.addEventListener('keyup', this._onKeyUp);
  canvas.addEventListener('touchstart', this._onTouchStart, { passive: false });
  canvas.addEventListener('touchmove', this._onTouchMove, { passive: false });
  canvas.addEventListener('touchend', this._onTouchEnd, { passive: false });
  canvas.addEventListener('touchcancel', this._onTouchEnd, { passive: false });
  canvas.addEventListener('mousedown', this._onMouseDown);
  canvas.addEventListener('mouseup', this._onMouseUp);
}

InputManager.prototype.onKeyDown = function(e) {
  switch (e.code) {
    case 'ArrowLeft': case 'KeyA':
      this.keys.left = true; break;
    case 'ArrowRight': case 'KeyD':
      this.keys.right = true; break;
    case 'Space': case 'Enter':
      this.keys.action = true; break;
  }
  if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space'].indexOf(e.code) !== -1) {
    e.preventDefault();
  }
};

InputManager.prototype.onKeyUp = function(e) {
  switch (e.code) {
    case 'ArrowLeft': case 'KeyA':
      this.keys.left = false; break;
    case 'ArrowRight': case 'KeyD':
      this.keys.right = false; break;
    case 'Space': case 'Enter':
      this.keys.action = false; break;
  }
};

InputManager.prototype.screenToGame = function(sx, sy) {
  var info = this.scaleInfo;
  return {
    x: (sx - info.offsetX) * info.scale,
    y: (sy - info.offsetY) * info.scale
  };
};

InputManager.prototype.processTouches = function(touches) {
  this.keys.left = false;
  this.keys.right = false;

  for (var i = 0; i < touches.length; i++) {
    var gp = this.screenToGame(touches[i].clientX, touches[i].clientY);
    if (gp.x < C.GAME_WIDTH / 2) {
      this.keys.left = true;
    } else {
      this.keys.right = true;
    }
  }

  if (touches.length > 0) {
    this.keys.action = true;
  }
};

InputManager.prototype.onTouchStart = function(e) {
  e.preventDefault();
  this.processTouches(e.touches);
};

InputManager.prototype.onTouchMove = function(e) {
  e.preventDefault();
  this.processTouches(e.touches);
};

InputManager.prototype.onTouchEnd = function(e) {
  e.preventDefault();
  this.processTouches(e.touches);
  if (e.touches.length === 0) {
    this.keys.action = false;
  }
};

InputManager.prototype.onMouseDown = function(e) {
  var gp = this.screenToGame(e.clientX, e.clientY);
  if (gp.x < C.GAME_WIDTH / 2) {
    this.keys.left = true;
  } else {
    this.keys.right = true;
  }
  this.keys.action = true;
};

InputManager.prototype.onMouseUp = function(e) {
  this.keys.left = false;
  this.keys.right = false;
  this.keys.action = false;
};

InputManager.prototype.getDirection = function() {
  if (this.keys.left && !this.keys.right) return -1;
  if (this.keys.right && !this.keys.left) return 1;
  return 0;
};

InputManager.prototype.consumeAction = function() {
  if (this.keys.action && !this._actionPressed) {
    this._actionPressed = true;
    return true;
  }
  if (!this.keys.action) {
    this._actionPressed = false;
  }
  return false;
};

InputManager.prototype.destroy = function() {
  document.removeEventListener('keydown', this._onKeyDown);
  document.removeEventListener('keyup', this._onKeyUp);
  this.canvas.removeEventListener('touchstart', this._onTouchStart);
  this.canvas.removeEventListener('touchmove', this._onTouchMove);
  this.canvas.removeEventListener('touchend', this._onTouchEnd);
  this.canvas.removeEventListener('touchcancel', this._onTouchEnd);
  this.canvas.removeEventListener('mousedown', this._onMouseDown);
  this.canvas.removeEventListener('mouseup', this._onMouseUp);
};
