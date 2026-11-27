// ── Constantes de eventos Socket ──────────────────────────────
// Usamos const assertions para inferencia automática y type safety

export const SOCKET_EVENTS = {
  PLAYER: {
    JOIN: 'player.join',
    LEAVE: 'player.leave',
    READY: 'player.ready',
    SCORE: 'player.score',
    SENSOR_DATA: 'player.sensor-data'
  },
  MASTER: {
    SELECT_GAME: 'master.select-game',
    START_GAME: 'master.start-game',
    STOP_GAME: 'master.stop-game',
    RESET_GAME: 'master.reset-game',
    SET_TEAM_NAME: 'master.set-team-name'
  },
  SERVER: {
    STATE_UPDATE: 'game.state-update',
    SCORE_UPDATE: 'game.score-update',
    START: 'game.start',
    COUNTDOWN: 'game.countdown',
    END: 'game.end',
    ERROR: 'game.error',
    TEAMS_UPDATE: 'teams.update',
    LOBBY_UPDATE: 'lobby.update'
  }
} as const;

// Tipo derivado de los eventos
export type SocketEventName = 
  | typeof SOCKET_EVENTS.PLAYER.JOIN
  | typeof SOCKET_EVENTS.PLAYER.LEAVE
  | typeof SOCKET_EVENTS.PLAYER.READY
  | typeof SOCKET_EVENTS.PLAYER.SCORE
  | typeof SOCKET_EVENTS.PLAYER.SENSOR_DATA
  | typeof SOCKET_EVENTS.MASTER.SELECT_GAME
  | typeof SOCKET_EVENTS.MASTER.START_GAME
  | typeof SOCKET_EVENTS.MASTER.STOP_GAME
  | typeof SOCKET_EVENTS.MASTER.RESET_GAME
  | typeof SOCKET_EVENTS.MASTER.SET_TEAM_NAME
  | typeof SOCKET_EVENTS.SERVER.STATE_UPDATE
  | typeof SOCKET_EVENTS.SERVER.SCORE_UPDATE
  | typeof SOCKET_EVENTS.SERVER.START
  | typeof SOCKET_EVENTS.SERVER.COUNTDOWN
  | typeof SOCKET_EVENTS.SERVER.END
  | typeof SOCKET_EVENTS.SERVER.ERROR
  | typeof SOCKET_EVENTS.SERVER.TEAMS_UPDATE
  | typeof SOCKET_EVENTS.SERVER.LOBBY_UPDATE;

// ── Modelo de datos: Roles y Payloads ─────────────────────────────

export type SocketRole = 'master' | 'player';

// Payload genérico para eventos que no requieren datos
export type EmptyPayload = Record<string, never>;

export interface PlayerJoinPayload {
  teamId: string;
  teamName: string;
  device: string;
}

export interface PlayerLeavePayload {
  teamId: string;
}

export interface PlayerReadyPayload {
  teamId: string;
}

export interface PlayerScorePayload {
  teamId: string;
  points: number;
}

export interface SensorDataPayload {
  teamId: string;
  type: 'gyroscope' | 'microphone' | 'camera' | 'custom';
  data: Record<string, unknown>;
}

export interface MasterSelectGamePayload {
  gameId: string;
}

export interface MasterStartGamePayload {
  duration?: number;
}

export interface MasterStopGamePayload extends EmptyPayload {}

export interface MasterResetGamePayload extends EmptyPayload {}

export interface MasterSetTeamNamePayload {
  teamId: string;
  name: string;
}

// ── Tipos de respuesta del servidor ──────────────────────────────

export interface GameStateUpdatePayload {
  gameState: any; // GameState from game.types.ts
}

export interface ScoreUpdatePayload {
  teamId: string;
  score: number;
}

export interface GameStartPayload extends EmptyPayload {}

export interface GameCountdownPayload {
  seconds: number;
}

export interface GameEndPayload {
  winnerId?: string;
  finalScores: Array<{ teamId: string; score: number }>;
}

export interface GameErrorPayload {
  message: string;
}

export interface TeamsUpdatePayload {
  teams: any[]; // Team[]
}

export interface LobbyUpdatePayload {
  waitingCount: number;
  teams: any[]; // Team[]
}

// ── Mapeo de payloads por evento (para type safety) ───────────────

export interface EventPayloadMap {
  // Player → Server
  [SOCKET_EVENTS.PLAYER.JOIN]: PlayerJoinPayload;
  [SOCKET_EVENTS.PLAYER.LEAVE]: PlayerLeavePayload;
  [SOCKET_EVENTS.PLAYER.READY]: PlayerReadyPayload;
  [SOCKET_EVENTS.PLAYER.SCORE]: PlayerScorePayload;
  [SOCKET_EVENTS.PLAYER.SENSOR_DATA]: SensorDataPayload;
  
  // Master → Server
  [SOCKET_EVENTS.MASTER.SELECT_GAME]: MasterSelectGamePayload;
  [SOCKET_EVENTS.MASTER.START_GAME]: MasterStartGamePayload;
  [SOCKET_EVENTS.MASTER.STOP_GAME]: MasterStopGamePayload;
  [SOCKET_EVENTS.MASTER.RESET_GAME]: MasterResetGamePayload;
  [SOCKET_EVENTS.MASTER.SET_TEAM_NAME]: MasterSetTeamNamePayload;
  
  // Server → Client
  [SOCKET_EVENTS.SERVER.STATE_UPDATE]: GameStateUpdatePayload;
  [SOCKET_EVENTS.SERVER.SCORE_UPDATE]: ScoreUpdatePayload;
  [SOCKET_EVENTS.SERVER.START]: GameStartPayload;
  [SOCKET_EVENTS.SERVER.COUNTDOWN]: GameCountdownPayload;
  [SOCKET_EVENTS.SERVER.END]: GameEndPayload;
  [SOCKET_EVENTS.SERVER.ERROR]: GameErrorPayload;
  [SOCKET_EVENTS.SERVER.TEAMS_UPDATE]: TeamsUpdatePayload;
  [SOCKET_EVENTS.SERVER.LOBBY_UPDATE]: LobbyUpdatePayload;
}