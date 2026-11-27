# Tests de XmasGames

## Ejecutar tests

```bash
npm test           # Ejecutar todos los tests
```

## Estructura de tests

Los tests usan el test runner nativo de Node.js (`node:test`).

### Archivos de test

- `game.service.test.js` - Tests del GameService (manipulación de equipos, juego, ranking)
- `master.component.test.js` - Tests del MasterComponent (estado, selección de juegos)
- `player.component.test.js` - Tests del PlayerComponent (estado de jugador, sensores)
- `sensor.service.test.js` - Tests del SensorService (permisos, lecturas de sensores)
- `socket.service.test.js` - Tests del SocketService (comunicación WebSocket)

### Mocks

- `socket.mock.js` - Mock de Socket.IO Client para tests

## Tests existentes en el servidor

Hay 3 tests adicionales en el servidor (`server.test.js`) que prueban:
- CORS y políticas de límites
- Caps y cooldown de clientes  
- Puntuación de eventos de sensor en el lado del servidor