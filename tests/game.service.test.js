const test = require('node:test');
const assert = require('node:assert/strict');

// Team y GameState types mock
function createTeam(id, name, score, status) {
  return { id, name, score: score || 0, status: status || 'waiting' };
}

const gameStateListeners = [];
const teamsListeners = [];

// Mock de GameService (simplificado para test)
class MockGameService {
  constructor() {
    this._gameState = { status: 'waiting' };
    this._teams = [];
    this._currentGame = null;
  }

  gameState() {
    return this._gameState;
  }

  teams() {
    return [...this._teams];
  }

  currentGame() {
    return this._currentGame;
  }

  isWaiting() {
    return this._gameState.status === 'waiting';
  }

  isPlaying() {
    return this._gameState.status === 'playing';
  }

  addTeam(team) {
    this._teams.push(team);
  }

  removeTeam(teamId) {
    this._teams = this._teams.filter(t => t.id !== teamId);
  }

  updateTeamStatus(teamId, status) {
    const team = this._teams.find(t => t.id === teamId);
    if (team) team.status = status;
  }

  ranking() {
    return [...this._teams].sort((a, b) => b.score - a.score);
  }

  selectGame(gameId) {
    this._currentGame = { gameId };
  }

  startGame(duration) {
    this._gameState = { ...this._gameState, status: 'playing', duration, timeLeft: duration };
  }

  stopGame() {
    this._gameState = { ...this._gameState, status: 'stopped' };
  }

  resetGame() {
    this._gameState = { status: 'waiting' };
    this._teams = [];
  }
}

test('GameService: estado inicial', () => {
  const service = new MockGameService();
  
  assert.strictEqual(service.gameState().status, 'waiting', 'Estado inicial es waiting');
  assert.strictEqual(service.teams().length, 0, 'Equipos iniciales vacíos');
  assert.strictEqual(service.currentGame(), null, 'Juego actual es null');
  assert.strictEqual(service.isPlaying(), false, 'isPlaying() devuelve false');
});

test('GameService: agregar equipo', () => {
  const service = new MockGameService();
  const team = createTeam('team-1', 'Rudos Renos', 0, 'waiting');
  
  service.addTeam(team);
  
  assert.strictEqual(service.teams().length, 1, 'Equipo agregado');
  assert.strictEqual(service.teams()[0].name, 'Rudos Renos', 'Nombre correcto');
});

test('GameService: remover equipo', () => {
  const service = new MockGameService();
  service.addTeam(createTeam('team-1', 'Rudos Renos'));
  
  service.removeTeam('team-1');
  
  assert.strictEqual(service.teams().length, 0, 'Equipo removido');
});

test('GameService: actualizar estado de equipo', () => {
  const service = new MockGameService();
  service.addTeam(createTeam('team-1', 'Rudos Renos'));
  
  service.updateTeamStatus('team-1', 'playing');
  
  assert.strictEqual(service.teams()[0].status, 'playing', 'Estado actualizado');
});

test('GameService: ranking por puntuación', () => {
  const service = new MockGameService();
  service.addTeam(createTeam('team-1', 'Team A', 5));
  service.addTeam(createTeam('team-2', 'Team B', 15));
  service.addTeam(createTeam('team-3', 'Team C', 10));
  
  const ranking = service.ranking();
  
  assert.strictEqual(ranking[0].score, 15, 'Primer lugar es 15');
  assert.strictEqual(ranking[1].score, 10, 'Segundo lugar es 10');
  assert.strictEqual(ranking[2].score, 5, 'Tercer lugar es 5');
});

test('GameService: seleccionar juego', () => {
  const service = new MockGameService();
  
  service.selectGame('game-snowball');
  
  assert.ok(service.currentGame(), 'Juego seleccionado');
  assert.strictEqual(service.currentGame().gameId, 'game-snowball', 'gameId correcto');
});

test('GameService: iniciar juego', () => {
  const service = new MockGameService();
  
  service.startGame(60);
  
  assert.strictEqual(service.isPlaying(), true, 'Estado playing');
  assert.strictEqual(service.gameState().timeLeft, 60, 'Duración establecida');
});

test('GameService: detener juego', () => {
  const service = new MockGameService();
  
  service.stopGame();
  
  assert.strictEqual(service.gameState().status, 'stopped', 'Estado stopped');
});

test('GameService: reiniciar juego', () => {
  const service = new MockGameService();
  service.addTeam(createTeam('team-1', 'Team A'));
  
  service.resetGame();
  
  assert.strictEqual(service.gameState().status, 'waiting', 'Vuelve a waiting');
  assert.strictEqual(service.teams().length, 0, 'Equipos reiniciados');
});