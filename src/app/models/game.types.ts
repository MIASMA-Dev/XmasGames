// ── Modelo de datos: Juego ────────────────────────────────────────
export interface GameDef {
  /** ID único del juego (sin espacios, kebab-case recomendado) */
  id: string;
  /** Nombre visible */
  name: string;
  /** Descripción corta para el catálogo */
  description: string;
  /** Icono/emoji */
  icon: string;
  /** Color de acento para la UI */
  accentColor: string;
  /** Sensores que usa: 'gyroscope' | 'microphone' | 'camera' */
  sensors: ('gyroscope' | 'microphone' | 'camera')[];
  /** Mínimo de jugadores (equipos) para este juego */
  minPlayers: number;
  /** Máximo de jugadores (equipos) - opcional, por defecto ilimitado */
  maxPlayers?: number;
  /** Duración en segundos (0 = ilimitado) */
  duration: number;
  
  /** Modo de entrada: 'mobile' (solo móviles), 'desktop', o 'both' (por defecto: 'mobile') */
  inputMode?: 'mobile' | 'desktop' | 'both';
  
  /** Requisitos específicos */
  requirements?: {
    permissions: ('gyroscope' | 'microphone' | 'camera')[];
    minVersion?: { ios?: number; android?: number };
  };
  
  /** Configuración de feedback visual/sonoro */
  feedback?: {
    visual: boolean;
    sound: boolean;
    haptic: boolean;
  };
  
  /** Reglas de puntuación por tipo de sensor (personalizables por juego) */
  scoring?: {
    gyroscope?: ScoringRuleGyroscope;
    microphone?: ScoringRuleMicrophone;
    camera?: ScoringRuleCamera;
  };
  /** Metadata adicional (origen, versión) */
  source?: string;
}

// ── Tipos de scoring por sensor ──────────────────────────────────────
export interface ScoringRuleGyroscope {
  trigger: 'delta' | 'angle';
  threshold: number;
  pointsPerTrigger: number;
  cooldown: number;
}

export interface ScoringRuleMicrophone {
  trigger: 'volume' | 'energy';
  threshold: number;
  pointsPerUnit: number;
  cooldown: number;
}

export interface ScoringRuleCamera {
  trigger: 'capture' | 'movement';
  points: number;
  cooldown: number;
}

// ── Metadata adicional (para tracking de fuentes) ───────────────────
export interface GameMetadata {
  /** Origen del juego: 'default' | 'dev' | 'server' | 'custom' */
  source?: string;
  /** Versión del juego (para hot-reload) */
  version?: string;
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