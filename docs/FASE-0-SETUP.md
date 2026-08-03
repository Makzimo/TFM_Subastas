# FASE 0 — Infraestructura y Setup

> **Estado:** ✅ Completada (2026-07-18)
> **Dependencias:** Ninguna (fase bloqueante)

## Objetivo

Proyecto funcional con base de entorno, dependencias, estructura de carpetas, Docker PostgreSQL y schema Prisma sincronizado.

## Tareas

| #  | Tarea | Estado |
|----|-------|--------|
| 0.1 | Inicializar proyecto Next.js 16 con App Router, TypeScript 5.8 strict | ✅ |
| 0.2 | Instalar y configurar Tailwind CSS v4 (CSS-first config) | ✅ |
| 0.3 | Instalar y configurar Shadcn/UI (`components.json`, theme CSS vars) | ✅ |
| 0.4 | Configurar Prisma 7 con PostgreSQL adapter (`@prisma/adapter-pg`) | ✅ |
| 0.5 | Ejecutar `prisma db push` — schema sincronizado | ✅ |
| 0.6 | Configurar variables de entorno (`.env`, `.env.example`) | ✅ |
| 0.7 | Configurar ESLint con `typescript-eslint` | ✅ |
| 0.8 | Configurar path aliases (`@/` → `./src/`) | ✅ |
| 0.9 | Crear estructura de carpetas base | ✅ |
| 0.10 | Seed de usuario admin (`admin@remates.cl`) | ✅ |

## Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `docker-compose.yml` | PostgreSQL 16 Alpine, puerto 5432 |
| `.env` | DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET |
| `.env.example` | Plantilla sin credenciales |
| `.gitignore` | node_modules, .next, .env, etc. |
| `package.json` | Scripts: dev, build, db:generate, db:push, db:seed, etc. |
| `tsconfig.json` | TypeScript strict, path alias `@/*` |
| `next.config.ts` | Configuración Next.js |
| `postcss.config.mjs` | PostCSS + Tailwind v4 |
| `components.json` | Shadcn/UI config (new-york style) |
| `prisma/schema.prisma` | 5 modelos + 2 enums |
| `prisma.config.ts` | Config Prisma 7 (datasource URL, migrations, seed) |
| `prisma/seed.ts` | Seed usuario admin con bcryptjs |
| `src/app/layout.tsx` | Layout raíz |
| `src/app/page.tsx` | Página placeholder |
| `src/app/globals.css` | CSS variables Shadcn + Tailwind |
| `src/lib/prisma.ts` | Singleton PrismaClient con adapter |
| `src/lib/utils.ts` | Helper `cn()` |
| `src/types/auction.ts` | Interfaces TypeScript |
| `eslint.config.mjs` | ESLint + typescript-eslint |

## Criterio de aceptación

- [x] `pnpm dev` funciona sin errores en `localhost:3000`
- [x] Prisma conecta exitosamente a PostgreSQL via Docker
- [x] `prisma db push` sincroniza schema correctamente
- [x] `pnpm db:seed` crea usuario admin
- [x] `pnpm lint` pasa sin errores
- [x] `tsconfig.json` con strict mode habilitado

## Notas de implementación

- Se usó Prisma 7 con driver adapter (`@prisma/adapter-pg`), no el ORM clásico
- El schema de Prisma ya no acepta `url` en el bloque `datasource` — se configura en `prisma.config.ts`
- Next.js 16 eliminó `next lint` — se usa ESLint directamente
- Tailwind v4 usa configuración CSS-first, sin `tailwind.config.ts`
- TypeScript se instaló en v5.8 (v7.0 era incompatible con typescript-eslint)
