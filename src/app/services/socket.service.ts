import { Injectable, inject, DestroyRef, EventEmitter, Output, output } from '@angular/core';
import * as io from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import {
  SocketRole,
  PlayerJoinPayload,
  ScorePayload,
  SensorDataPayload,
  MasterSelectGamePayload,
  MasterStartGamePayload,
} from '../models/socket.types';
import { Team, GameState } from '../models/game.types';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket | null = null;
  private destroyRef = inject(DestroyRef);

  // ── Outputs (_SIGNAL_ style via EventEmitter for simplicity) ──
  readonly onGameState = new EventEmitter<GameState>();
  readonly onScoreUpdate = new EventEmitter<any>();
  readonly onGameStart = new EventEmitter<any>();
  readonly onGameCountdown = new EventEmitter<number>();
  readonly onGameEnd = new EventEmitter<any>();
  readonly onError = new EventEmitter<string>();
  readonly onTeamsUpdate = new EventEmitter<Team[]>();
  readonly onLobbyUpdate = new EventEmitter<any>();

  /** Estado de conexión */
  connected = false;

  /**
   * Conecta al servidor. Detecta automáticamente el hostname del servidor
   * para funcionar en red local.
   */
  connect(role: SocketRole, teamId?: string): void {
    // Usar el hostname actual + puerto para red local
    const url = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`;

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      query: { role, teamId },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      this.connected = true;
      console.log('[Socket] Conectado como', role);
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('[Socket] Desconectado');
    });

    // ── Listeners ──
    this.socket.on('game.state-update', (data) => this.onGameState.emit(data));
    this.socket.on('game.score-update', (data) => this.onScoreUpdate.emit(data));
    this.socket.on('game.start', (data) => this.onGameStart.emit(data));
    this.socket.on('game.countdown', (data) => this.onGameCountdown.emit(data));
    this.socket.on('game.end', (data) => this.onGameEnd.emit(data));
    this.socket.on('game.error', (msg) => this.onError.emit(String(msg)));
    this.socket.on('teams.update', (data) => this.onTeamsUpdate.emit(data));
    this.socket.on('lobby.update', (data) => this.onLobbyUpdate.emit(data));
  }

  // ── Acciones de Jugador ──
  joinTeam(teamId: string, teamName: string, device: string): void {
    this.emit('player.join', { teamId, teamName, device } as PlayerJoinPayload);
  }

  leaveTeam(teamId: string): void {
    this.emit('player.leave', { teamId });
  }

  setReady(teamId: string): void {
    this.emit('player.ready', { teamId });
  }

  sendScore(teamId: string, points: number): void {
    this.emit('player.score', { teamId, points } as ScorePayload);
  }

  sendSensorData(teamId: string, type: string, data: Record<string, unknown>): void {
    this.emit('player.sensor-data', { teamId, type, data } as SensorDataPayload);
  }

  // ── Acciones de Master ──
  selectGame(gameId: string): void {
    this.emit('master.select-game', { gameId } as MasterSelectGamePayload);
  }

  startGame(duration?: number): void {
    this.emit('master.start-game', { duration } as MasterStartGamePayload);
  }

  stopGame(): void {
    this.emit('master.stop-game', {});
  }

  resetGame(): void {
    this.emit('master.reset-game', {});
  }

  setTeamName(teamId: string, name: string): void {
    this.emit('master.set-team-name', { teamId, name });
  }

  // ── Helpers ──
  private emit(event: string, data?: any): void {
    this.socket?.emit(event, data);
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.connected = false;
  }

  /**
   * Devuelve el socket crudo para uso avanzado (ej: escuchar eventos custom).
   */
  getRawSocket(): Socket | null {
    return this.socket;
  }
}
