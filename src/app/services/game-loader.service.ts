import { Injectable, inject, signal, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GameDef } from '../models/game.types';
import { DEFAULT_GAMES } from '../config/games.catalog';

/**
 * Carga juegos desde la carpeta `public/games/` como archivos JSON.
 * Cada juego es un archivo `game-id.json` con la estructura de GameDef.
 *
 * Se puede añadir nuevos juegos simplemente creando un nuevo archivo JSON.
 */
@Injectable({ providedIn: 'root' })
export class GameLoaderService {
  private readonly http = inject(HttpClient);
  private readonly GAMES_URL = '/games';

  /** Juegos del catálogo por defecto */
  get defaultGames(): GameDef[] {
    return DEFAULT_GAMES;
  }

  /**
   * Modo desarrollo: hot-reload de juegos desde localStorage
   */
  readonly devMode: Signal<boolean> = signal(false);

  /**
   * Carga un juego específico por ID desde la carpeta public/games/
   */
  loadGameById(id: string): Observable<GameDef> {
    return this.http.get<GameDef>(`${this.GAMES_URL}/${id}.json`);
  }

  /**
   * Carga todos los juegos disponibles desde public/games/
   * Se usa como fallback cuando no hay servidor o para modo offline.
   */
  loadAllGames(): Observable<GameDef[]> {
    return this.http.get<GameDef[]>(`${this.GAMES_URL}/catalog.json`);
  }

  /**
   * Registra un nuevo juego en el catálogo (lado cliente para desarrollo).
   * En producción, se añaden al servidor directamente.
   */
  registerGame(game: GameDef): void {
    // Se podría persistir en localStorage para modo offline
    const stored = this.getStoredGames();
    const index = stored.findIndex((g) => g.id === game.id);
    if (index >= 0) {
      stored[index] = game;
    } else {
      stored.push(game);
    }
    localStorage.setItem('navidad-custom-games', JSON.stringify(stored));
  }

  /**
   * Obtiene los juegos personalizados almacenados en localStorage
   */
  getStoredGames(): GameDef[] {
    try {
      const raw = localStorage.getItem('navidad-custom-games');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * Modo desarrollo: recarga juegos desde localStorage (hot-reload)
   */
  reloadDevGames(): GameDef[] {
    const custom = this.getStoredGames();
    // Disparar evento para notificar a otros tabs
    window.dispatchEvent(new CustomEvent('navidad-games-updated', { detail: custom }));
    return custom;
  }

  /**
   * Modo desarrollo: escucha cambios en localStorage
   */
  onGamesUpdated(callback: (games: GameDef[]) => void): () => void {
    const handler = (e: StorageEvent) => {
      if (e.key === 'navidad-custom-games') {
        try {
          const games = e.newValue ? JSON.parse(e.newValue) : [];
          callback(games);
        } catch {
          // ignora
        }
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }
}
