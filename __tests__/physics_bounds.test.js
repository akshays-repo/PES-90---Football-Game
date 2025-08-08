const Entity = require('../js/entities/Entity.js');
// Ensure subclasses (if any used) can extend Entity in Node
global.Entity = Entity;
const PhysicsEngine = require('../js/physics/PhysicsEngine.js');

describe('PhysicsEngine keepInBounds', () => {
  beforeEach(() => {
    global.window = {
      gameEngine: {
        canvas: { width: 100, height: 100 },
      },
    };
  });

  test('clamps entity inside canvas and bounces velocity', () => {
    const physics = new PhysicsEngine();
    const e = new Entity(1, 1, 10, 10);
    e.setVelocity(-10, -10);

    physics.addEntity(e);
    physics.applyConstraints();

    expect(e.x).toBeGreaterThanOrEqual(e.width / 2);
    expect(e.y).toBeGreaterThanOrEqual(e.height / 2);
    expect(e.velocityX).toBeGreaterThanOrEqual(0);
    expect(e.velocityY).toBeGreaterThanOrEqual(0);
  });
}); 