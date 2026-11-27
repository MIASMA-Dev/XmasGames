import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Snowflake {
  element: HTMLSpanElement;
  x: number;
  y: number;
  size: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="landing-container" #container>
      <div class="landing-content">
        <h1 class="landing-title">🎄 Navidad Juegos Multiequipo</h1>
        <p class="landing-subtitle">¡Juega y compite con tu equipo en esta Navidad!</p>
        
        <div class="games-preview">
          <h2>🎮 Juegos Disponibles</h2>
          <div class="games-grid">
            <div class="game-card">
              <div class="game-icon">🚀</div>
              <h3>Giro Rápido</h3>
              <p>gyroscope</p>
            </div>
            <div class="game-card">
              <div class="game-icon">🐘</div>
              <h3>Cancán Elefantes</h3>
              <p>microphone</p>
            </div>
            <div class="game-card">
              <div class="game-icon">📸</div>
              <h3>Captura Sorpresa</h3>
              <p>camera</p>
            </div>
            <div class="game-card">
              <div class="game-icon">✨</div>
              <h3>Toca la Luz</h3>
              <p>touch</p>
            </div>
          </div>
        </div>
        
        <button class="btn btn--red" (click)="joinGame()">
          <span>🎮 Comenzar</span>
        </button>
        
        <div class="teams-section">
          <h2>🏆 Equipos</h2>
          <div class="teams-grid">
            <div class="team-slot" data-team="rojas">
              <span class="team-name">🔴 Rojas</span>
              <span class="team-score">{{ scores['rojas'] || 0 }}</span>
            </div>
            <div class="team-slot" data-team="azules">
              <span class="team-name">🔵 Azules</span>
              <span class="team-score">{{ scores['azules'] || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: linear-gradient(180deg, #0b1220 0%, #14273f 55%, #1c3a52 100%);
      position: relative;
      z-index: 10;
      overflow: hidden;
    }
    
    .landing-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      position: relative;
      z-index: 2;
    }
    
    .landing-content {
      text-align: center;
      max-width: 600px;
    }
    
    .landing-title {
      font-family: 'Press Start 2P', cursive;
      font-size: 2rem;
      background: linear-gradient(90deg, #ffd700, #d62828, #7fd4ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 1rem;
    }
    
    .landing-subtitle {
      font-size: 1.1rem;
      color: #7fd4ff;
      margin-bottom: 2rem;
    }
    
    .games-preview {
      margin: 2rem 0;
    }
    
    .games-preview h2 {
      font-size: 1.3rem;
      margin-bottom: 1rem;
      color: #fff;
    }
    
    .games-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
      justify-content: center;
    }
    
    .game-card {
      background: rgba(13, 27, 42, 0.92);
      border: 1px solid rgba(127, 212, 255, 0.25);
      border-radius: 12px;
      padding: 1rem;
      text-align: center;
    }
    
    .game-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }
    
    .game-card h3 {
      font-size: 0.85rem;
      margin: 0.5rem 0;
      color: #fff;
    }
    
    .game-card p {
      font-size: 0.75rem;
      color: #7fd4ff;
      margin: 0;
    }
    
    .teams-section {
      margin-top: 2rem;
    }
    
    .teams-section h2 {
      font-size: 1.2rem;
      color: #fff;
      margin-bottom: 1rem;
    }
    
    .teams-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      max-width: 300px;
      margin: 0 auto;
    }
    
    .team-slot {
      background: rgba(13, 27, 42, 0.92);
      border: 2px solid;
      border-radius: 12px;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .team-slot::before {
      content: '';
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: 0.5rem;
    }
    
    .team-slot[data-team="rojas"]::before {
      background: #d62828;
    }
    
    .team-slot[data-team="azules"]::before {
      background: #7fd4ff;
    }
    
    .team-name {
      font-weight: 600;
      color: #fff;
    }
    
    .team-score {
      font-family: 'Press Start 2P', cursive;
      font-size: 0.9rem;
      background: linear-gradient(90deg, #ffd700, #d62828);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  `]
})
export class LandingComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('container', { static: true }) container!: ElementRef<HTMLDivElement>;
  scores: { [key: string]: number } = {};
  private snowflakes: Snowflake[] = [];
  private animationFrame: number = 0;

  constructor(private router: Router) {}

  ngOnInit() {
    // Initialize team scores
    this.scores = { rojas: 0, azules: 0 };
  }

  ngAfterViewInit() {
    this.createSnowfall();
    this.startSnowfall();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationFrame);
    this.snowflakes.forEach(sf => sf.element.remove());
  }

  joinGame() {
    this.router.navigate(['/master']);
  }

  private createSnowfall() {
    const container = this.container.nativeElement;
    const snowflakeCount = 50;
    
    for (let i = 0; i < snowflakeCount; i++) {
      const snowflake = document.createElement('span');
      snowflake.textContent = '❆';
      snowflake.style.position = 'absolute';
      snowflake.style.pointerEvents = 'none';
      snowflake.style.userSelect = 'none';
      snowflake.style.zIndex = '1';
      
      const size = Math.random() * 10 + 8;
      snowflake.style.fontSize = size + 'px';
      
      const x = Math.random() * 100;
      snowflake.style.left = x + '%';
      
      const y = -10 - Math.random() * 20;
      snowflake.style.top = y + 'vh';
      
      const speed = Math.random() * 2 + 1;
      const rotationSpeed = Math.random() * 0.5 - 0.25;
      
      container.appendChild(snowflake);
      
      this.snowflakes.push({
        element: snowflake,
        x,
        y,
        size,
        speed,
        rotation: 0,
        rotationSpeed,
      });
    }
  }

  private startSnowfall() {
    const animate = () => {
      this.snowflakes.forEach(sf => {
        sf.y += sf.speed;
        sf.rotation += sf.rotationSpeed;
        
        sf.element.style.transform = `translateY(${sf.y}vh) rotate(${sf.rotation}deg)`;
        sf.element.style.opacity = String(Math.max(0.3, 1 - sf.y / 100));
        
        if (sf.y > 110) {
          sf.y = -10;
          sf.x = Math.random() * 100;
          sf.element.style.left = sf.x + '%';
        }
      });
      
      this.animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
  }
}