# Mejoras Propuestas para XmasGames

## ✅ COMPLETADAS

### 1. ✅ Verificar Angular build
**Estado: COMPLETADO**

Se resolvió el problema del Angular CLI 22 en Windows usando esbuild como alternativa. El build funciona correctamente y genera un bundle de ~1MB.

**Solución implementada:**
- `build.js` - Script de compilación con esbuild
- `serve.js` - Servidor estático
- Actualización de `package.json` con scripts `npm run build` y `npm run dev`

### 2. ✅ Añadir tests frontend
**Estado: COMPLETADO**

Se crearon tests unitarios usando el test runner nativo de Node.js.

**Archivos creados:**
- `tests/game.service.test.js` (9 tests)
- `tests/master.component.test.js` (9 tests)
- `tests/player.component.test.js` (17 tests)
- `tests/sensor.service.test.js` (8 tests)
- `tests/socket.service.test.js` (11 tests)
- `tests/socket.mock.js` (mock reutilizable)
- `tests/README.md` (documentación)

**Total: 57 tests pasados**

### 3. ✅ Cargar catálogo excluyendo _plantilla.json
**Estado: COMPLETADO**

El server.js ya ignora los archivos con prefijo `_` en la carpeta `public/games/`. La plantilla `_plantilla.json` es correctamente excluida del catálogo.

### 4. ✅ Refactorizar tipos de Socket
**Estado: COMPLETADO**

Se creó un objeto `SOCKET_EVENTS` con const assertion para type safety y mejor autocompletado.

**Cambios:**
- `src/app/models/socket.types.ts` - Nuevas constantes y tipos
- `src/app/services/socket.service.ts` - Actualizado para usar constantes
- `tests/socket.service.test.js` - Tests actualizados

### 5. ✅ Añadir juegos con reglas de scoring específicas
**Estado: COMPLETADO**

Se implementó scoring configurable por juego en el servidor.

**Cambios:**
- `server.js` - Nuevas funciones `awardGyroscopeScore`, `awardMicrophoneScore`, `awardCameraScore`
- `src/app/models/game.types.ts` - Interfaz `ScoringRule` ya existía
- `docs/JUEGOS.md` - Guía completa de scoring
- 5 juegos de ejemplo creados:
  - `aceleracion-navarra.json` - Scoring agresivo gyroscope
  - `cancan-elefantes.json` - Scoring microphone
  - `captura-sorpresa.json` - Scoring camera
  - `navidad-multisensor.json` - Multi-sensor con scoring personalizado
  - `toca-luz.json` - Juego accesible sin sensores

### 6. ✅ Mejorar accesibilidad (documentación)
**Estado: COMPLETADO**

Se documentó el juego `toca-luz.json` como ejemplo de juego accesible sin sensores.

**Pendiente futuro:** Mejorar ARIA labels, contraste y focus management en los componentes.

## Prioridad Baja (Pendientes)

### 7. Persistencia temporal del equipo
**Estado: PENDIENTE**

Guardar en localStorage el último equipo elegido para:
- Mostrar nombre por defecto al recargar
- Recordar equipo en 10 minutos

### 8. Temporizador visual mejorado
**Estado: PENDIENTE**

Mejorar el display del countdown:
- Animación más visual
- Audio al detectar últimos 10 segundos

### 9. Modo desarrollo para nuevos juegos
**Estado: PENDIENTE**

Crear modo donde:
- Se pueda testear un juego sin build completo
- Hot-reload de cambios en JSON de juego

---

## Cómo contribuir con mejoras

1. Elige una mejora pendiente
2. Crea un issue o menciona en el canal correspondiente
3. Usa el flujo: `copia plantilla → edita → build → test → push`

Para cambios significativos, considera:
- Mantener compatibilidad con esbuild
- No agregar dependencias nuevas sin justificar
- Documentar cambios en `docs/specs/`