/**
 * Mock de Socket.IO Client para tests
 * Simula el comportamiento de socket.io-client sin necesidad de servidor real
 */

class MockSocket {
  constructor() {
    this.listeners = new Map();
    this.connected = false;
    this._reconnectionAttempts = 0;
  }

  on(event, callback) {
    const existing = this.listeners.get(event) || [];
    this.listeners.set(event, [...existing, callback]);
    return this;
  }

  off(event, callback) {
    if (!callback) {
      this.listeners.delete(event);
    } else {
      const existing = this.listeners.get(event) || [];
      this.listeners.set(event, existing.filter(cb => cb !== callback));
    }
    return this;
  }

  emit(event, data) {
    // Simular emit (no hace nada en el mock, salvo registrar)
    return this;
  }

  // Métodos para simular eventos del servidor en los tests
  simulateConnect() {
    this.connected = true;
    this.trigger('connect');
  }

  simulateDisconnect() {
    this.connected = false;
    this.trigger('disconnect');
  }

  simulateEvent(event, data) {
    this.trigger(event, data);
  }

  trigger(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
  }

  // Configuración de opciones del socket
  get ioOptions() { return this.options || {}; }
  get id() { return this._id; }
  get active() { return true; }
  get reconnections() { return 0; }
  get reconnectionDelay() { return 1000; }
  get reconnectionAttempts() { return 10; }
  get timeout() { return 20000; }
  get transports() { return ['websocket', 'polling']; }

  connect() {
    this.connected = true;
    this.trigger('connect');
  }

  disconnect() {
    this.connected = false;
    this.trigger('disconnect');
  }
}

function createMockSocket() {
  return new MockSocket();
}

module.exports = { MockSocket, createMockSocket };