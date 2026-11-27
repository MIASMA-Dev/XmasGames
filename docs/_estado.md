# Estado de XmasGames

actualizado: 2026-11-27

- **Estado:** ACTIVA.
- **Fase:** v1.0 — Specs funcionales y técnicas creadas, arquitectura consolidada.
- **Specs:** COMPLETAS (SPEC_FUNCIONAL.md, SPEC_TECNICA.md).
- **Impl vs spec:** ≈ 95 % (servidor completo, 5 juegos de ejemplo, panel master operativo, frontend player funcional, build con esbuild).
- **Testing:** 3/3 tests del servidor pasan. Tests frontend creados con Node.js test runner (57 tests pasados cubriendo GameService, MasterComponent, PlayerComponent, SensorService, SocketService).
- **Build:** ✅ Resuelto - Angular CLI 22 tuvo problemas en Windows, se usó esbuild como alternativa produciendo bundle funcional de 1MB.

## Evidencia
- `docs/specs/SPEC_FUNCIONAL.md` — Especificación funcional
- `docs/specs/SPEC_TECNICA.md` — Especificación técnica (actualizada con build requerido)
- `docs/specs/JUEGOS.md` — Guía completa para añadir juegos (nuevo)
- `docs/MEJORAS.md` — Plan de mejoras pendientes (nuevo)
- `server.js` — Servidor Socket.IO completo con scoring configurables
- `tests/server.test.js` — 3 tests pasados (CORS, caps, scoring)
- `tests/game.service.test.js` — 9 tests de GameService
- `tests/master.component.test.js` — 9 tests de MasterComponent
- `tests/player.component.test.js` — 17 tests de PlayerComponent
- `tests/sensor.service.test.js` — 8 tests de SensorService
- `tests/socket.service.test.js` — 11 tests de SocketService
- `tests/socket.mock.js` — Mock de Socket.IO Client
- `tests/README.md` — Documentación de tests
- `src/app/pages/master/master.component.ts` — Panel organizador
- `src/app/pages/player/player.component.ts` — Pantalla jugador
- `src/app/services/*.ts` — Servicios principales
- `src/app/models/game.types.ts` — Tipos ampliados
- `src/app/models/socket.types.ts` — Tipos de Socket refactorizados
- `src/app/services/socket.service.ts` — Servicio actualizado con constantes de eventos
- `public/games/_plantilla.json` — Plantilla con todos los campos (actualizada)
- `public/games/acceleracion-navarra.json` — Juego ejemplo gyroscope
- `public/games/cancan-elefantes.json` — Juego ejemplo microphone
- `public/games/captura-sorpresa.json` — Juego ejemplo camera
- `public/games/navidad-multisensor.json` — Juego ejemplo multi-sensor
- `public/games/toca-luz.json` — Juego accesible sin sensores
- `build.js` — Script de build con esbuild (alternativa al CLI de Angular)
- `serve.js` — Servidor estático para el build
- `dist/` — Build de producción generado

## Pendientes de Mejora
- Documentar cómo exportar juegos
- Mejorar accesibilidad

## Nueva Funcionalidad: Modo Desarrollo ⚡

- `scripts/dev.js` — Helper para crear juegos y hot-reload
- Los juegos pueden modificarse sin `npm run build`
- Cache de juegos: 5 segundos
- `docs/JUEGOS.md` — Guía completa actualizada

## Tests Actualizados

- Tests de hot-reload y filtrado de `_plantilla.json` agregados (64 tests totales)