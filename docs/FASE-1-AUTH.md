# FASE 1 — Autenticación y Roles

> **Estado:** ✅ Completada (2026-07-18)
> **Dependencias:** FASE 0

## Objetivo

Sistema completo de autenticación con tres roles: `MARTILLERO`, `POSTOR`, `ADMINISTRATIVO`. Login, registro, protección de rutas y dashboards básicos por rol.

## Tareas

| #  | Tarea | Estado |
|----|-------|--------|
| 1.1 | Instalar Auth.js v5 (next-auth@beta) | ✅ |
| 1.2 | Configurar Auth.js con estrategia JWT + credenciales | ✅ |
| 1.3 | Crear API route: `app/api/auth/[...nextauth]/route.ts` | ✅ |
| 1.4 | Crear `src/lib/auth.ts` — configuración Auth.js + providers | ✅ |
| 1.5 | Crear Server Actions de auth: `register`, `login`, `logout` | ✅ |
| 1.6 | Crear páginas: `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx` | ✅ |
| 1.7 | Implementar `middleware.ts` — protección de rutas por rol | ✅ |
| 1.8 | Crear layout de auth: `app/(auth)/layout.tsx` | ✅ |
| 1.9 | Crear página dashboard por rol: `app/dashboard/page.tsx` | ✅ |
| 1.10 | Crear `SessionProvider` wrapper para Client Components | ✅ |

## Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `src/lib/auth.ts` | Config Auth.js, providers, callbacks JWT |
| `src/app/api/auth/[...nextauth]/route.ts` | API route de Auth.js |
| `src/app/actions/auth.ts` | Server Actions: register, login, logout |
| `src/app/(auth)/layout.tsx` | Layout para páginas de auth |
| `src/app/(auth)/login/page.tsx` | Formulario de login |
| `src/app/(auth)/register/page.tsx` | Formulario de registro |
| `src/app/dashboard/page.tsx` | Dashboard redirige según rol |
| `src/app/remates/page.tsx` | Página pública de remates |
| `src/components/providers.tsx` | SessionProvider wrapper |
| `src/types/next-auth.d.ts` | Extensión de tipos de sesión |
| `middleware.ts` | Protección de rutas por rol |

## Criterio de aceptación

- [x] Login funcional con email + contraseña
- [x] Registro crea usuario con rol `POSTOR` por defecto
- [x] Logout destruye sesión
- [x] Middleware redirige no autenticados a `/login`
- [x] Middleware redirige según rol: admin→`/admin/*`, martillero→`/martillero/*`
- [x] Admin puede acceder a rutas protegidas
- [x] Contraseñas hasheadas con bcryptjs
- [x] `pnpm build` compila sin errores
- [x] `pnpm lint` pasa sin errores

## Lógica de middleware

```
Rutas públicas: /, /login, /register, /remates, /api/auth/*
Rutas admin: /admin/* → solo ADMINISTRATIVO
Rutas martillero: /martillero/* → solo MARTILLERO
Rutas postor: /postor/* → solo POSTOR
Rutas dashboard: /dashboard/* → cualquier autenticado
```

## Notas de implementación

- Auth.js v5 (beta.31) con `@auth/prisma-adapter`
- JWT strategy para sesiones (no database sessions)
- El middleware lee el rol del JWT y verifica la ruta solicitada
- Los Server Actions validan sesión antes de ejecutar
- `useActionState` de React 19 para formularios con estado
- Home page muestra botones de auth según sesión
