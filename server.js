const { createServer } = require('http');
const { Server } = require('socket.io');
const { readFileSync, readdirSync, existsSync } = require('fs');
const { join } = require('path');

// ── Config ──
const PORT = process.env.PORT || 3001;
const GAMES_DIR = join(__dirname, 'public', 'games');

// ── Estado global de la partida ──
const state = {
  gameId: null,
  gameDef: null, // Referencia al GameDef cargado
  gameState: 'waiting', // waiting | countdown | playing | finished
  timeLeft: 0,
  teams: [],
  timer: null,
};

// ── Caché de scoring por juego ──
const scoreCooldown = new Map();
const gyroAngle = new Map();

// ── Cargar juegos personalizados desde public/games/*.json ──
let cachedGames = null;
let cacheTime = 0;

async function loadCustomGamesCached() {
  const now = Date.now();
  // Caché por 5 segundos
  if (cachedGames && now - cacheTime < 5000) {
    return cachedGames;
  }
  
  const games = [];
  if (!existsSync(GAMES_DIR)) {
    cachedGames = games;
    cacheTime = now;
    return games;
  }
  
  const files = readdirSync(GAMES_DIR)
    .filter(f => f.endsWith('.json') && f !== 'catalog.json' && !f.startsWith('_'));
  
  for (const file of files) {
    try {
      const path = join(GAMES_DIR, file);
      const data = JSON.parse(readFileSync(path, 'utf-8'));
      games.push(data);
    } catch (err) {
      console.error(`[Games] Error loading ${file}:`, err.message);
    }
  }
  
  cachedGames = games;
  cacheTime = now;
  return games;
}

// ── Puntuación calculada en servidor ──
function awardPoints(teamId, points, cooldownMs) {
  const team = state.teams.find((t) => t.id === teamId);
  if (!team || state.gameState !== 'playing') return;

  const now = Date.now();
  const last = scoreCooldown.get(teamId) || 0;
  if (now - last < cooldownMs) return;

  const safePoints = Math.max(0, Math.min(10, Math.round(Number(points) || 0)));
  if (safePoints === 0) return;

  scoreCooldown.set(teamId, now);
  team.score += safePoints;
  io.emit('game.score-update', { teamId, score: team.score, teams: state.teams });
}

// ── Scoring configurables por juego ──
function awardGyroscopeScore(teamId, delta, scoring) {
  if (!scoring || scoring.trigger !== 'delta') {
    // Fallback al scoring por defecto
    if (delta >= 30) awardPoints(teamId, Math.floor(delta / 30), 500);
    return;
  }
  const threshold = scoring.threshold || 30;
  const pointsPer = scoring.pointsPerTrigger || 1;
  const cooldown = scoring.cooldown || 500;
  if (delta >= threshold) awardPoints(teamId, pointsPer, cooldown);
}

function awardMicrophoneScore(teamId, volume, scoring) {
  if (!scoring || scoring.trigger !== 'volume') {
    // Fallback al scoring por defecto
    if (volume > 50) awardPoints(teamId, Math.floor(volume / 20), 500);
    return;
  }
  const threshold = scoring.threshold || 50;
  const pointsPerUnit = scoring.pointsPerUnit || 1;
  const cooldown = scoring.cooldown || 500;
  if (volume > threshold) awardPoints(teamId, Math.floor(volume * pointsPerUnit), cooldown);
}

function awardCameraScore(teamId, captured, scoring) {
  if (!scoring || scoring.trigger !== 'capture') {
    // Fallback al scoring por defecto
    if (captured) awardPoints(teamId, 5, 2000);
    return;
  }
  const points = scoring.points || 5;
  const cooldown = scoring.cooldown || 2000;
  if (captured) awardPoints(teamId, points, cooldown);
}

function getGameScoring() {
  if (!state.gameDef || !state.gameDef.scoring) return null;
  return state.gameDef.scoring;
}

function scoreFromSensor(teamId, type, data = {}) {
  const scoring = getGameScoring();
  
  if (type === 'gyroscope') {
    const alpha = Number(data.alpha);
    if (!Number.isFinite(alpha)) return;
    const previous = gyroAngle.get(teamId);
    gyroAngle.set(teamId, alpha);
    if (previous === undefined) return;
    const delta = Math.abs(alpha - previous);
    awardGyroscopeScore(teamId, delta, scoring?.gyroscope);
    return;
  }

  if (type === 'microphone') {
    const volume = Number(data.volume ?? data.vol);
    if (Number.isFinite(volume)) {
      awardMicrophoneScore(teamId, volume, scoring?.microphone);
    }
    return;
  }

  if (type === 'camera') {
    const captured = data.captured === true || data.captured === 'true';
    awardCameraScore(teamId, captured, scoring?.camera);
  }
}

// ── Servidor HTTP + Socket.IO ──
const httpServer = createServer((req, res) => {
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Use the Angular dev server or build for serving.');
});

const EXTRA_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) return true; // clientes nativos / scripts
  if (EXTRA_ORIGINS.includes(origin)) return true;
  try {
    const url = new URL(origin);
    const host = url.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return true;
    if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
    if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
    if (/^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
  } catch {
    return false;
  }
  return false;
}

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) callback(null, true);
      else callback(new Error('Origen no permitido'));
    },
    methods: ['GET', 'POST'],
  },
});

// ── Handlers de Socket ──
io.on('connection', (socket) => {
  const role = socket.handshake.query.role || 'player';
  const teamId = socket.handshake.query.teamId;
  console.log(`[Socket] ${socket.id} conectado como ${role}${teamId ? ' (' + teamId + ')' : ''}`);

  // ── Jugador se une ──
  socket.on('player.join', (data) => {
    const { teamId: tid, teamName, device } = data;
    if (!state.teams.find(t => t.id === tid)) {
      state.teams.push({
        id: tid,
        name: teamName,
        device,
        score: 0,
        status: 'waiting',
      });
      console.log(`[Game] Equipo "${teamName}" se ha unido (${tid})`);
    }
    // Enviar estado actual al nuevo jugador
    socket.emit('game.state-update', { gameState: state });
    // Notificar a todos
    io.emit('teams.update', { teams: state.teams });
    io.emit('lobby.update', { teams: state.teams });
  });

  // ── Jugador se va ──
  socket.on('player.leave', (data) => {
    const { teamId: tid } = data;
    const team = state.teams.find(t => t.id === tid);
    if (team) {
      console.log(`[Game] Equipo "${team.name}" se ha desconectado`);
      // No lo eliminamos, solo marcamos como no listo
    }
    io.emit('teams.update', { teams: state.teams });
  });

  // ── Jugador está listo ──
  socket.on('player.ready', (data) => {
    const team = state.teams.find(t => t.id === data.teamId);
    if (team) team.status = 'playing';
    io.emit('teams.update', { teams: state.teams });
  });

  // ── Puntuación: el cliente nunca envía puntos ──
  socket.on('player.score', () => {
    socket.emit('game.error', 'La puntuación se calcula en el servidor');
  });

  // ── Datos de sensor ──
  socket.on('player.sensor-data', (data) => {
    const { teamId: tid, type, sensor } = data || {};
    scoreFromSensor(tid, type, sensor || data?.data || {});
    socket.emit('sensor.received', { ok: true });
  });

  // ── Master: seleccionar juego ──
  socket.on('master.select-game', async (data) => {
    state.gameId = data.gameId;
    // Buscar el GameDef correspondiente
    const games = await loadCustomGamesCached();
    state.gameDef = games.find(g => g.id === data.gameId) || null;
    console.log(`[Master] Juego seleccionado: ${data.gameId}`, state.gameDef?.scoring ? '(scoring configurado)' : '(scoring por defecto)');
    io.emit('game.state-update', {
      gameState: { ...state, gameId: data.gameId, gameDef: state.gameDef },
    });
  });

  // ── Master: iniciar juego ──
  socket.on('master.start-game', (data) => {
    const duration = data.duration || 60;
    if (!state.gameId) {
      io.to(socket.id).emit('game.error', 'No hay juego seleccionado');
      return;
    }

    // Cuenta atrás
    state.gameState = 'countdown';
    let count = 3;
    io.emit('game.countdown', count);
    const countdownTimer = setInterval(() => {
      count--;
      if (count > 0) {
        io.emit('game.countdown', count);
      } else {
        clearInterval(countdownTimer);
        // ¡Juego iniciado!
        state.gameState = 'playing';
        state.timeLeft = duration;
        io.emit('game.start', { gameId: state.gameId, duration });

        // Reset scores
        scoreCooldown.clear();
        gyroAngle.clear();
        state.teams.forEach(t => {
          t.score = 0;
          t.status = 'playing';
        });
        io.emit('teams.update', { teams: state.teams });

        // Timer del juego
        state.timer = setInterval(() => {
          state.timeLeft--;
          if (state.timeLeft <= 0) {
            clearInterval(state.timer);
            state.timer = null;
            state.gameState = 'finished';
            state.teams.forEach(t => t.status = 'finished');
            io.emit('game.end', { teams: state.teams });
            io.emit('teams.update', { teams: state.teams });
          }
        }, 1000);
      }
    }, 1000);
  });

  // ── Master: detener juego ──
  socket.on('master.stop-game', () => {
    if (state.timer) {
      clearInterval(state.timer);
      state.timer = null;
    }
    state.gameState = 'finished';
    state.teams.forEach(t => t.status = 'finished');
    io.emit('game.end', { teams: state.teams });
    io.emit('teams.update', { teams: state.teams });
  });

  // ── Master: reiniciar juego ──
  socket.on('master.reset-game', () => {
    if (state.timer) {
      clearInterval(state.timer);
      state.timer = null;
    }
    state.gameId = null;
    state.gameDef = null;
    state.gameState = 'waiting';
    state.timeLeft = 0;
    scoreCooldown.clear();
    gyroAngle.clear();
    state.teams.forEach(t => { t.score = 0; t.status = 'waiting'; });
    io.emit('game.state-update', { gameState: state });
    io.emit('teams.update', { teams: state.teams });
    io.emit('lobby.update', { teams: state.teams });
  });

  // ── Master: renombrar equipo ──
  socket.on('master.set-team-name', (data) => {
    const team = state.teams.find(t => t.id === data.teamId);
    if (team) {
      team.name = data.name;
      io.emit('teams.update', { teams: state.teams });
    }
  });

  // ── Desconexión ──
  socket.on('disconnect', () => {
    console.log(`[Socket] ${socket.id} desconectado`);
  });
});

// ── Iniciar servidor ──
if (require.main === module) {
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🎄 Navidad Juegos - Servidor en http://0.0.0.0:${PORT}\n`);
    console.log(`   Servidor Socket.IO listo para conexiones.`);
    console.log(`   Conecta el frontend Angular con proxy a este puerto.\n`);
  });
}

module.exports = { isAllowedOrigin, awardPoints, scoreFromSensor, state, loadCustomGamesCached };