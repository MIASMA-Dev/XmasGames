import { Component, OnInit, OnDestroy, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { SocketService } from '../../services/socket.service';
import { SensorService } from '../../services/sensor.service';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [CommonModule],
  styles: [
    `
      .player {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 1.5rem;
        text-align: center;
        position: relative;
        z-index: 1;
      }

      .team-header {
        margin-bottom: 2rem;
      }

      .team-name {
        font-size: 2rem;
        font-weight: 700;
      }

      .team-score-big {
        font-size: 4rem;
        font-weight: 700;
        color: var(--gold-star);
      }

      .game-area {
        width: 100%;
        max-width: 400px;
        min-height: 300px;
        border-radius: 16px;
        background: var(--panel-bg);
        padding: 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1.5rem;
      }

      .countdown {
        font-size: 5rem;
        font-weight: 700;
        color: var(--red-candy);
        animation: pulse 0.5s ease infinite alternate;
      }

      @keyframes pulse {
        from { transform: scale(1); }
        to { transform: scale(1.1); }
      }

      .sensor-btn {
        padding: 1rem 2rem;
        border-radius: 16px;
        border: 2px solid var(--ice-blue);
        background: transparent;
        color: var(--snow-white);
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
      }

      .sensor-btn.active {
        background: var(--ice-blue);
        color: var(--deep-night);
      }

      .game-instruction {
        font-size: 1.2rem;
        color: var(--ice-blue);
        max-width: 300px;
      }

      .volume-bar {
        width: 100%;
        height: 20px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        overflow: hidden;
      }

      .volume-fill {
        height: 100%;
        background: linear-gradient(90deg, #2e8b57, #ffd700, #d62828);
        transition: width 0.1s ease;
        border-radius: 10px;
      }

      .gyroscope-display {
        width: 200px;
        height: 200px;
        border-radius: 50%;
        border: 4px solid var(--ice-blue);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        transition: transform 0.1s ease;
      }

      .camera-container {
        width: 100%;
        border-radius: 12px;
        overflow: hidden;
      }

      .camera-container video {
        width: 100%;
        border-radius: 12px;
      }
    `,
  ],
  template: `
    <div class="player">
      <div class="team-header">
        <h1 class="team-name">{{ teamInfo().icon }} {{ teamInfo().name }}</h1>
        <div class="team-score-big">{{ score() }}</div>
        <small>puntos</small>
      </div>

      @if (gameState() === 'waiting') {
        <div class="game-area">
          <p class="game-instruction">Esperando al organizador...</p>
          <button class="sensor-btn" (click)="joinGame()">
            🎮 Unirse a la partida
          </button>
        </div>
      } @else if (gameState() === 'countdown') {
        <div class="game-area">
          <div class="countdown">{{ countdown() }}</div>
          <p class="game-instruction">¡Prepárate!</p>
        </div>
      } @else if (gameState() === 'playing') {
        <div class="game-area">
          @if (currentGame()) {
            <h2>{{ currentGame()?.icon }} {{ currentGame()?.name }}</h2>
            <p class="game-instruction">{{ currentGame()?.description }}</p>

            @if (currentGame()?.sensors.includes('gyroscope')) {
              <div class="gyroscope-display" [style.transform]="'rotate(' + gyroAngle() + 'deg)'">
                🛷
              </div>
            }

            @if (currentGame()?.sensors.includes('microphone')) {
              <div class="volume-bar">
                <div class="volume-fill" [style.width.%]="volume()"></div>
              </div>
              <p>Canta ¡¡¡¡!! 🎶</p>
            }

            @if (currentGame()?.sensors.includes('camera')) {
              <div class="camera-container">
                <video #video autoplay playsinline></video>
              </div>
              <button class="sensor-btn" (click)="capture()">📸 ¡Captura!</button>
            }
          }
        </div>
      } @else if (gameState() === 'finished') {
        <div class="game-area">
          <h2>🏆 ¡Juego Finalizado!</h2>
          <div class="team-score-big">{{ score() }}</div>
          <p class="game-instruction">Puntos totales</p>
        </div>
      }
    </div>
  `,
})
export class PlayerComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private gameService = inject(GameService);
  private socketService = inject(SocketService);
  private sensorService = inject(SensorService);

  // ── Estado ──
  teamId = signal('');
  teamInfo = signal<{ id: string; name: string; icon: string }>({
    id: '', name: 'Equipo', icon: '🎮',
  });
  score = signal(0);
  gameState = signal<'waiting' | 'countdown' | 'playing' | 'finished'>('waiting');
  countdown = signal(3);
  currentGame = this.gameService.currentGame;
  volume = signal(0);
  gyroAngle = signal(0);

  private cleanupEffects: (() => void)[] = [];

  readonly teamIcons: Record<string, { name: string; icon: string }> = {
    'team-1': { name: 'Rudos Renos', icon: '🦌' },
    'team-2': { name: 'Ángeles de Hielo', icon: '⛄' },
    'team-3': { name: 'Duendes Navideños', icon: '🧝' },
    'team-4': { name: 'Bolas de Nieve', icon: '☃️' },
    'team-5': { name: 'Estrellas Fugaces', icon: '⭐' },
    'team-6': { name: 'Villancicos Locos', icon: '🎵' },
  };

  ngOnInit(): void {
    const teamId = this.route.snapshot.paramMap.get('teamId') || 'team-1';
    this.teamId.set(teamId);

    const info = this.teamIcons[teamId] || { name: 'Equipo', icon: '🎮' };
    this.teamInfo.set({ id: teamId, ...info });

    // Conectar como jugador
    this.socketService.connect('player', teamId);
    this.socketService.joinTeam(teamId, info.name, navigator.userAgent.slice(0, 30));

    // Efectos para actualizar estado
    this.cleanupEffects.push(
      effect(() => {
        const gs = this.gameService.gameState();
        if (gs) {
          this.gameState.set(gs.status);
          const team = gs.teams?.find(t => t.id === teamId);
          if (team) this.score.set(team.score);
        }
      })
    );

    // Listeners del socket
    this.socketService.onGameStart.subscribe(() => {
      this.gameState.set('playing');
      this.setupSensors();
    });

    this.socketService.onGameCountdown.subscribe((n: number) => {
      this.gameState.set('countdown');
      this.countdown.set(n);
    });

    this.socketService.onGameEnd.subscribe(() => {
      this.gameState.set('finished');
      this.stopSensors();
    });
  }

  joinGame(): void {
    this.socketService.setReady(this.teamId());
  }

  private async setupSensors(): void {
    const game = this.currentGame();
    if (!game) return;

    if (game.sensors.includes('gyroscope')) {
      await this.sensorService.requestGyroscope();
      this.sensorService.subscribeGyroscope((data: any) => {
        if (data.alpha !== undefined) {
          this.gyroAngle.set(data.alpha);
        }
        // Enviar datos al servidor
        this.socketService.sendSensorData(this.teamId(), 'gyroscope', {
          alpha: data.alpha,
          beta: data.beta,
          gamma: data.gamma,
          acceleration: data.acceleration,
        });
      });
    }

    if (game.sensors.includes('microphone')) {
      await this.sensorService.requestMicrophone();
      this.sensorService.subscribeVolume((vol: number) => {
        this.volume.set(vol);
        // El servidor decide la puntuación a partir del volumen
        this.socketService.sendSensorData(this.teamId(), 'microphone', { volume: vol });
      });
    }

    if (game.sensors.includes('camera')) {
      const video = await this.sensorService.requestCamera();
      // Intentar mostrar el video en el elemento del componente
      if (video) {
        // El video se mostraría en el template via template ref
      }
    }
  }

  private stopSensors(): void {
    this.sensorService.stopGyroscope();
    this.sensorService.stopMicrophone();
    this.sensorService.stopCamera();
  }

  capture(): void {
    // El servidor valida la captura y calcula la puntuación
    this.socketService.sendSensorData(this.teamId(), 'camera', { captured: true });
  }

  ngOnDestroy(): void {
    this.stopSensors();
    this.socketService.disconnect();
    this.cleanupEffects.forEach(fn => fn());
  }
}
