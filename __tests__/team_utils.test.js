const Entity = require('../js/entities/Entity.js');
global.Entity = Entity;
const Player = require('../js/entities/Player.js');
const Team = require('../js/entities/Team.js');

describe('Team utilities', () => {
  test('getFieldPlayers and getGoalkeeper', () => {
    const team = new Team('teamA', '#f00', 'left');
    const p1 = new Player(10, 10, 'teamA', false, 'field');
    const p2 = new Player(20, 20, 'teamA', false, 'goalkeeper');
    team.addPlayer(p1);
    team.addPlayer(p2);

    expect(team.getFieldPlayers()).toEqual([p1]);
    expect(team.getGoalkeeper()).toBe(p2);
  });

  test('getNearestPlayerTo returns the closest player', () => {
    const team = new Team('teamA', '#f00', 'left');
    const p1 = new Player(0, 0, 'teamA');
    const p2 = new Player(100, 100, 'teamA');
    const p3 = new Player(10, 0, 'teamA');
    team.addPlayer(p1);
    team.addPlayer(p2);
    team.addPlayer(p3);

    const nearest = team.getNearestPlayerTo(5, 0);
    expect(nearest).toBe(p1);
  });
}); 