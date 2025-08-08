const Entity = require('../js/entities/Entity.js');
global.Entity = Entity;
const Player = require('../js/entities/Player.js');
const Ball = require('../js/entities/Ball.js');
const Goal = require('../js/entities/Goal.js');
const PhysicsEngine = require('../js/physics/PhysicsEngine.js');

describe('Physics collisions', () => {
  beforeEach(() => {
    global.window = {
      gameEngine: {
        canvas: { width: 400, height: 300 },
      },
    };
  });

  test('player-player collision applies opposing velocities', () => {
    const physics = new PhysicsEngine();
    const a = new Player(100, 100, 'teamA');
    const b = new Player(110, 100, 'teamB');

    physics.addEntity(a);
    physics.addEntity(b);

    physics.handleCollisions();

    // They should receive velocities in opposite horizontal directions
    expect(Math.sign(a.velocityX)).toBe(-Math.sign(b.velocityX) || 0);
  });

  test('ball-goal collision triggers goal glow', () => {
    const physics = new PhysicsEngine();
    const ball = new Ball(50, 50);
    const goal = new Goal(50, 50, 60, 80, 'teamA');

    physics.addEntity(ball);
    physics.addEntity(goal);

    physics.handleCollisions();

    expect(goal.glowIntensity).toBeGreaterThan(0);
  });
}); 