const Entity = require('../js/entities/Entity.js');
global.Entity = Entity;
const Player = require('../js/entities/Player.js');
const Ball = require('../js/entities/Ball.js');

describe('Player stamina and kick cooldown', () => {
  test('stamina drains while sprinting and disables sprint at zero', () => {
    const p = new Player(0, 0, 'teamA', false);
    p.isSprinting = true;
    p.stamina = 10;

    p.updateStamina(200); // drains by 20
    expect(p.stamina).toBe(0);
    expect(p.isSprinting).toBe(false);
  });

  test('kickBall applies cooldown; cannot kick again until cooldown expires', () => {
    // Stabilize randomness
    const originalRandom = Math.random;
    Math.random = () => 0.5;

    const p = new Player(0, 0, 'teamA', false);
    const b = new Ball(0, 0);
    p.setBall(b);
    p.hasBall = true;
    p.direction = 0;

    p.kickBall('shoot');
    const firstVX = b.velocityX;
    const firstVY = b.velocityY;

    // Attempt second kick immediately
    p.kickBall('shoot');
    expect(b.velocityX).toBe(firstVX);
    expect(b.velocityY).toBe(firstVY);

    // Reduce cooldown
    p.update(500);

    // Regain possession for test and change direction so velocity differs deterministically
    p.hasBall = true;
    p.direction = Math.PI / 4;
    p.kickBall('shoot');
    expect(b.velocityX).not.toBe(firstVX);

    Math.random = originalRandom;
  });
}); 