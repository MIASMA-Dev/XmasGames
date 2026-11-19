import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { GameService } from '../../services/game.service';
import { GameDef, Team } from '../../models/game.types';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  styles: [
    `
      .lobby {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 2rem;
        text-align: center;
        gap: 2rem;
        position: relative;
        z-index: 1;
      }

      .title {
        font-size: clamp(2rem, 6vw, 3.5rem);
        font-weight: 700;
        background: linear-gradient(135deg, var(--gold-star), #ff6b6b, var(--ice-blue));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .subtitle {
        font-size: 1.1rem;
        color: var(--ice-blue);
        max-width: 500px;
      }

      .role-buttons {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        justify-content: center;
      }

      .role-btn {
        padding: 1.2rem 2rem;
        border-radius: 16px;
        border: 2px solid var(--ice-blue);
        background: var(--panel-bg);
        color: var(--snow-white);
        font-size: 1.2rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 160px;
      }

      .role-btn:hover {
        background: var(--ice-blue);
        color: var(--deep-night);
        transform: translateY(-2px);
      }

      .role-icon {
        font-size: 2.5rem;
        display: block;
        margin-bottom: 0.5rem;
      }

      .team-join {
        margin-top: 1rem;
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        justify-content: center;
      }

      .team-btn {
        padding: 0.8rem 1.5rem;
        border-radius: 12px;
        border: 2px solid;
        background: transparent;
        color: var(--snow-white);
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .team-btn:hover { transform: scale(1.05); }
    `,
  ],
  template: `
    <div class="snowfall">
      @for (s of snowflakes(); track $index) {
        <span [style.left.%]="s.x" [style.animation-duration]="s.d + 's'" [style.animation-delay]="s.delay + 's'" [style.font-size]="s.size + 'rem'">❄</span>
      }
    </div>

    <div class="lobby">
      <h1 class="title">🎄 Navidad Juegos 🎄</h1>
      <p class="subtitle">
        Conéctate como <strong>Organizador</strong> desde tu ordenador
        o como <strong>Equipo</strong> desde tu móvil.
      </p>

      <div class="role-buttons">
        <button class="role-btn" (click)="goTo('master')">
          <span class="role-icon">🖥️</span>
          Organizador
        </button>
      </div>

      <div class="panel" style="margin-top: 1rem;">
        <h2 style="margin: 0 0 1rem 0;">🎮 Elige tu equipo</h2>
        <div class="team-join">
          @for (team of teams(); track team.id) {
            <button
              class="team-btn"
              [style.borderColor]="team.color"
              [style.color]="team.color"
              (click)="goTo('player/' + team.id)"
            >
              {{ team.icon }} {{ team.name }}
            </button>
          }
        </div>
      </div>
    </div>
  `,
})
export class LobbyComponent implements OnInit, OnDestroy {
  private gameService = inject(GameService);

  teams = signal<{ id: string; name: string; icon: string; color: string }[]>([
    { id: 'team-1', name: 'Rudos Renos', icon: '🦌', color: '#d62828' },
    { id: 'team-2', name: 'Ángeles de Hielo', icon: '⛄', color: '#7fd4ff' },
    { id: 'team-3', name: 'Duendes Navideños', icon: '🧝', color: '#2e8b57' },
    { id: 'team-4', name: 'Bolas de Nieve', icon: '☃️', color: '#ffd700' },
    { id: 'team-5', name: 'Estrellas Fugaces', icon: '⭐', color: '#e0aaff' },
    { id: 'team-6', name: 'Villancicos Locos', icon: '🎵', color: '#ff8906' },
  ]);

  private snowflakesSignal = signal<{ x: number; d: number; delay: number; size: number }[]>([]);

  snowflakes() {
    return this.snowflakesSignal();
  }

  ngOnInit(): void {
    // Generar copos de nieve
    const flakes: { x: number; d: number; delay: number; size: number }[] = [];
    for (let i = 0; i < 30; i++) {
      flakes.push({
        x: Math.random() * 100,
        d: 3 + Math.random() * 5,
        delay: Math.random() * 5,
        size: 0.5 + Math.random() * 1.2,
      });
    }
    this.snowflakesSignal.set(flakes);
  }

  ngOnDestroy(): void {}

  goTo(route: string): void {
    window.location.hash = route;
  }
}
