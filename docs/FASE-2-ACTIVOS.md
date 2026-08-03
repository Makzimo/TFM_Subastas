# FASE 2 — Gestión de Activos (Lotes)

> **Estado:** ✅ Completada (2026-07-18)
> **Dependencias:** FASE 1

## Objetivo

CRUD completo de activos (vehículos/especies) con transiciones de estado, subida de imágenes y panel de administración.

## Tareas

| #  | Tarea | Estado |
|----|-------|--------|
| 2.1 | Completar interfaces en `types/auction.ts` | ✅ |
| 2.2 | Implementar `lib/auction-engine.ts` — lógica de negocio de activos | ✅ |
| 2.3 | Server Actions CRUD de activos: `app/actions/assets.ts` | ✅ |
| 2.4 | API route uploads: `app/api/uploads/route.ts` | ✅ |
| 2.5 | Componente `AssetCard.tsx` para listados | ✅ |
| 2.6 | Página pública de listado: `app/remates/page.tsx` | ✅ |
| 2.7 | Página de detalle: `app/remates/[id]/page.tsx` | ✅ |
| 2.8 | Panel admin: crear activo `app/admin/activos/nuevo/page.tsx` | ✅ |
| 2.9 | Panel admin: editar activo `app/admin/activos/[id]/page.tsx` | ✅ |
| 2.10 | Panel admin: listado `app/admin/activos/page.tsx` | ✅ |
| 2.11 | Transiciones de estado validadas server-side | ✅ |

## Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `src/lib/auction-engine.ts` | Lógica de negocio: CRUD, transiciones, validaciones |
| `src/app/actions/assets.ts` | Server Actions: create, update, delete, changeStatus, getAll, getById |
| `src/app/api/uploads/route.ts` | API route para upload de imágenes |
| `src/components/AssetCard.tsx` | Card de activo con imagen, precio, badge de estado |
| `src/app/remates/page.tsx` | Listado público de remates (grid responsivo) |
| `src/app/remates/[id]/page.tsx` | Detalle de activo con info completa |
| `src/app/admin/activos/page.tsx` | Listado admin de activos |
| `src/app/admin/activos/nuevo/page.tsx` | Formulario crear activo con upload |
| `src/app/admin/activos/[id]/page.tsx` | Formulario editar activo |
| `src/app/admin/activos/[id]/edit-form.tsx` | Componente client form para editar |

## Criterio de aceptación

- [x] Admin puede crear activo con descripción, precio base, imagen
- [x] Admin puede editar activo existente
- [x] Admin puede listar todos los activos
- [x] Transición PENDIENTE → ACTIVO validada server-side
- [x] Página pública muestra listado de remates activos
- [x] Detalle de activo muestra info completa + precio actual
- [x] Imágenes almacenadas correctamente
- [x] Validaciones de precio base (> 0) en servidor

## Transiciones de estado

```
PENDIENTE ──→ ACTIVO     (admin abre remate)
ACTIVO ──→ ADJUDICADO    (martillero cierra con ganador)
ACTIVO ──→ DESIERTO      (martillero cierra sin pujas)
PENDIENTE ──→ DESIERTO   (admin cancela lote)
```

## Notas de implementación

- `auction-engine.ts` será expandido en Fase 3 con lógica de pujas
- Imágenes en `public/uploads/` para desarrollo (migrar a S3 en producción)
- Upload como API route (no Server Action) para evitar problemas de bundling con Turbopack
- Server Actions verifican rol `ADMINISTRATIVO` antes de mutaciones
- Listado público no requiere autenticación
