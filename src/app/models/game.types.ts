// ── Modelo de datos: Juego ────────────────────────────────────────
export interface GameDef {
  /** ID único del juego */
  id: string;
  /** Nombre visible */
  name: string;
  /** Descripción corta */
  description: string;
  /** Icono/emoji */
  icon: string;
  /** Color de acento para la UI */
  accentColor: string;
  /** Sensores que usa: 'gyroscope' | 'microphone' | 'camera' */
  sensors: ('gyroscope' | 'microphone' | 'camera')[];
  /** Mínimo de jugadores (equipos) para este juego */
  minPlayers: number;
  /** Duración en segundos (0 = ilimitado) */
  duration: number;
}

// ── Modelo de datos: Jugador/Equipo ───────────────────────────────
export interface Team {
  id: string;
  name: string;
  /** IP o nombre del dispositivo */
  device: string;
  score: number;
  /** Estado: 'waiting' | 'playing' | 'finished' */
  status: 'waiting' | 'playing' | 'finished';
  /** Últimos datos del juego (varía según juego) */
  lastPayload?: Record<string, unknown>;
}

// ── Modelo de datos: Partida ──────────────────────────────────────
export interface GameState {
  /** ID de la partida (aleatorio) */
  id: string;
  /** Juego activo */
  gameId: string;
  /** Estado: 'waiting' | 'countdown' | 'playing' | 'finished' */
  status: 'waiting' | 'countdown' | 'playing' | 'finished';
  /** Tiempo restante en segundos */
  timeLeft: number;
  /** Equipos registrados */
  teams: Team[];
  /** Datos del juego en curso */
  payload?: Record<string, unknown>;
}
