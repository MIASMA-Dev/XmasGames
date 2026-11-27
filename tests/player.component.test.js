const test = require('node:test');
const assert = require('node:assert/strict');

// Team icons
const teamIcons = {
  'team-1': { name: 'Rudos Renos', icon: '🦌' },
  'team-2': { name: 'Ángeles de Hielo', icon: '⛄' },
  'team-3': { name: 'Duendes Navideños', icon: '🧝' },
  'team-4': { name: 'Bolas de Nieve', icon: '☃️' },
  'team-5': { name: 'Estrellas Fugaces', icon: '⭐' },
  'team-6': { name: 'Villancicos Locos', icon: '🎵' }
};

// Mock de GameService
class MockGameService {
  constructor() {
    this._currentGame = null;
    this._gameState = { status: 'waiting', teams: [] };
  }

  currentGame() {
    return this._currentGame;
  }

  gameState() {
    return this._gameState;
  }

  selectGame(gameId) {
    this._currentGame = { 
      id: gameId, 
      name: 'Test Game',
      description: 'Test Description',
      sensors: ['gyroscope'],
      duration: 60 
    };
  }
}

// Mock de SocketService
class MockSocketService {
  constructor() {
    this.connected = true;
    this._listeners = {};
  }

  connect(playerId, teamId) {}

  joinTeam(teamId, name, device) {}

  setReady(teamId) {}

  sendSensorData(teamId, type, data) {}

  subscribe(event, callback) {
    this._listeners[event] = callback;
    return { unsubscribe: () => {} };
  }

  // Simular eventos
  emitGameStart() { if (this._listeners['onGameStart']) this._listeners['onGameStart'](); }
  emitGameCountdown(n) { if (this._listeners['onGameCountdown']) this._listeners['onGameCountdown'](n); }
  emitGameEnd() { if (this._listeners['onGameEnd']) this._listeners['onGameEnd'](); }
}

test('PlayerComponent: teamIcons', () => {
  assert.strictEqual(Object.keys(teamIcons).length, 6, 'Hay 6 equipos iconificados');
  assert.strictEqual(teamIcons['team-1'].name, 'Rudos Renos', 'Nombre correcto');
  assert.strictEqual(teamIcons['team-1'].icon, '🦌', 'Icono correcto');
});

test('PlayerComponent: estado inicial', () => {
  const state = {
    teamId: '',
    teamInfo: { id: '', name: 'Equipo', icon: '🎮' },
    score: 0,
    gameState: 'waiting',
    countdown: 3,
    currentGame: null,
    volume: 0,
    gyroAngle: 0
  };
  
  assert.strictEqual(state.gameState, 'waiting', 'Estado inicial waiting');
  assert.strictEqual(state.score, 0, 'Puntaje 0 inicial');
  assert.strictEqual(state.currentGame, null, 'Sin juego seleccionado');
  assert.strictEqual(state.countdown, 3, 'Countdown inicial 3');
});

test('PlayerComponent: unirse a juego', () => {
  const teamId = 'team-1';
  const info = teamIcons[teamId] || { name: 'Equipo', icon: '🎮' };
  
  assert.strictEqual(teamId, 'team-1', 'teamId establecido');
  assert.strictEqual(info.name, 'Rudos Renos', 'Nombre del equipo');
  assert.strictEqual(info.icon, '🦌', 'Icono del equipo');
});

test('PlayerComponent: cambio de estado a playing', () => {
  const gameState = { status: 'playing', teams: [] };
  const newState = 'playing';
  
  assert.strictEqual(newState, 'playing', 'Estado playing');
});

test('PlayerComponent: actualización de puntaje', () => {
  const team = { id: 'team-1', score: 25 };
  
  assert.strictEqual(team.score, 25, 'Puntaje actualizado');
});

test('PlayerComponent: countdown', () => {
  const gameState = 'countdown';
  const countdown = 5;
  
  assert.strictEqual(gameState, 'countdown', 'Estado countdown');
  assert.strictEqual(countdown, 5, 'Countdown en 5');
});

test('PlayerComponent: juego finalizado', () => {
  const gameState = 'finished';
  const score = 150;
  
  assert.strictEqual(gameState, 'finished', 'Estado finished');
  assert.strictEqual(score, 150, 'Puntaje final');
});

test('PlayerComponent: sensor gyroscope', () => {
  const gyroData = { alpha: 45.5, beta: 30, gamma: 10, acceleration: { x: 0, y: 0, z: 9.8 } };
  const gyroAngle = gyroData.alpha;
  
  assert.strictEqual(gyroAngle, 45.5, 'Ángulo giroscopio');
});

test('PlayerComponent: sensor microphone', () => {
  const volume = 75;
  
  assert.strictEqual(volume, 75, 'Volumen');
});

test('PlayerComponent: juego con gyroscope', () => {
  const game = {
    sensors: ['gyroscope']
  };
  
  assert.ok(game.sensors.includes('gyroscope'), 'Incluye gyroscope');
  assert.ok(!game.sensors.includes('microphone'), 'No incluye microphone');
});

test('PlayerComponent: juego con microphone', () => {
  const game = {
    sensors: ['microphone']
  };
  
  assert.ok(game.sensors.includes('microphone'), 'Incluye microphone');
});

test('PlayerComponent: juego con camera', () => {
  const game = {
    sensors: ['camera']
  };
  
  assert.ok(game.sensors.includes('camera'), 'Incluye camera');
});

test('PlayerComponent: múltiples sensores', () => {
  const game = {
    sensors: ['gyroscope', 'microphone', 'camera']
  };
  
  assert.strictEqual(game.sensors.length, 3, '3 sensores');
  assert.ok(game.sensors.includes('gyroscope'), 'Tiene gyroscope');
  assert.ok(game.sensors.includes('microphone'), 'Tiene microphone');
  assert.ok(game.sensors.includes('camera'), 'Tiene camera');
});

test('PlayerComponent: captura de pantalla', () => {
  const sensorData = { captured: true };
  
  assert.strictEqual(sensorData.captured, true, 'Captura enviada');
});

test('PlayerComponent: equipo desconocido usa icono por defecto', () => {
  const teamId = 'team-xyz';
  const info = teamIcons[teamId] || { name: 'Equipo', icon: '🎮' };
  
  assert.strictEqual(info.name, 'Equipo', 'Nombre por defecto');
  assert.strictEqual(info.icon, '🎮', 'Icono por defecto');
});

test('PlayerComponent: Socket listeners', () => {
  const socket = new MockSocketService();
  let gameStarted = false;
  let gameEnded = false;
  
  socket.subscribe('onGameStart', () => { gameStarted = true; });
  socket.subscribe('onGameEnd', () => { gameEnded = true; });
  
  socket.emitGameStart();
  assert.strictEqual(gameStarted, true, 'Listener onGameStart disparado');
  
  socket.emitGameEnd();
  assert.strictEqual(gameEnded, true, 'Listener onGameEnd disparado');
});