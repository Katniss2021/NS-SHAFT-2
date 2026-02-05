// NS-SHAFT Main - Bootstrap and game loop

(function() {
  var canvas = document.getElementById('gameCanvas');
  var ctx = canvas.getContext('2d');

  // Set internal resolution
  canvas.width = C.GAME_WIDTH;
  canvas.height = C.GAME_HEIGHT;

  // Create game
  var game = new Game(canvas, ctx);
  game.init();
  game.resize();

  // Resize handler
  window.addEventListener('resize', function() { game.resize(); });
  window.addEventListener('orientationchange', function() {
    setTimeout(function() { game.resize(); }, 100);
  });

  // Game loop with fixed timestep
  var lastTime = 0;
  var accumulator = 0;

  function gameLoop(timestamp) {
    if (lastTime === 0) lastTime = timestamp;
    var elapsed = timestamp - lastTime;
    lastTime = timestamp;

    // Cap to prevent spiral of death after tab switch
    accumulator += Math.min(elapsed, 100);

    while (accumulator >= C.FRAME_DURATION) {
      game.update();
      accumulator -= C.FRAME_DURATION;
    }

    game.render();
    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
})();
