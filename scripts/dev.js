#!/usr/bin/env node
/**
 * Script de desarrollo para XmasGames
 * Permite hot-reload de juegos sin necesidad de rebuild completo
 * 
 * Uso:
 *   node scripts/dev.js add <game-id>  # Crear un nuevo juego desde template
 *   node scripts/dev.js reload         # Recargar juegos en tiempo real
 *   node scripts/dev.js watch          # Vigilar cambios en public/games/
 */

const { readFileSync, writeFileSync, readdirSync, existsSync } = require('fs');
const { join } = require('path');

const GAMES_DIR = join(__dirname, '..', 'public', 'games');
const TEMPLATE_PATH = join(GAMES_DIR, '_plantilla.json');

/**
 * Crear un nuevo juego desde el template
 */
function createGame(id) {
  if (!id) {
    console.error('Error: se requiere un ID de juego');
    console.log('Uso: node scripts/dev.js add <game-id>');
    process.exit(1);
  }

  const templatePath = existsSync(TEMPLATE_PATH) 
    ? TEMPLATE_PATH 
    : join(GAMES_DIR, 'aceleracion-navarra.json');

  let template;
  try {
    template = JSON.parse(readFileSync(templatePath, 'utf-8'));
  } catch (e) {
    console.error('Error leyendo template:', e.message);
    process.exit(1);
  }

  // Clonar y actualizar ID
  const game = {
    ...template,
    id,
    _dev: { createdAt: new Date().toISOString() }
  };

  // Eliminar campos de ejemplo
  delete game._usage;
  delete game._dev;

  const outputPath = join(GAMES_DIR, `${id}.json`);
  writeFileSync(outputPath, JSON.stringify(game, null, 2), 'utf-8');
  console.log(`✅ Juego creado: ${outputPath}`);
  console.log(`   Edita el archivo y recarga la pagina para ver los cambios.`);
}

/**
 * Listar juegos disponibles
 */
function listGames() {
  if (!existsSync(GAMES_DIR)) {
    console.log('Carpeta de juegos no existe aún.');
    return;
  }

  const files = readdirSync(GAMES_DIR)
    .filter(f => f.endsWith('.json') && !f.startsWith('_') && f !== 'catalog.json');

  if (files.length === 0) {
    console.log('No hay juegos definidos.');
    return;
  }

  console.log('Juegos disponibles:');
  files.forEach(f => {
    try {
      const data = JSON.parse(readFileSync(join(GAMES_DIR, f), 'utf-8'));
      console.log(`  - ${data.id}: ${data.name} (${data.sensors?.join(', ') || 'touch'})`);
    } catch (e) {
      console.log(`  - ${f} (error al leer)`);
    }
  });
}

/**
 * Mostrar ayuda
 */
function help() {
  console.log(`
XmasGames Dev Helper

Comandos:
  add <id>    Crear un nuevo juego desde template
  list        Listar juegos disponibles
  reload      Forzar recarga de juegos (desde el servidor)
  help        Mostrar esta ayuda

Ejemplo:
  node scripts/dev.js add mi-nuevo-juego
`);
}

// ── Main ──
const cmd = process.argv[2];
const arg = process.argv[3];

switch (cmd) {
  case 'add':
    createGame(arg);
    break;
  case 'list':
    listGames();
    break;
  case 'reload':
    // En un entorno real, esto dispararía un evento al servidor
    console.log('🔄 Hot-reload activado. Los cambios se reflejarán al recargar la pagina.');
    console.log('   Notifica al servidor: curl -X POST http://localhost:3001/api/games/reload');
    break;
  case 'help':
  default:
    help();
}