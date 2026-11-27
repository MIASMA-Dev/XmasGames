# 📋 Guía: Añadir un nuevo juego

## Paso 1: Preparar el archivo

1. Copia `public/games/_plantilla.json` → `public/games/mi-juego.json`
2. Edita los campos necesarios (ver tabla de campos abajo)

## Paso 2: Configurar scoring (opcional)

Por defecto, los juegos usan reglas de scoring hardcodeadas en el servidor:

| Sensor | Regla por defecto |
|--------|------------------|
| Giroscopio | +1 punto cada 30° de movimiento (cooldown: 500ms) |
| Micrófono | +1 punto por cada 20 unidades de volumen > 50% (cooldown: 500ms) |
| Cámara | +5 puntos por captura (cooldown: 2000ms) |

Para personalizar, modifica el campo `scoring` en tu juego.

## Paso 3: Ejecutar build y reiniciar

```powershell
npm run build    # Genera dist/main.js con el nuevo juego
npm start        # Inicia el servidor Socket.IO
```

¡Listo! El juego aparecerá en el catálogo del Organizador.

---

## Campos disponibles

| Campo | Tipo | Obligatorio | Valores/Formato |
|-------|------|-------------|-----------------|
| `id` | string | ✅ Sí | Único, sin espacios (ej: `mi-juego-favorito`) |
| `name` | string | ✅ Sí | Nombre visible (ej: "Baila la Navidad") |
| `description` | string | ✅ Sí | Descripción corta para el catálogo |
| `icon` | string | ✅ Sí | Emoji o URL de icono |
| `accentColor` | string | ✅ Sí | Color hex (ej: `#ff8906`) |
| `sensors` | array | ✅ Sí | `['gyroscope']` / `['microphone']` / `['camera']` / combinación |
| `minPlayers` | number | ✅ Sí | Mínimo de 3 equipos |
| `maxPlayers` | number | ❌ No | Ilimitado si no se especifica |
| `duration` | number | ✅ Sí | Tiempo en segundos, 0 = ilimitado |
| `inputMode` | string | ❌ No | `'mobile'` / `'desktop'` / `'both'` |
| `requirements` | object | ❌ No | Ver detalle abajo |
| `feedback` | object | ❌ No | `{visual: true, sound: false, haptic: false}` |
| `scoring` | object | ❌ No | Reglas personalizadas |

### Objeto `requirements`

```json
"requirements": {
  "permissions": ["gyroscope"],
  "minVersion": { "ios": 13, "android": 8 }
}
```

### Objeto `scoring.gyroscope`

```json
"scoring": {
  "gyroscope": {
    "trigger": "delta",      // "delta" (cambio de ángulo) o "angle"
    "threshold": 30,         // Grados mínimos para anotar punto
    "pointsPerTrigger": 1,  // Puntos por cada disparador
    "cooldown": 500          // ms mínimos entre puntos
  }
}
```

### Objeto `scoring.microphone`

```json
"scoring": {
  "microphone": {
    "trigger": "volume",     // "volume" (volumen) o "energy"
    "threshold": 50,         // % de volumen mínimo
    "pointsPerUnit": 0.05,   // Puntos por unidad de volumen
    "cooldown": 500
  }
}
```

### Objeto `scoring.camera`

```json
"scoring": {
  "camera": {
    "trigger": "capture",    // "capture" (foto) o "movement"
    "points": 5,             // Puntos por captura
    "cooldown": 2000
  }
}
```

---

## Ejemplo completo: Juego de baile navideño

```json
{
  "id": "baila-vierneo",
  "name": "Baila el Vierneo",
  "description": "Mueve la baqueta y gana puntos. ¡Más rápido, más puntos!",
  "icon": "🕺",
  "accentColor": "#ff6b6b",
  "sensors": ["gyroscope"],
  "minPlayers": 3,
  "maxPlayers": 6,
  "duration": 45,
  "scoring": {
    "gyroscope": {
      "trigger": "delta",
      "threshold": 20,
      "pointsPerTrigger": 2,
      "cooldown": 300
    }
  }
}
```

## Notas importantes

1. **El archivo `_plantilla.json` nunca aparece en el catálogo** - el guion bajo `_` es un prefijo especial que filtra los archivos.

2. **Build requerido** - Cambios en `public/games/` no se reflejan hasta hacer `npm run build`.

3. **Validación** - El servidor valida que `sensors` solo contenga valores válidos.

4. **Compatibilidad** - El micrófono y cámara requieren permiso del usuario al iniciar el juego.