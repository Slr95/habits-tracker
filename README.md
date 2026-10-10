# Habit Tracker

Tablero mensual de hábitos, en el estilo de una hoja de cálculo: cuadrícula por día, ánimo, motivación y gráficos de progreso. Los cambios se guardan en PostgreSQL (Neon) con actualizaciones optimistas.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- Drizzle ORM y `@neondatabase/serverless`
- Recharts

## Base de datos

El esquema vive en `src/lib/schema.ts` y el SQL inicial en `drizzle/0000_init.sql`.

- `habits`: id, name, emoji, goal, orden
- `daily_logs`: checkbox de cada hábito y día
- `daily_metrics`: mood y motivation (1–5) por día

## Puesta en marcha

1. Crea un proyecto en [Neon](https://neon.tech) y ejecuta `drizzle/0000_init.sql`.
2. Copia `.env.example` a `.env.local` y completa `DATABASE_URL`.
3. Instala e inicia:

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

El mes arranca en el mes actual. Cambiar año o mes recalcula las columnas (las semanas empiezan en sábado). Cada checkbox y cada puntaje se escriben en la base al instante; si el guardado falla, la celda vuelve a su valor anterior.
