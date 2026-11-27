# Especificación Técnica — XmasGames

**Versión:** 1.0  
**Fecha:** 2026-11-27  
**Estado:** DRAFT  

## 1. Arquitectura

### 1.1 Diagrama

```
┌─────────────────────────────────────────────────────────────┐
│                    PC (Servidor)                             │
│  ┌─────────────────┐    ┌──────────────────┐                │
│  │  server.js      │    │ Angular Frontend │                │
│  │  Node.js        │◄──►│  (ng serve:4200) │                │
│  │  Socket.IO:3001 │    │  HTTP Static     │                │
│  └────────┬────────┘    └────────┬─────────┘                │
│           │                       │                            │
│           │ Socket.IO Events       │ Proxy /socket.io/        │
│           └───────────────────────┘ (proxy.conf.json)        │
└───────────────────────┬─────────────────────────────────────┘
                        │ LAN (Wi-Fi/Ethernet)
            ┌───────────┼───────────┐
            ▼           ▼           ▼
        ┌───────────┐ ┌───────────┐ ┌───────────┐
        │ Móvil 1   │ │ Móvil 2   │ │ Móvil N   │
        │ Equipo A  │ │ Equipo B  │ │ Equipo C  │
        │ Browser   │ │ Browser   │ │ Browser   │
        └───────────┘ └───────────┘ └───────────┘
```

### 1.2 Stack Tecnológico

| Layer | Tecnología | Versión |
|-------|------------|---------|
| Backend | Node.js + Socket.IO | Node 20+, Socket.IO 4+ |
| Frontend | Angular 22 | Standalone Components |
| Comunicación | Socket.IO over WebSocket | Transport auto |
| Build | esbuild | Direct TypeScript compilation |

## 2. Estructura del Código

### 2.1 Backend (`server.js`)

```
server.js
├── Config (PORT, GAMES_DIR)
├── loadCustomGames() - Carga JSON de public/games/
├── State singleton (gameId, gameState, teams, timer)
├── awardPoints() - Lógica de puntuación con cooldown
├── scoreFromSensor() - Cálculo por tipo de sensor
├── HTTP Server (solo 404)
├── Socket.IO Server
│   ├── CORS middleware (isAllowedOrigin)
│   ├── connection handler
│   │   ├── player.join, player.leave, player.ready
│   │   ├── player.sensor-data, player.score
│   │   └── master.* events
│   └── emit listeners
└── Module exports (testing)
```

### 2.2 Frontend (`src/app/`)

```
src/app/
├── models/
│   ├── game.types.ts     # GameDef, Team, GameState
│   └── socket.types.ts   # Eventos y payloads
├── services/
│   ├── game.service.ts      # Estado global, rankings
│   ├── socket.service.ts    # Comunicación Socket.IO
│   ├── sensor.service.ts    # Giroscopio, micrófono y cámara
│   └── game-loader.service.ts # Carga de juegos JSON
├── config/
│   └── games.catalog.ts     # DEFAULT_GAMES import
├── pages/
│   ├── master/              # Panel organizador
│   │   └── master.component.ts
│   └── player/              # Pantalla jugador
│       └── player.component.ts
├── app.routes.ts            # Rutas: /, /:teamId, /master
└── app.config.ts            # ProvideRouter, SocketProvider
```

### 2.3 Juegos (`public/games/`)

```
public/games/
├── catalog.json     # Catálogo base (3 juegos)
└── _plantilla.json  # Plantilla para nuevos juegos
```

## 3. API del Servidor

### 3.1 Funciones Exportadas (para testing)

```javascript
module.exports = {
  isAllowedOrigin,   // boolean: ¿Origen permitido?
  awardPoints,       // void: otorga puntos con cooldown
  scoreFromSensor,   // void: calcula puntos desde sensor
  state              // object: estado compartido
};
```

### 3.2 CORS Config

```javascript
isAllowedOrigin(origin):
  - undefined → true (clientes nativos)
  - localhost / 127.0.0.1 → true
  - 192.168.x.x → true
  - 10.x.x.x → true
  - 172.16-31.x.x → true
  - ALLOWED_ORIGINS env var → true
  - otros → false
```

## 4. Modelos de Datos

### 4.1 GameDef

```typescript
interface GameDef {
  id: string;              // único
  name: string;            // "Trineo de Santa"
  description: string;     // texto corto
  icon: string;            // emoji "🛷"
  accentColor: string;     // "#d62828"
  sensors: ('gyroscope'|'microphone'|'camera')[];
  minPlayers: number;      // mínimo 3
  duration: number;        // en segundos
  maxPlayers?: number;     // opcional
  inputMode?: 'mobile'|'desktop'|'both';
  scoring?: objeto;        // reglas de puntuación personalizadas
}
```

### 4.2 Team

```typescript
interface Team {
  id: string;              // "team-1"
  name: string;            // "Rudos Renos"
  device: string;          // userAgent truncado
  score: number;           // acumulado
  status: 'waiting'|'playing'|'finished';
  lastPayload?: object;    // datos últimos sensor
}
```

### 4.3 GameState

```typescript
interface GameState {
  gameId: string | null;
  status: 'waiting'|'countdown'|'playing'|'finished';
  timeLeft: number;        // segundos
  teams: Team[];
  payload?: object;
}
```

## 5. Sensores

### 5.1 Giroscopio

**Cliente (`sensor.service.ts`):**
```typescript
async requestGyroscope(): Promise<boolean>
subscribeGyroscope(handler: (data) => void): void
stopGyroscope(): void
```

**Socket payload:**
```json
{
  "teamId": "team-1",
  "type": "gyroscope",
  "data": {
    "alpha": 125.5,
    "beta": -15.3,
    "gamma": 5.2,
    "acceleration": { "x": 0.1, "y": 9.8, "z": 0.2 }
  }
}
```

### 5.2 Micrófono

**Cliente:**
```typescript
async requestMicrophone(): Promise<boolean>
subscribeVolume(handler: (volume: number) => void): void
stopMicrophone(): void
```

**Server scoring:**
```
volume > 50 → points = floor(volume / 20)
cooldown = 500ms
```

### 5.3 Cámara

**Cliente:**
```typescript
async requestCamera(): Promise<HTMLVideoElement>
stopCamera(): void
```

**Socket payload:**
```json
{
  "teamId": "team-1",
  "type": "camera",
  "data": {
    "captured": true
  }
}
```

## 6. Configuración

### 6.1 Variables de Entorno

| Variable | Descripción | Por defecto |
|----------|-------------|-------------|
| `PORT` | Puerto del servidor HTTP | 3001 |
| `ALLOWED_ORIGINS` | Orígenes CORS extra | "" |

### 6.2 Archivos de Config

- `proxy.conf.json` - Proxy Angular → Socket.IO
- `build.js` - Build script con esbuild
- `tsconfig.json` - TypeScript

## 7. Seguridad

### 7.1 CORS
- Origen bloqueado por defecto
- Solo LAN + localhost permitidos
- Previene uso externo no autorizado

### 7.2 Validación de Datos
- `awardPoints()`: cap + 10, floor + 0
- `scoreFromSensor()`: valida tipos con `Number.isFinite()`
- Origen validado con regex de IP privada

### 7.3 No implementado (por diseño)
- Autenticación
- HTTPS (usa HTTP en LAN)
- Autorización de usuarios
- Rate limiting avanzado

## 8. Pruebas

### 8.1 Estructura de Tests (`tests/server.test.js`)

```javascript
// Tests Node.js (built-in node:test)
test('CORS allows localhost, LAN and explicit origins but rejects internet origins')
test('client points are capped and cooldown blocks rapid repeats')
test('sensor events score server-side')
```

### 8.2 Ejecución

```bash
npm test           # Node.js tests
ng test           # Angular tests (Karma/Vitest)
```

## 9. Deploy

### 9.1 Desarrollo

```bash
npm install
Terminal A: node server.js           # Puerto 3001
Terminal B: npm run dev              # Puerto 4200
```

### 9.2 Producción

```bash
npm run build
# Dist en dist/
# Servir con nginx o static file server
# Reemplazar ng serve con servidor estático
```

## 10. Extensibilidad

### 10.1 Añadir un juego

1. Copiar `_plantilla.json` → `mi-juego.json`
2. Editar campos según sea necesario
3. Ejecutar `npm run build` para generar el build actualizado
4. Iniciar servidor con `npm start` → juego aparecerá automáticamente

**Ver también:** `docs/specs/JUEGOS.md` — Guía completa con ejemplos

### 10.2 Añadir sensor nuevo

1. Agregar tipo a `GameDef.sensors`
2. Agregar handler en `sensor.service.ts`
3. Agregar lógica en `scoreFromSensor()`

## 11. Consideraciones Técnicas

### 11.1 Compatibilidad

| Navegador | Giroscopio | Micrófono | Cámara |
|-----------|------------|-----------|--------|
| Chrome Android | ✓ | ✓ | ✓ |
| Safari iOS | ✓ (iOS 13+) | ✓ | ✓ |
| Chrome Desktop | ✓ | ✓ | ✓ |
| Firefox | ✓ | ✓ | ✓ |

### 11.2 Performance

- Socket.IO usa WebSocket (bajo overhead)
- No persistencia en disco (memoria RAM)
- Sin polling: comunicación push vía Socket.IO
- Animación de giroscopio: 60 FPS en 200ms

### 11.3 Límites

- Máximo equipos: ilimitado (solo memoria)
- Tamaño paquetes: ~1KB por evento
- Latencia típica LAN: < 50ms