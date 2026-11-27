const { build } = require('esbuild');
const { copyFileSync, mkdirSync, existsSync, readdirSync, readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const DIST = join(__dirname, 'dist');

// Create dist directories
const dirs = ['games', 'assets'];
dirs.forEach(dir => {
  const dirPath = join(DIST, dir);
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
});

// Cargar y generar catalog.json dinámicamente
const gamesDir = join(__dirname, 'public', 'games');
const gameFiles = readdirSync(gamesDir)
  .filter(f => f.endsWith('.json') && f !== 'catalog.json' && !f.startsWith('_'));

const games = [];
gameFiles.forEach(file => {
  const path = join(gamesDir, file);
  const data = JSON.parse(readFileSync(path, 'utf-8'));
  // Eliminar campos internos del catálogo
  const { _comment, ...catalogEntry } = data;
  games.push(catalogEntry);
});

// Escribir catalog.json en dist (sobrescribe el que está en public/games si existe)
writeFileSync(join(DIST, 'games', 'catalog.json'), JSON.stringify(games, null, 2));

// Copy games JSON files (template to dist for reference)
const files = ['_plantilla.json'];
files.forEach(file => {
  const src = join(gamesDir, file);
  const dest = join(DIST, 'games', file);
  if (existsSync(src)) {
    copyFileSync(src, dest);
  }
});

// Build Angular app with esbuild
build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  outfile: 'dist/main.js',
  format: 'esm',
  platform: 'browser',
  target: 'es2020',
  loader: {
    '.json': 'json',
    '.scss': 'css',
    '.svg': 'dataurl',
    '.png': 'file',
    '.jpg': 'file',
    '.ico': 'file',
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  minify: true,
  sourcemap: false,
});