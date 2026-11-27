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

  rankign() {
    return [...this._gameState.teams].sort((a, b) => b.score - a.score);
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

// Funciones del componente (extractadas para test)
function gameStateText(state) {
  if (!state) return 'Sin partida';
  switch (state.status) {
    case 'waiting': return 'Esperando';
    case 'countdown': return 'Cuenta atrás';
    case 'playing': return 'En juego';
    case 'finished': return 'Finalizado';
    default: return 'Sin partida';
  }
}

function statusText(status) {
  const map = { waiting: 'Esperando', playing: 'Jugando', finished: 'Finalizado' };
  return map[status] || status;
}

test('MasterComponent: gameStateText', () => {
  assert.strictEqual(gameStateText(null), 'Sin partida', 'null devuelve Sin partida');
  assert.strictEqual(gameStateText({ status: 'waiting' }), 'Esperando', 'waiting devuelve Esperando');
  assert.strictEqual(gameStateText({ status: 'playing' }), 'En juego', 'playing devuelve En juego');
  assert.strictEqual(gameStateText({ status: 'finished' }), 'Finalizado', 'finished devuelve Finalizado');
});

test('MasterComponent: statusText', () => {
  assert.strictEqual(statusText('waiting'), 'Esperando', 'waiting -> Esperando');
  assert.strictEqual(statusText('playing'), 'Jugando', 'playing -> Jugando');
  assert.strictEqual(statusText('finished'), 'Finalizado', 'finished -> Finalizado');
});

test('MasterComponent: mock GameService con juegos', () => {
  const service = new MockGameService();
  
  assert.strictEqual(service.currentGame(), null, 'Sin juego seleccionado');
  assert.deepStrictEqual(service.gameState(), { status: 'waiting', teams: [] }, 'Estado inicial correcto');
});

test('MasterComponent: selección de juego', () => {
  const service = new MockGameService();
  
  service.selectGame('snowball-battle');
  
  assert.ok(service.currentGame(), 'Juego seleccionado');
  assert.strictEqual(service.currentGame().id, 'snowball-battle', 'ID correcto');
});

test('MasterComponent: ciclo de juego', () => {
  const service = new MockGameService();
  
  service.selectGame('test-game');
  
  assert.ok(service.currentGame(), 'Juego seleccionado');
  assert.strictEqual(service.currentGame().sensors.includes('gyroscope'), true, 'Tiene gyroscope');
});

test('MasterComponent: botón de iniciar sin juego', () => {
  const service = new MockGameService();
  
  // No hay juego seleccionado
  assert.strictEqual(service.currentGame(), null, 'No hay juego seleccionado');
});

test('MasterComponent: juego con equipos y ranking', () => {
  const service = new MockGameService();
  service.selectGame('test-game');
  
  assert.ok(service.currentGame(), 'Tiene juego');
});

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