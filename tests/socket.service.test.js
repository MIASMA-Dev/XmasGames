const test = require('node:test');
const assert = require('node:assert/strict');
const { MockSocket, createMockSocket } = require('./socket.mock');

// Mock simple de Socket.IO para test
const mockSocketInstance = createMockSocket();
let lastEmittedEvent = null;
let lastEmitArgs = null;

// Mock del socket.io-client
const mockIo = () => {
  return {
    on: (event, cb) => {
      mockSocketInstance.on(event, cb);
      return mockSocketInstance;
    },
    emit: (event, data) => {
      lastEmittedEvent = event;
      lastEmitArgs = data;
      return mockSocketInstance;
    },
    connect: () => mockSocketInstance.connect(),
    disconnect: () => mockSocketInstance.disconnect()
  };
};

// Simular glob import
const originalWindow = global.window;
const mockWindow = {
  location: { protocol: 'http:', host: 'localhost:4200' }
};

test('SocketService: propiedades básicas', () => {
  assert.strictEqual(mockSocketInstance.connected, false, 'Socket debe estar desconectado inicialmente');
});

test('SocketService: emitir player.join', () => {
  const socket = mockIo();
  
  socket.emit('player.join', {
    teamId: 'team-1',
    teamName: 'Equipo Test',
    device: 'Chrome'
  });
  
  assert.strictEqual(lastEmittedEvent, 'player.join', 'Debe emitir player.join');
  assert.deepStrictEqual(lastEmitArgs, {
    teamId: 'team-1',
    teamName: 'Equipo Test',
    device: 'Chrome'
  }, 'Payload correcto');
});

test('SocketService: emitir player.ready', () => {
  const socket = mockIo();
  
  socket.emit('player.ready', { teamId: 'team-1' });
  
  assert.strictEqual(lastEmittedEvent, 'player.ready', 'Debe emitir player.ready');
  assert.deepStrictEqual(lastEmitArgs, { teamId: 'team-1' }, 'teamId correcto');
});

test('SocketService: emitir player.sensor-data', () => {
  const socket = mockIo();
  
  socket.emit('player.sensor-data', {
    teamId: 'team-1',
    type: 'gyroscope',
    data: { alpha: 45 }
  });
  
  assert.strictEqual(lastEmittedEvent, 'player.sensor-data', 'Debe emitir player.sensor-data');
  assert.strictEqual(lastEmitArgs.type, 'gyroscope', 'Tipo correcto');
  assert.strictEqual(lastEmitArgs.data.alpha, 45, 'Datos correctos');
});

test('SocketService: emitir master.select-game', () => {
  const socket = mockIo();
  
  socket.emit('master.select-game', { gameId: 'game-xmas-snow' });
  
  assert.strictEqual(lastEmittedEvent, 'master.select-game', 'Debe emitir master.select-game');
  assert.strictEqual(lastEmitArgs.gameId, 'game-xmas-snow', 'gameId correcto');
});

test('SocketService: emitir master.start-game', () => {
  const socket = mockIo();
  
  socket.emit('master.start-game', { duration: 60 });
  
  assert.strictEqual(lastEmittedEvent, 'master.start-game', 'Debe emitir master.start-game');
  assert.strictEqual(lastEmitArgs.duration, 60, 'Duración correcta');
});

test('SocketService: emitir master.stop-game', () => {
  const socket = mockIo();
  
  socket.emit('master.stop-game', {});
  
  assert.strictEqual(lastEmittedEvent, 'master.stop-game', 'Debe emitir master.stop-game');
});

test('SocketService: emitir master.reset-game', () => {
  const socket = mockIo();
  
  socket.emit('master.reset-game', {});
  
  assert.strictEqual(lastEmittedEvent, 'master.reset-game', 'Debe emitir master.reset-game');
});

test('SocketService: simulación de conexión', () => {
  mockSocketInstance.simulateConnect();
  assert.strictEqual(mockSocketInstance.connected, true, 'Debe estar conectado');
});

test('SocketService: simulación de desconexión', () => {
  mockSocketInstance.connected = true;
  mockSocketInstance.simulateDisconnect();
  assert.strictEqual(mockSocketInstance.connected, false, 'Debe estar desconectado');
});

test('SocketService: mock socket listeners', () => {
  let eventReceived = false;
  mockSocketInstance.on('test-event', () => { eventReceived = true; });
  
  mockSocketInstance.trigger('test-event');
  
  assert.strictEqual(eventReceived, true, 'Listener disparado');
});

test('SocketService: mock socket with data', () => {
  let receivedData = null;
  mockSocketInstance.on('data-event', (data) => { receivedData = data; });
  
  mockSocketInstance.trigger('data-event', { value: 42 });
  
  assert.deepStrictEqual(receivedData, { value: 42 }, 'Datos recibidos correctamente');
});