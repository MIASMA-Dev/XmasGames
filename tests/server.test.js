const test = require('node:test');
const assert = require('node:assert/strict');
const { isAllowedOrigin, awardPoints, scoreFromSensor, state } = require('../server');

function addTeam(id) {
  state.teams.push({ id, name: id, score: 0, status: 'playing' });
  return state.teams[state.teams.length - 1];
}

test('CORS allows localhost, LAN and explicit origins but rejects internet origins', () => {
  assert.equal(isAllowedOrigin(undefined), true);
  assert.equal(isAllowedOrigin('http://localhost:4200'), true);
  assert.equal(isAllowedOrigin('http://192.168.0.49:4200'), true);
  assert.equal(isAllowedOrigin('https://evil.example.com'), false);
});

test('client points are capped and cooldown blocks rapid repeats', () => {
  state.gameState = 'playing';
  const team = addTeam('test-cap');
  awardPoints(team.id, 999, 5000);
  assert.equal(team.score, 10);
  awardPoints(team.id, 999, 5000);
  assert.equal(team.score, 10);
});

test('sensor events score server-side', () => {
  state.gameState = 'playing';
  const camera = addTeam('test-camera');
  scoreFromSensor(camera.id, 'camera', { captured: true }, 5000);
  assert.equal(camera.score, 5);

  const gyro = addTeam('test-gyro');
  scoreFromSensor(gyro.id, 'gyroscope', { alpha: 10 }, 5000);
  assert.equal(gyro.score, 0);
  scoreFromSensor(gyro.id, 'gyroscope', { alpha: 50 }, 5000);
  assert.equal(gyro.score, 1);
});
