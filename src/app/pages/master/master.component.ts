import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game.service';
import { SocketService } from '../../services/socket.service';
import { GameDef, Team } from '../../models/game.types';

@Component({
  selector: 'app-master',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [
    `
      .master {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: auto 1fr auto;
        gap: 1rem;
        padding: 1rem;
        min-height: 100vh;
        position: relative;
        z-index: 1;
      }

      .header {
        grid-column: 1 / -1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
      }

      .header h1 {
        font-size: 1.5rem;
        margin: 0;
      }

      .game-select {
        grid-column: 1 / 2;
      }

      .game-card {
        padding: 1rem;
        border-radius: 12px;
        border: 2px solid transparent;
        background: var(--panel-bg);
        margin-bottom: 0.5rem;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .game-card:hover { border-color: var(--ice-blue); }
      .game-card.selected { border-color: var(--gold-star); }

      .game-card h3 { margin: 0 0 0.3rem 0; }
      .game-card p { margin: 0; font-size: 0.85rem; color: var(--ice-blue); }

      .teams-panel {
        grid-column: 2 / 3;
      }

      .team-item {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        padding: 0.8rem;
        border-radius: 10px;
        background: var(--panel-bg);
        margin-bottom: 0.5rem;
      }

      .team-rank {
        font-size: 1.2rem;
        font-weight: 700;
        min-width: 2rem;
      }

      .team-score {
        margin-left: auto;
        font-size: 1.3rem;
        font-weight: 700;
        color: var(--gold-star);
      }

      .controls {
        grid-column: 1 / -1;
        display: flex;
        gap: 1rem;
        justify-content: center;
        padding: 1rem 0;
      }

      .status-badge {
        display: inline-block;
        padding: 0.2rem 0.6rem;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 600;
      }

      .status-badge.waiting { background: #4a4a4a; color: #ccc; }
      .status-badge.playing { background: #2e8b57; color: #fff; }
      .status-badge.finished { background: #d62828; color: #fff; }

      .connection-status {
        position: fixed;
        top: 0.5rem;
        right: 0.5rem;
        padding: 0.3rem 0.8rem;
        border-radius: 8px;
        font-size: 0.8rem;
        z-index: 100;
      }

      .connection-status.online { background: #2e8b57; }
      .connection-status.offline { background: #d62828; }
    `,
  ],
  template: `
    <div class="connection-status" [class.online]="connected()" [class.offline]="!connected()">
      {{ connected() ? '● Online' : '● Offline' }}
    </div>

    <div class="master">
      <div class="header">
        <h1>🖥️ Panel de Control</h1>
        <div>
          <span class="status-badge" [class]="gameService.gameState()?.status || 'waiting'">
            {{ gameStateText() }}
          </span>
        </div>
      </div>

      <div class="game-select panel">
        <h2>🎮 Juegos Disponibles</h2>
        @for (game of games(); track game.id) {
          <div
            class="game-card"
            [class.selected]="selectedGameId() === game.id"
            (click)="selectGame(game)"
          >
            <h3>{{ game.icon }} {{ game.name }}</h3>
            <p>{{ game.description }}</p>
            <small>Sensores: {{ game.sensors.join(', ') }} · {{ game.duration }}s</small>
          </div>
        }
      </div>

      <div class="teams-panel panel">
        <h2>🏆 Clasificación</h2>
        @for (team of ranking(); track team.id) {
          <div class="team-item">
            <span class="team-rank">#{{ $index + 1 }}</span>
            <span style="flex: 1;">
              {{ team.name }}
              <span class="status-badge" [class]="team.status">
                {{ statusText(team.status) }}
              </span>
            </span>
            <span class="team-score">{{ team.score }} pts</span>
          </div>
        } @empty {
          <p style="color: var(--ice-blue);">No hay equipos conectados</p>
        }
      </div>

      <div class="controls">
        <button class="btn btn--red" (click)="startGame()" [disabled]="!selectedGameId()">
          ▶ Iniciar Juego
        </button>
        <button class="btn" (click)="stopGame()" [disabled]="!gameService.isPlaying()">
          ⏹ Detener
        </button>
        <button class="btn btn--ghost" (click)="resetGame()">
          ↺ Reiniciar
        </button>
      </div>
    </div>
  `,
})
export class MasterComponent implements OnInit {
  private gameService = inject(GameService);
  private socketService = inject(SocketService);

  // ── Estado ──
  games = this.gameService.games;
  connected = this.socketService.connected ? () => this.socketService.connected : () => false;
  selectedGameId = computed(() => this.gameService.currentGame()?.id || '');

  // ── Computed ──
  ranking = this.gameService.ranking;

  gameStateText(): string {
    const state = this.gameService.gameState();
    if (!state) return 'Sin partida';
    switch (state.status) {
      case 'waiting': return 'Esperando';
      case 'countdown': return 'Cuenta atrás';
      case 'playing': return 'En juego';
      case 'finished': return 'Finalizado';
    }
  }

  statusText(status: Team['status']): string {
    const map: Record<string, string> = { waiting: 'Esperando', playing: 'Jugando', finished: 'Finalizado' };
    return map[status] || status;
  }

  ngOnInit(): void {
    this.socketService.connect('master');
  }

  selectGame(game: GameDef): void {
    this.gameService.selectGame(game.id);
  }

  startGame(): void {
    this.gameService.startGame();
  }

  stopGame(): void {
    this.gameService.stopGame();
  }

  resetGame(): void {
    this.gameService.resetGame();
  }
}
