# FASE 6 — Dashboard y Reportes

> **Estado:** ✅ Completada (2026-07-18)
> **Dependencias:** FASE 1, FASE 2

## Objetivo

Paneles de control para cada rol (ADMINISTRATIVO, MARTILLERO, POSTOR) con información relevante, filtros y estadísticas.

## Tareas

| #  | Tarea | Estado |
|----|-------|--------|
| 6.1 | Dashboard ADMINISTRATIVO: lotes, pujas, usuarios, garantías | ✅ |
| 6.2 | Dashboard MARTILLERO: control de lotes activos, cierre | ✅ |
| 6.3 | Dashboard POSTOR: historial de pujas, garantías | ✅ |
| 6.4 | Componente `Filters.tsx` — filtros y búsqueda | ✅ |
| 6.5 | Utilidad `lib/stats.ts` — estadísticas server-side | ✅ |
| 6.6 | Layouts protegidos por rol | ✅ (middleware existente) |

## Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `src/lib/stats.ts` | Funciones de estadísticas con Prisma aggregates |
| `src/app/admin/dashboard/page.tsx` | Dashboard administrativo con métricas |
| `src/app/martillero/dashboard/page.tsx` | Dashboard martillero con pujas recibidas |
| `src/app/postor/dashboard/page.tsx` | Dashboard postor con historial |
| `src/components/Filters.tsx` | Filtros por estado + StatCard reutilizable |

## Criterio de aceptación

- [x] Admin ve: total lotes, pujas, usuarios, garantías pendientes
- [x] Martillero ve: sus lotes activos, pujas recibidas
- [x] Postor ve: historial de pujas, garantía actual
- [x] Filtros funcionales por estado (URL params)
- [x] Estadísticas calculadas server-side (Prisma aggregates)
- [x] Dashboards protegidos por middleware

## Estadísticas

| Métrica | Rol | Cálculo |
|---------|-----|---------|
| Total activos | Admin | `COUNT(Asset)` |
| Activos activos | Admin/Martillero | `COUNT(Asset WHERE status = ACTIVO)` |
| Total pujas | Admin | `COUNT(Bid)` |
| Puja más alta | Admin | `MAX(Bid.amount)` |
| Usuarios registrados | Admin | `COUNT(User)` |
| Garantías pendientes | Admin | `COUNT(BidderGuarantee WHERE isPaid = false)` |
| Mis pujas | Postor | `COUNT(Bid WHERE userId = current)` |
| Mis ganados | Postor | `COUNT(Bid WHERE isWinning = true AND userId = current)` |

## Notas de implementación

- Todos los datos se cargan en Server Components (sin useEffect)
- Estadísticas calculadas con Prisma aggregates
- Filtros usan URL params para mantener estado navegable
- Dashboards son páginas protegidas por middleware
