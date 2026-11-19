// ── Modelo de datos: Eventos Socket ──────────────────────────────
export type SocketRole = 'master' | 'player';

export type SocketEventName =
  // ── Cliente → Servidor ──
  | 'player.join'
  | 'player.leave'
  | 'player.ready'
  | 'player.score'
  | 'player.sensor-data'
  | 'master.select-game'
  | 'master.start-game'
  | 'master.stop-game'
  | 'master.reset-game'
  | 'master.set-team-name'
  // ── Servidor → Clientes ──
  | 'game.state-update'
  | 'game.score-update'
  | 'game.start'
  | 'game.countdown'
  | 'game.end'
  | 'game.error'
  | 'teams.update'
  | 'lobby.update';

// ── Interfaces de payload ────────────────────────────────────────
export interface PlayerJoinPayload {
  teamId: string;
  teamName: string;
  device: string;
}

export interface ScorePayload {
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

export interface GameStatePayload {
  gameState: any; // GameState from game.types.ts
}

export interface TeamsUpdatePayload {
  teams: any[]; // Team[]
}
