import { Injectable, EventEmitter } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import {
  SOCKET_EVENTS,
  SocketRole,
  PlayerJoinPayload,
  SensorDataPayload,
  MasterSelectGamePayload,
  MasterStartGamePayload,
} from '../models/socket.types';
import { Team, GameState } from '../models/game.types';

type SocketClient = Socket;

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: SocketClient | null = null;

  // ── Outputs (via EventEmitter for compatibility) ──
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

    // ── Listeners (usando constantes) ──
    this.socket.on(SOCKET_EVENTS.SERVER.STATE_UPDATE, (data) => this.onGameState.emit(data));
    this.socket.on(SOCKET_EVENTS.SERVER.SCORE_UPDATE, (data) => this.onScoreUpdate.emit(data));
    this.socket.on(SOCKET_EVENTS.SERVER.START, (data) => this.onGameStart.emit(data));
    this.socket.on(SOCKET_EVENTS.SERVER.COUNTDOWN, (data) => this.onGameCountdown.emit(data));
    this.socket.on(SOCKET_EVENTS.SERVER.END, (data) => this.onGameEnd.emit(data));
    this.socket.on(SOCKET_EVENTS.SERVER.ERROR, (msg) => this.onError.emit(String(msg)));
    this.socket.on(SOCKET_EVENTS.SERVER.TEAMS_UPDATE, (data) => this.onTeamsUpdate.emit(data));
    this.socket.on(SOCKET_EVENTS.SERVER.LOBBY_UPDATE, (data) => this.onLobbyUpdate.emit(data));
  }

  // ── Acciones de Jugador ──
  joinTeam(teamId: string, teamName: string, device: string): void {
    const payload: PlayerJoinPayload = { teamId, teamName, device };
    this.emit(SOCKET_EVENTS.PLAYER.JOIN, payload);
  }

  leaveTeam(teamId: string): void {
    this.emit(SOCKET_EVENTS.PLAYER.LEAVE, { teamId });
  }

  setReady(teamId: string): void {
    this.emit(SOCKET_EVENTS.PLAYER.READY, { teamId });
  }

  sendScore(teamId: string, points: number): void {
    this.emit(SOCKET_EVENTS.PLAYER.SCORE, { teamId, points });
  }

  sendSensorData(teamId: string, type: 'gyroscope' | 'microphone' | 'camera' | 'custom', data: Record<string, unknown>): void {
    const payload: SensorDataPayload = { teamId, type, data };
    this.emit(SOCKET_EVENTS.PLAYER.SENSOR_DATA, payload);
  }

  // ── Acciones de Master ──
  selectGame(gameId: string): void {
    const payload: MasterSelectGamePayload = { gameId };
    this.emit(SOCKET_EVENTS.MASTER.SELECT_GAME, payload);
  }

  startGame(duration?: number): void {
    const payload: MasterStartGamePayload = { duration };
    this.emit(SOCKET_EVENTS.MASTER.START_GAME, payload);
  }

  stopGame(): void {
    this.emit(SOCKET_EVENTS.MASTER.STOP_GAME, {});
  }

  resetGame(): void {
    this.emit(SOCKET_EVENTS.MASTER.RESET_GAME, {});
  }

  setTeamName(teamId: string, name: string): void {
    this.emit(SOCKET_EVENTS.MASTER.SET_TEAM_NAME, { teamId, name });
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

  /**
   * Verifica los permisos del navegador para sensores.
   */
  async checkPermissions(): Promise<Record<string, PermissionState>> {
    const permissions: Record<string, PermissionState> = {};
    
    try {
      if ('permissions' in navigator) {
        const camera = await navigator.permissions.query({ name: 'camera' as PermissionName });
        permissions.camera = camera.state;
        
        const microphone = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        permissions.microphone = microphone.state;
      }
    } catch (e) {
      console.warn('[Socket] No se pudieron verificar permisos:', e);
    }
    
    return permissions;
  }

  /**
   * Construye el payload estándar para sensor data (usado por sensor.service).
   */
  createSensorPayload(teamId: string, sensorType: string, data: Record<string, any>): SensorDataPayload {
    return { teamId, type: sensorType as 'gyroscope' | 'microphone' | 'camera' | 'custom', data };
  }
}