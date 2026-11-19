const { createServer } = require('http');
const { Server } = require('socket.io');
const { readFileSync, readdirSync, existsSync } = require('fs');
const { join, resolve } = require('path');

// ── Config ──
const PORT = process.env.PORT || 3001;
const GAMES_DIR = join(__dirname, 'public', 'games');

// ── Cargar juegos personalizados desde public/games/*.json ──
function loadCustomGames() {
  const games = [];
  if (!existsSync(GAMES_DIR)) return games;
  const files = readdirSync(GAMES_DIR)
    .filter(f => f.endsWith('.json') && f !== 'catalog.json');
  for (const file of files) {
    try {
      const path = join(GAMES_DIR, file);
      const data = JSON.parse(readFileSync(path, 'utf-8'));
      games.push(data);
    } catch (err) {
      console.error(`[Games] Error loading ${file}:`, err.message);
    }
  }
  return games;
}

// ── Estado global de la partida ──
const state = {
  gameId: null,
  gameState: 'waiting', // waiting | countdown | playing | finished
  timeLeft: 0,
  teams: [],
  timer: null,
};

// ── Servidor HTTP + Socket.IO ──
const httpServer = createServer((req, res) => {
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Use the Angular dev server or build for serving.');
});

const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:4200', 'http://localhost:3001', /.+$/],
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
    if (team) team.status = 'waiting';
    io.emit('teams.update', { teams: state.teams });
  });

  // ── Enviar puntuación ──
  socket.on('player.score', (data) => {
    const { teamId: tid, points } = data;
    const team = state.teams.find(t => t.id === tid);
    if (team && state.gameState === 'playing') {
      team.score += points;
      io.emit('game.score-update', { teamId: tid, score: team.score, teams: state.teams });
    }
  });

  // ── Datos de sensor ──
  socket.on('player.sensor-data', (data) => {
    // Los datos de sensor se pueden usar para lógica del juego
    // Por ahora solo los registramos
    socket.to(socket.id).emit('sensor.received', { ok: true });
  });

  // ── Master: seleccionar juego ──
  socket.on('master.select-game', (data) => {
    state.gameId = data.gameId;
    console.log(`[Master] Juego seleccionado: ${data.gameId}`);
    io.emit('game.state-update', {
      gameState: { ...state, gameId: data.gameId },
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
    state.gameState = 'waiting';
    state.timeLeft = 0;
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
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎄 Navidad Juegos - Servidor en http://0.0.0.0:${PORT}\n`);
  console.log(`   Servidor Socket.IO listo para conexiones.`);
  console.log(`   Conecta el frontend Angular con proxy a este puerto.\n`);
});
