import { GameDef } from '../models/game.types';

/**
 * Catálogo de juegos registrados.
 * Cada juego se define como un objeto GameDef.
 *
 * Los juegos se pueden añadir en tiempo de desarrollo en la carpeta
 * `public/games/` como archivos JSON, y se cargan con GameLoaderService.
 */
export const DEFAULT_GAMES: GameDef[] = [
  {
    id: 'trineo-santa',
    name: 'Trineo de Santa',
    description: 'Inclina tu móvil para guiar el trineo y recoger regalos antes de que acabe el tiempo.',
    icon: '🛷',
    accentColor: '#d62828',
    sensors: ['gyroscope'],
    minPlayers: 3,
    duration: 60,
  },
  {
    id: 'canta-villancico',
    name: 'Canta el Villancico',
    description: 'Canta a todo pulmón para subir la estrella del árbol. ¡El más fuerte gana!',
    icon: '🎄',
    accentColor: '#2e8b57',
    sensors: ['microphone'],
    minPlayers: 3,
    duration: 30,
  },
  {
    id: 'camara-magica',
    name: 'Cámara Mágica',
    description: 'Apunta con la cámara a tu alrededor y captura los fantasmas rojos que aparecen.',
    icon: '📷',
    accentColor: '#7fd4ff',
    sensors: ['camera'],
    minPlayers: 3,
    duration: 45,
  },
];
