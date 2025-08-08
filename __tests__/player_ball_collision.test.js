const Entity = require('../js/entities/Entity.js');
// Provide Entity to global before requiring subclasses
global.Entity = Entity;
const Player = require('../js/entities/Player.js');
const Ball = require('../js/entities/Ball.js');
const PhysicsEngine = require('../js/physics/PhysicsEngine.js');

// Provide a minimal window with a canvas for bounds
global.window = {
  gameEngine: {
    canvas: { width: 800, height: 600 },
  },
};

describe('Player and Ball interactions', () => {
  test('player gains possession when within kickRange', () => {
    const physics = new PhysicsEngine();
    const player = new Player(100, 100, 'teamA', false);
    const ball = new Ball(110, 100);

    physics.addEntity(player);
    physics.addEntity(ball);

    expect(player.hasBall).toBe(false);

    // Force a collision check
    physics.handleCollisions();

    expect(player.hasBall).toBe(true);
    expect(ball.possessor).toBe(player);
  });

  test('kickBall sets ball velocity and clears possession', () => {
    const player = new Player(100, 100, 'teamA', false);
    const ball = new Ball(100, 100);
    player.setBall(ball);
    player.hasBall = true;
    player.direction = 0; // face right

    const before = { vx: ball.velocityX, vy: ball.velocityY };
    player.kickBall('shoot');

    expect(ball.velocityX).not.toBe(before.vx);
    expect(ball.velocityY).not.toBe(before.vy);
    expect(player.hasBall).toBe(false);
    expect(ball.possessor).toBe(null);
  });
}); 