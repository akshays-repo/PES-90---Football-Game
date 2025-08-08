const Entity = require('../js/entities/Entity.js');
global.Entity = Entity;
const Ball = require('../js/entities/Ball.js');
const Goal = require('../js/entities/Goal.js');

function makeCanvas(width = 800, height = 600) {
  return { width, height };
}

describe('Ball scoring logic', () => {
  beforeEach(() => {
    const canvas = makeCanvas();

    // Create goals
    const goalA = new Goal(30, canvas.height / 2, 60, 80, 'teamA');
    const goalB = new Goal(canvas.width - 30, canvas.height / 2, 60, 80, 'teamB');

    // Stub gameEngine
    global.window = {
      gameEngine: {
        canvas,
        _scoreCalls: [],
        updateScore(team) { this._scoreCalls.push(team); },
        currentScene: {
          _resetCalled: false,
          resetPlayers() { this._resetCalled = true; },
          getGoal(team) { return team === 'teamA' ? goalA : goalB; },
        },
      },
    };
  });

  test('ball inside Team A goal scores for Team B and resets', () => {
    const canvas = window.gameEngine.canvas;
    const ball = new Ball(0, 0);

    // Place ball well inside Team A goal bounds
    const goalA = window.gameEngine.currentScene.getGoal('teamA');
    ball.setPosition(goalA.x, goalA.y);

    // Should trigger score for Team B
    ball.checkGoal();

    expect(window.gameEngine._scoreCalls.slice(-1)[0]).toBe('teamB');
    // Ball should be centered
    expect(ball.x).toBeCloseTo(canvas.width / 2, 5);
    expect(ball.y).toBeCloseTo(canvas.height / 2, 5);
    expect(ball.possessor).toBe(null);
    expect(window.gameEngine.currentScene._resetCalled).toBe(true);
  });
}); 