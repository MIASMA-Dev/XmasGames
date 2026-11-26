import { Injectable, inject, computed, signal, WritableSignal, Signal } from '@angular/core';
import { GameDef, Team, GameState } from '../models/game.types';
import { DEFAULT_GAMES } from '../config/games.catalog';
import { GameLoaderService } from './game-loader.service';
import { SocketService } from './socket.service';

/**
 * Gestiona el estado global de la aplicación:
 * - Catálogo de juegos (por defecto + cargados dinámicamente)
 * - Estado de la partida
 * - Equipos
 */
@Injectable({ providedIn: 'root' })
export class GameService {
  private gameLoader = inject(GameLoaderService);
  private socket = inject(SocketService);

  // ── Estado ──
  private _games = signal<GameDef[]>(DEFAULT_GAMES);
  private _gameState = signal<GameState | null>(null);
  private _teams = signal<Team[]>([]);
  private _currentGame = signal<GameDef | null>(null);

  // ── Señales públicas ──
  games = this._games.asReadonly();
  gameState = this._gameState.asReadonly();
  teams = this._teams.asReadonly();
  currentGame = this._currentGame.asReadonly();

  /** ¿Hay un juego activo en curso? */
  isPlaying = computed(() => this._gameState()?.status === 'playing');

  /** ¿Estamos en lobby esperando? */
  isWaiting = computed(() => this._gameState()?.status === 'waiting');

  /** Ranking por puntuación (orden descendente) */
  ranking = computed(() =>
    [...this._teams()].sort((a, b) => b.score - a.score)
  );

  // ── Inicialización ──
  constructor() {
    this.setupSocketListeners();
    this.loadCustomGames();
  }

  /**
   * Carga juegos personalizados desde localStorage y los añade al catálogo.
   */
  private loadCustomGames(): void {
    const custom = this.gameLoader.getStoredGames();
    if (custom.length > 0) {
      this._games.update((prev) => [...prev, ...custom]);
    }
  }

  /**
   * Registra un nuevo juego en el catálogo.
   */
  registerGame(game: GameDef): void {
    this.gameLoader.registerGame(game);
    this._games.update((prev) => [...prev, game]);
  }

  /**
   * Busca un juego por ID.
   */
  getGameById(id: string): GameDef | undefined {
    return this._games().find((g) => g.id === id);
  }

  // ── Gestión de equipos ──
  addTeam(team: Team): void {
    this._teams.update((prev) => [...prev, team]);
  }

  removeTeam(teamId: string): void {
    this._teams.update((prev) => prev.filter((t) => t.id !== teamId));
  }

  updateTeamStatus(teamId: string, status: Team['status']): void {
    this._teams.update((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, status } : t))
    );
  }

  // ── Gestión de la partida ──
  selectGame(gameId: string): void {
    const game = this.getGameById(gameId);
    if (game) {
      this._currentGame.set(game);
      this.socket.selectGame(gameId);
    }
  }

  startGame(duration?: number): void {
    this._teams.update((prev) => prev.map((t) => ({ ...t, score: 0, status: 'playing' as const })));
    this.socket.startGame(duration);
  }

  stopGame(): void {
    this.socket.stopGame();
  }

  resetGame(): void {
    this._gameState.set(null);
    this._teams.update((prev) => prev.map((t) => ({ ...t, score: 0, status: 'waiting' as const })));
    this._currentGame.set(null);
    this.socket.resetGame();
  }

  // ── Listeners del socket ──
  private setupSocketListeners(): void {
    this.socket.onGameState.subscribe((state: GameState) => {
      this._gameState.set(state);
      if (state.teams) {
        this._teams.set(state.teams);
      }
    });

    this.socket.onTeamsUpdate.subscribe((teams: Team[]) => {
      this._teams.set(teams);
    });

    this.socket.onGameStart.subscribe(() => {
      this._teams.update((prev) => prev.map((t) => ({ ...t, status: 'playing' })));
    });

    this.socket.onGameEnd.subscribe(() => {
      this._teams.update((prev) => prev.map((t) => ({ ...t, status: 'finished' })));
    });
  }
}
