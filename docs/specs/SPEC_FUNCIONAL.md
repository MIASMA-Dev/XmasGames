# Especificación Funcional — XmasGames

**Versión:** 1.0  
**Fecha:** 2026-11-27  
**Estado:** DRAFT  

## 1. Visión General

XmasGames es un sistema multijugador local para juegos navideños que utiliza sensores de dispositivos móviles. Un servidor central (PC) coordina múltiples clientes (móviles) a través de Socket.IO, permitiendo que equipos jueguen simultáneamente conectados a la misma red LAN.

## 2. Usuarios

### 2.1 Roles

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **Organizador (Master)** | Usuario que ejecuta el panel de control en el PC | Seleccionar juego, iniciar/detener partidas, reiniciar, ver clasificación |
| **Jugador (Player)** | Cada equipo conecta un móvil | Unirse a partida, jugar con sensores, ver puntuación personal |

## 3. Funcionalidades

### 3.1 Registro de Usuarios

No se requiere registro. Los equipos se identifican con un `teamId` generado aleatoriamente o elegido por el jugador.

### 3.2 Autenticación

No hay autenticación. La participación es anónima y volátil.

### 3.3 Panel de Organizador (Master)

El organizador accede a `/master` y ve:

- **Lista de juegos disponibles**
  - Muestra icono, nombre y descripción
  - Click para seleccionar juego
  - Muestra duración y sensores requeridos

- **Clasificación en vivo**
  - Ranking por puntuación descendente
  - Estado de cada equipo (Esperando/Jugando/Finalizado)

- **Controles de partida**
  - ▶ Iniciar Juego (requiere juego seleccionado)
  - ⏹ Detener (solo cuando hay juego activo)
  - ↺ Reiniciar (limpia estado)

- **Cuenta atrás**
  - Antes de iniciar: 3-2-1 visual
  - Durante juego: temporizador decreciente

### 3.4 Pantalla de Jugador

El jugador accede a `/` con su `teamId` como parámetro de ruta.

**Estados de la partida:**

1. **Esperando**: Muestra botón "Unirse a la partida"
2. **Cuenta atrás**: Muestra animación con "¡Prepárate!"
3. **Juego activo**: Interfaz según sensores del juego
4. **Finalizado**: Muestra puntuación final

### 3.5 Sensores

#### Giroscopio
- Usa `DeviceOrientation` y `DeviceMotionEvent`
- Puntuación: desplazamiento angular ≥ 30° = +1 punto
- Cooldown: 500ms entre puntos válidos

#### Micrófono
- Usa Web Audio API + analizador de frecuencia
- Volumen > 50 = +1 punto por cada 20 puntos de volumen
- Cooldown: 500ms entre puntos

#### Cámara
- Usa `getUserMedia` con `facingMode: environment`
- Botón "¡Captura!" para disparar
- Cada captura válida = +5 puntos
- Cooldown: 2000ms entre capturas

### 3.6 Juegos

Los juegos se definen en JSON y se cargan dinámicamente.

**Estructura de un juego:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Identificador único |
| `name` | string | Nombre visible |
| `description` | string | Descripción corta |
| `icon` | string | Emoji o icono |
| `accentColor` | string | Color para UI |
| `sensors` | array | Sensores requeridos |
| `minPlayers` | number | Mínimo de equipos |
| `duration` | number | Duración en segundos |

### 3.7 Reglas de Negocio

1. **Cantidad mínima de equipos:** 3 equipos para iniciar juego
2. **Equipo volátil:** Se crea al unirse, se elimina al desconectarse (marca como "no listo")
3. **Puntuación servidor:** El cálculo de puntos se hace en el servidor, el cliente solo envía datos de sensor
4. **CORS restringido:** Solo IPs de LAN y localhost pueden conectarse

## 4. Flujos de Usuario

### 4.1 Flujo de Organizador

```
Acceder a /master → Seleccionar juego → Unir equipos → 
Hacer clic en ▶ Iniciar → Esperar cuenta atrás 3-2-1 → 
Durante juego ver clasificación → ⏹ Detener o esperar fin → Ver resultado
```

### 4.2 Flujo de Jugador

```
Acceder a /?teamId=team-X → Esperar → Hacer clic en "Unirse" → 
Recibir cuenta atrás → Jugar con sensores → Ver puntuación → Fin del juego
```

## 5. Integraciones

### 5.1 Socket.IO

| Evento | Dirección | Payload | Descripción |
|--------|-----------|---------|-------------|
| `player.join` | C→S | {teamId, teamName, device} | Unir equipo |
| `player.leave` | C→S | {teamId} | Salir equipo |
| `player.ready` | C→S | {teamId} | Marcar listo |
| `player.sensor-data` | C→S | {teamId, type, data} | Enviar datos de sensor |
| `master.select-game` | C→S | {gameId} | Seleccionar juego |
| `master.start-game` | C→S | {duration} | Iniciar partida |
| `master.stop-game` | C→S | {} | Detener partida |
| `master.reset-game` | C→S | {} | Reiniciar |
| `master.set-team-name` | C→S | {teamId, name} | Cambiar nombre |
| `game.state-update` | S→C | GameState | Estado actualizado |
| `game.score-update` | S→C | {teamId, score, teams} | Actualización puntuación |
| `game.start` | S→C | {gameId, duration} | Juego iniciado |
| `game.countdown` | S→C | n | Cuenta atrás |
| `game.end` | S→C | {teams} | Partida terminada |
| `game.error` | S→C | string | Error |
| `teams.update` | S→C | {teams} | Equipo actualizado |
| `lobby.update` | S→C | {teams} | Lobby actualizado |

## 6. Suposiciones y Límites

1. **Red local:** El sistema está pensado para redes LAN privadas, no internet
2. **Sin persistencia:** No hay guardado de partidas o usuarios
3. **3 juegos iniciales:** Trineo Santa, Canta el Villancico, Cámara Mágica
4. **Compatibilidad:** Chrome (móvil y escritorio), Safari iOS 13+