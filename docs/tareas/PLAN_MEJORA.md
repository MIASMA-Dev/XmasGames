# Plan de Mejora — XmasGames

**Estado:** PENDIENTE  
**Creado:** 2026-11-27

---

## Fase 1: Corregir Build Angular (CRÍTICO)

### Problema identificado
TypeScript 5.0 rechaza `tsconfig.json` por opciones deprecadas (v24.x).

### Tareas micro-subtareas

**1.1** - Actualizar tsconfig.json con ignoreDeprecations  
**1.2** - Verificar que tsc --noEmit pase sin errores  
**1.3** - Ejecutar ng build y confirmar success  
**1.4** - Documentar el fix en _estado.md

---

## Fase 2: Tests Frontend

### Tareas

**2.1** - Instalar Jest/Vitest (o verificar Karma)  
**2.2** - Crear test para player.component.ts  
**2.3** - Crear test para master.component.ts  
**2.4** - Mock de Socket.IO service para tests

---

## Fase 3: Cargar catálogo de juegos

### Tareas

**3.1** - Revisar game-loader.service.ts  
**3.2** - Verificar que _plantilla.json no se cargue  
**3.3** - Añadir test para filtrado de plantillas  
**3.4** - Documentar proceso de creación de juegos

---

## Fase 4: Mejoras de arquitectura

### Tareas

**4.1** - Refactorizar socket.types.ts (eliminar any)  
**4.2** - Añadir tipos estrictos para scoring por juego  
**4.3** - Mejorar accesibilidad (aria-labels, contraste)  
**4.4** - Añadir pruebas de usabilidad UX

---

## Fase 5: Documentación

### Tareas

**5.1** - Crear GUÍA_DE_DESARROLLO.md  
**5.2** - Actualizar README con comandos nuevos  
**5.3** - Documentar cómo exportar juegos  
**5.4** - Crear ejemplos de juegos personalizados

---

## Prioridad inmediata: Fase 1

Esta fase es **CRÍTICA** para poder compilar el proyecto y continuar con otras mejoras.