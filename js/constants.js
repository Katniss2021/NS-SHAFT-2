// NS-SHAFT Constants - All tunable game values
const C = Object.freeze({
  // Canvas / viewport
  GAME_WIDTH: 360,
  GAME_HEIGHT: 480,

  // Player
  PLAYER_WIDTH: 20,
  PLAYER_HEIGHT: 24,
  PLAYER_SPEED: 3.0,
  PLAYER_GRAVITY: 0.35,
  PLAYER_MAX_FALL_SPEED: 8.0,
  PLAYER_MAX_HP: 10,
  PLAYER_START_HP: 10,

  // HP changes
  HP_HEAL_NORMAL: 1,
  HP_DAMAGE_SPIKE: 5,

  // Platform dimensions
  PLATFORM_WIDTH: 70,
  PLATFORM_HEIGHT: 8,
  PLATFORM_GAP_Y: 55,
  PLATFORM_COUNT: 9,
  PLATFORM_MARGIN: 10,

  // Platform scroll speed (pixels per frame at 60fps)
  PLATFORM_BASE_SPEED: 0.8,
  PLATFORM_SPEED_INCREMENT: 0.04,
  PLATFORM_MAX_SPEED: 3.5,

  // Conveyor belt push speed
  CONVEYOR_PUSH_SPEED: 1.5,

  // Spring bounce velocity
  SPRING_BOUNCE_VY: -9.0,

  // Crumble platform lifetime (frames)
  CRUMBLE_LIFETIME: 24,

  // Difficulty
  LEVEL_UP_INTERVAL: 10,

  // Spike ceiling
  SPIKE_CEILING_Y: 0,
  SPIKE_HEIGHT: 16,

  // Scoring
  SCORE_PER_PLATFORM: 1,

  // Timing
  FRAME_DURATION: 1000 / 60,

  // Invulnerability after damage (frames)
  INVULNERABLE_FRAMES: 30,

  // Game over restart delay (frames)
  GAMEOVER_DELAY: 60,

  // Colors
  COLOR_BG: '#1a1a2e',
  COLOR_BG_GRADIENT: '#16213e',
  COLOR_WALL: '#2a2a4a',
  COLOR_CEILING_SPIKE: '#cc3333',
  COLOR_TEXT: '#ffffff',
  COLOR_TEXT_SHADOW: '#000000',
  COLOR_HP_BG: '#441111',
  COLOR_HP_FG: '#33cc33',
  COLOR_HP_LOW: '#cc3333',
  COLOR_PLATFORM_NORMAL: '#5b8c3e',
  COLOR_PLATFORM_NORMAL_TOP: '#6ea84a',
  COLOR_PLATFORM_SPIKE: '#cc3333',
  COLOR_PLATFORM_SPIKE_BASE: '#993333',
  COLOR_PLATFORM_CONVEYOR: '#3377bb',
  COLOR_PLATFORM_CONVEYOR_TOP: '#4499dd',
  COLOR_PLATFORM_CRUMBLE: '#ccaa33',
  COLOR_PLATFORM_CRUMBLE_TOP: '#ddbb44',
  COLOR_PLATFORM_SPRING: '#888888',
  COLOR_PLATFORM_SPRING_TOP: '#aaaaaa',
  COLOR_PLAYER_BODY: '#e8c170',
  COLOR_PLAYER_SHIRT: '#4488cc',
  COLOR_PLAYER_PANTS: '#335599',
  COLOR_PLAYER_HAIR: '#553322',
  COLOR_PLAYER_SHOES: '#443322',
  COLOR_MENU_TITLE: '#ffcc33',
  COLOR_GAMEOVER: '#ff3333',
  COLOR_OVERLAY: 'rgba(0, 0, 0, 0.65)',
});
