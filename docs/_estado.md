# Estado de XmasGames

actualizado: 2026-11-26

- **Estado:** ACTIVA.
- **Fase:** v0.2 — CORS restringido y puntuación calculada en servidor.
- **Specs:** NO CONCLUYENTE (no hay spec funcional ni técnica en el repo).
- **Impl vs spec:** sin baseline de spec; catálogo de 3 juegos, panel master y servidor Socket.IO operativos.
- **Testing:** `npm test` → 3/3 (node:test). Build Angular NO verificado: `angular.json` usa el builder obsoleto `@angular-devkit/build-angular:browser` y el proyecto tiene errores TypeScript preexistentes (TS6/imports/rutas). Fuera del alcance de este cambio.
- **Próximo paso:** cargar catálogo excluyendo `_plantilla.json` y añadir reglas de puntuación específicas por juego.
- **Evidencia:** `server.js`, `tests/server.test.js`, `README.md`, `src/app/pages/player/player.component.ts`.
- **Contradicción resuelta:** README ya no describe los juegos como "andamiaje v0.1" ni usa `#/master`.
