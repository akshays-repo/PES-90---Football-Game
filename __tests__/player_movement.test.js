const Entity = require('../js/entities/Entity.js');
global.Entity = Entity;
const Player = require('../js/entities/Player.js');

describe('Player movement and direction', () => {
  test('sets acceleration and direction from input', () => {
    const p = new Player(0, 0, 'teamA', false);
    p.setInput(1, 0, false, false, false); // move right

    // First update applies previous tick acceleration (initially 0) and sets new acceleration
    p.update(1);
    // Second update moves using the acceleration set by previous tick
    p.update(1);

    expect(p.accelerationX).toBeGreaterThan(0);
    expect(p.accelerationY).toBeCloseTo(0, 5);
    expect(p.direction).toBeCloseTo(0, 3); // facing right
    expect(p.x).toBeGreaterThan(0); // moved right
  });

  test('sprint increases acceleration', () => {
    const p = new Player(0, 0, 'teamA', false);
    p.setInput(1, 0, false, false, true); // sprint right
    const prevAccel = { ax: p.accelerationX, ay: p.accelerationY };

    p.update(1);
    // After first update, acceleration should reflect sprint multiplier
    expect(p.accelerationX).toBeGreaterThan(0);
    expect(p.accelerationX).toBeGreaterThan(prevAccel.ax || 0);
  });
}); 