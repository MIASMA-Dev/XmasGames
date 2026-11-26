# 🎄 Navidad Juegos Multiequipo

Juegos navideños multiequipo: varios móviles (equipos) juegan en red local
usando los **sensores del móvil** (giroscopio, micrófono, cámara) mientras un
ordenador actúa como **panel de organización/espectación**.

## Características

- 📡 **Red local** (sin internet): servidor Node.js + Socket.IO en el PC,
  front Angular servido en el mismo PC.
- 📱 **3 minijuegos de sensores**:
  | Juego | Sensor |
  |---|---|
  | 🛷 Trineo de Santa | giroscopio |
  | 🎄 Canta el Villancico | micrófono |
  | 📷 Cámara Mágica | cámara |
- 🖥️ **Panel de Organizador** (`#/master`): elegir juego, iniciar, detener,
  reiniciar y ver clasificación en vivo.
- 👥 **Equipos volátiles**: se crean en la partida y desaparecen al terminar
  (mínimo 3, sin tope máximo).
- ➕ **Carga simple de juegos**: copia un JSON a `public/games/` y se suma al
  catálogo (ver sección «Añadir un juego»).

## Arquitectura

```
[PC: servidor Node :3001  +  ng serve :4200]
        │  Socket.IO (señal + estado de partida)
   ┌────┴─────────────┬──────────────┐
 Móvil equipo 1      Móvil equipo 2  Móvil equipo N
 (giroscopio/mic/cámara)
```

- `server.js` — servidor de señalización Socket.IO + lógica de partida
  (cuenta atrás, timer, puntuaciones).
- `src/app/` — Angular 22 (componentes standalone, sin NgModules):
  - `pages/lobby/` — pantalla inicial: elegir rol.
  - `pages/master/` — panel de organización/espectación.
  - `pages/player/` — vista del equipo (móvil): juega con sensores.
  - `services/socket.service.ts` — conexión Socket.IO.
  - `services/sensor.service.ts` — giroscopio, micrófono y cámara
    (con permisos iOS 13+).
  - `services/game.service.ts` — estado global (juegos, equipos, ranking).
  - `config/games.catalog.ts` — catálogo por defecto.
- `public/games/*.json` — catálogo extendido: **cargar juegos nuevos sin tocar código**.

## Puesta en marcha

> Requisitos: Node.js ≥ 20.

```powershell
# 1. Instalar dependencias
npm install

# 2. Terminal A — servidor de señal (Socket.IO)
node server.js

# 3. Terminal B — Angular (http://localhost:4200, escucha en 0.0.0.0)
npx ng serve
```

Desde el móvil (misma red local que el PC):

1. Abre `http://<IP-del-PC>:4200` → eliges tu **equipo**.
2. En el PC, `http://<IP-del-PC>:4200/master` → **Organizador**.
3. Inicia el juego: 3-2-1 y a jugar. 🎄

> **Permisos**: la web debe servirse por `http` en `localhost` o por `https`.
> En red local, Chrome pide permiso de mic/cámara al iniciar cada juego
> (requerimiento de los navegadores).

## Añadir un juego (simple)

1. Copia `public/games/_plantilla.json` → `public/games/mi-juego.json`.
2. Cambia `id`, `name`, `icon`, `sensors`, `duration`.
3. Listo: aparece en el catálogo del Organizador al reiniciar el servidor.

`_plantilla.json` se ignora en el catálogo (prefijo `_`).

## Seguridad en LAN

- Orígenes permitidos: `localhost`, `127.0.0.1`, IPs privadas (10/8, 172.16/12, 192.168/16) y los indicados en `ALLOWED_ORIGINS` (separados por comas).
- La puntuación se calcula en el servidor a partir de `player.sensor-data`; `player.score` ya no suma puntos.
- Verificación: `npm test` (Node test runner).

## Limitaciones conocidas

- **Bluetooth**: descartado. Web Bluetooth no soporta ser *host* GATT desde
  navegador y no existe en Safari iOS (caniuse, 05/2026). WebRTC DataChannel
  como alternativa P2P se deja para una futura versión.
- iOS: el giroscopio exige aceptar el prompt de permiso al tocar «Unirse».

## Estado del proyecto

- Fase: v0.2 (26/11/2026) — Angular 22 + Socket.IO + 3 juegos en catálogo,
  CORS restringido y scoring validado en servidor.
- Ver `docs/ALBARAN.md` (workspace) para estado global del app 20.
