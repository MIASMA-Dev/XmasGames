const test = require('node:test');
const assert = require('node:assert/strict');
const { isAllowedOrigin, awardPoints, scoreFromSensor, state, loadCustomGamesCached } = require('../server');

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

// ── Tests para scoring configurable ──
test('gyroscope scoring uses custom threshold and points', () => {
  state.gameState = 'playing';
  state.gameDef = {
    scoring: {
      gyroscope: { trigger: 'delta', threshold: 20, pointsPerTrigger: 3, cooldown: 100 }
    }
  };
  const team = addTeam('test-custom-gyro');
  // Delta should be 25 (>= threshold 20), award 3 points
  scoreFromSensor(team.id, 'gyroscope', { alpha: 50 }, 5000); // no previous
  scoreFromSensor(team.id, 'gyroscope', { alpha: 25 }, 5000); // delta = 25
  assert.equal(team.score, 3);
});

test('microphone scoring uses custom threshold and pointsPerUnit', () => {
  state.gameState = 'playing';
  state.gameDef = {
    scoring: {
      microphone: { trigger: 'volume', threshold: 60, pointsPerUnit: 0.1, cooldown: 100 }
    }
  };
  const team = addTeam('test-custom-mic');
  scoreFromSensor(team.id, 'microphone', { volume: 70 }, 5000);
  // Math.floor(70 * 0.1) = 7 points
  assert.equal(team.score, 7);
});

test('camera scoring uses custom points', () => {
  state.gameState = 'playing';
  state.gameDef = {
    scoring: {
      camera: { trigger: 'capture', points: 10, cooldown: 100 }
    }
  };
  const team = addTeam('test-custom-camera');
  scoreFromSensor(team.id, 'camera', { captured: true }, 5000);
  assert.equal(team.score, 10);
});

test('game without scoring falls back to default', () => {
  state.gameState = 'playing';
  state.gameDef = { scoring: {} };
  const team = addTeam('test-default');
  scoreFromSensor(team.id, 'camera', { captured: true }, 5000);
  assert.equal(team.score, 5); // default points
});

test('loadCustomGamesCached returns games from public/games', async () => {
  const games = await loadCustomGamesCached();
  assert.ok(Array.isArray(games));
  // Debe incluir al menos el juego original
  const ids = games.map(g => g.id);
  assert.ok(ids.includes('trineo-santa') || ids.includes('aceleracion-navarra'));
});

// ── Tests para hot-reload de juegos (modo dev) ──
test('loadCustomGamesCached ignores _plantilla.json', async () => {
  const games = await loadCustomGamesCached();
  const ids = games.map(g => g.id);
  assert.equal(ids.includes('_plantilla'), false, '_plantilla.json should be ignored');
});

test('loadCustomGamesCached filters underscore-prefixed files', async () => {
  const games = await loadCustomGamesCached();
  const ids = games.map(g => g.id);
  const underscorePrefix = ids.filter(id => id.startsWith('_'));
  assert.equal(underscorePrefix.length, 0, 'No files with underscore prefix should be loaded');
});
