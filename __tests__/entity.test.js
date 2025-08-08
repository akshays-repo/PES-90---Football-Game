const Entity = require('../js/entities/Entity.js');

describe('Entity', () => {
  test('applies acceleration, friction, and updates position', () => {
    const e = new Entity(0, 0, 10, 10);
    e.maxSpeed = 1000;
    e.friction = 1; // disable friction to simplify
    e.accelerationX = 1;
    e.accelerationY = 0.5;

    e.update(1); // deltaTime = 1

    expect(e.velocityX).toBeCloseTo(1, 5);
    expect(e.velocityY).toBeCloseTo(0.5, 5);
    expect(e.x).toBeCloseTo(1, 5);
    expect(e.y).toBeCloseTo(0.5, 5);
  });

  test('limits speed to maxSpeed', () => {
    const e = new Entity(0, 0, 10, 10);
    e.maxSpeed = 1;
    e.friction = 1;
    e.accelerationX = 10;
    e.accelerationY = 0;

    e.update(1);

    const speed = Math.sqrt(e.velocityX ** 2 + e.velocityY ** 2);
    expect(speed).toBeLessThanOrEqual(1.00001);
  });
}); 