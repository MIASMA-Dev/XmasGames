# Cómo Añadir Juegos a XmasGames

## Tabla de Campos

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `id` | string | ✅ | ID único (kebab-case recomendado) |
| `name` | string | ✅ | Nombre visible en el catálogo |
| `description` | string | ✅ | Descripción corta para el catálogo |
| `icon` | string | ✅ | Emoji o icono del juego |
| `accentColor` | string | ✅ | Color hexadecimal para UI |
| `sensors` | array | ✅ | Sensores requeridos |
| `minPlayers` | number | ✅ | Mínimo de equipos |
| `duration` | number | ✅ | Duración en segundos |
| `maxPlayers` | number | ❌ | Máximo de equipos (por defecto: ilimitado) |
| `inputMode` | string | ❌ | 'mobile', 'desktop', o 'both' (por defecto: 'mobile') |
| `requirements` | object | ❌ | Permisos y versiones mínimas |
| `feedback` | object | ❌ | Configuración visual/sonora/háptica |
| `scoring` | object | ❌ | Reglas de puntuación por sensor |

## Sensores Disponibles

| Sensor | Descripción | Puntuación por defecto |
|--------|-------------|------------------------|
| `gyroscope` | Acelerómetro/giroscopio del móvil | 1 punto cada 30° de delta |
| `microphone` | Micrófono | 1 punto cada 20 unidades de volumen |
| `camera` | Cámara | 5 puntos por captura |

## Reglas de Puntuación

### Gyroscope (`scoring.gyroscope`)

```json
{
  "gyroscope": {
    "trigger": "delta",      // Solo "delta" soportado actualmente
    "threshold": 30,         // Umbral en grados para otorgar puntos
    "pointsPerTrigger": 1,   // Puntos otorgados por trigger
    "cooldown": 500          // Cooldown en milisegundos
  }
}
```

**Ejemplo:** Un jugador que hace un movimiento de 90° obtiene:
- 1 trigger (90° ≥ 30°)
- 1 punto

### Microphone (`scoring.microphone`)

```json
{
  "microphone": {
    "trigger": "volume",     // Solo "volume" soportado actualmente
    "threshold": 50,         // Volumen mínimo para empezar a ganar puntos
    "pointsPerUnit": 0.05,   // Puntos por unidad de volumen
    "cooldown": 500          // Cooldown en milisegundos
  }
}
```

**Ejemplo:** Un jugador con volumen de 80:
- 80 > 50 (threshold)
- Puntos: floor(80 * 0.05) = 4 puntos

### Camera (`scoring.camera`)

```json
{
  "camera": {
    "trigger": "capture",    // Solo "capture" soportado actualmente
    "points": 5,             // Puntos por captura
    "cooldown": 2000         // Cooldown en milisegundos
  }
}
```

## Estructura Completa (GameDef)

```json
{
  "id": "mi-juego",
  "name": "Nombre del Juego",
  "description": "Cómo se juega en una línea",
  "icon": "🎄",
  "accentColor": "#ff8906",
  "sensors": ["gyroscope", "microphone"],
  "minPlayers": 2,
  "maxPlayers": 6,
  "duration": 60,
  "inputMode": "mobile",
  "requirements": {
    "permissions": ["gyroscope", "microphone"],
    "minVersion": { "ios": 13, "android": 8 }
  },
  "feedback": {
    "visual": true,
    "sound": true,
    "haptic": false
  },
  "scoring": {
    "gyroscope": {
      "trigger": "delta",
      "threshold": 30,
      "pointsPerTrigger": 1,
      "cooldown": 500
    },
    "microphone": {
      "trigger": "volume",
      "threshold": 60,
      "pointsPerUnit": 0.1,
      "cooldown": 300
    },
    "camera": {
      "trigger": "capture",
      "points": 10,
      "cooldown": 3000
    }
  }
}
```

## Flujo Completo

1. **Crear el archivo de juego**
   ```bash
   cp public/games/_plantilla.json public/games/mi-juego.json
   ```

2. **Editar el archivo**
   - Cambiar `id` a un valor único
   - Configurar `sensors` según los requerimientos
   - Ajustar `scoring` para personalizar la mecánica

3. **Construir el proyecto**
   ```bash
   npm run build
   ```

4. **Iniciar el servidor**
   ```bash
   npm start
   ```

5. **Verificar en el catálogo**
   - El juego aparecerá automáticamente en el frontend
   - Acceder a: `http://localhost:3001/games/catalog.json`

## Modo Desarrollo ⚡

Para desarrollo rápido sin rebuild continuo, usa el modo dev:

### Crear un juego rápidamente
```bash
node scripts/dev.js add nombre-juego
```

### Ver lista de juegos
```bash
node scripts/dev.js list
```

### Hot-reload (sin rebuild)
1. Crea/edita juegos en `public/games/`
2. Recarga la pagina en el navegador
3. Los cambios se reflejan inmediatamente (el servidor cachea 5s)

**Nota:** El modo dev no requiere `npm run build`. Solo recarga la pagina para ver cambios en nuevos juegos.

## Notas Importantes

- ✋ **Archivo de plantilla:** No se carga automáticamente. El prefijo `_` en `_plantilla.json` es correcto.
- ⏱️ **Build requerido:** La modificación en JSON necesita `npm run build` para aparecer en el build.
- 🔄 **Cache de juegos:** El servidor cachea los juegos por 5 segundos. Espera un poco si no ves cambios inmediatamente.
- 🎯 **Scoring por defecto:** Si no defines `scoring`, se usan valores por defecto (1 punto cada 30°, 1 punto cada 20 volumen, 5 puntos captura).

---

## Ejemplo de Juego con Touch (Sin Sensores)

Para juegos accesibles sin sensores, usa `touch` como entrada principal:

```json
{
  "id": "tocca-luz",
  "name": "Tócca la Luz",
  "description": "Toque para ganar puntos",
  "icon": "✨",
  "accentColor": "#ffd700",
  "sensors": [],
  "minPlayers": 1,
  "maxPlayers": 10,
  "duration": 60,
  "inputMode": "mobile",
  "scoring": {
    "touch": {
      "trigger": "tap",
      "pointsPerTap": 1,
      "cooldown": 500
    }
  }
}
```

**Nota:** Los juegos sin sensores usan touch como entrada por defecto en el cliente. El scoring se calcula localmente y se sincroniza con el servidor.