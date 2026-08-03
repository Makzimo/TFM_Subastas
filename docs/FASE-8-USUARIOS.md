# FASE 8 — Gestión de Usuarios

> **Estado:** ✅ Completada (2026-08-01)
> **Dependencias:** FASE 1 (auth), FASE 2 (martilleros como dueños de lotes)

## Objetivo

Apartado administrativo para gestionar todas las cuentas de la plataforma: listar, cambiar rol, activar/desactivar, crear usuarios de cualquier rol y restablecer contraseñas.

## Tareas

| #  | Tarea | Estado |
|----|-------|--------|
| 8.1 | Campo `User.isActive` en schema + migración (`prisma db push`) | ✅ |
| 8.2 | Bloqueo de login para cuentas desactivadas (`authorize`) | ✅ |
| 8.3 | Helper `getActiveUser([roles])` en `lib/current-user.ts` | ✅ |
| 8.4 | Server Actions de usuarios (`app/actions/users.ts`) | ✅ |
| 8.5 | Página `/admin/usuarios` con tabla (rol, activo, reset clave) | ✅ |
| 8.6 | Página `/admin/usuarios/nuevo` (crear cualquier rol) | ✅ |
| 8.7 | Auditoría de eventos de usuarios | ✅ |

## Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `src/lib/current-user.ts` | Helper `getActiveUser([roles])`: auth + `isActive` + rol |
| `src/app/actions/users.ts` | Actions: create, list, updateRole, setActive, resetPassword |
| `src/app/admin/usuarios/page.tsx` | Listado de usuarios (server component) |
| `src/app/admin/usuarios/users-table.tsx` | Tabla interactiva: cambio de rol, toggle activo, reset clave |
| `src/app/admin/usuarios/nuevo/page.tsx` | Formulario de creación de usuarios |

## Modelo de datos (cambio v0.12.0)

```prisma
model User {
  // ...
  isActive Boolean @default(true)
  guarantees BidderGuarantee[] // garantías 1:1 por lote
}
```

## Seguridad

- **Auto-lockout protegido:** el admin no puede cambiar su propio rol ni desactivarse a sí mismo
- **Cuenta desactivada** (`isActive: false`):
  - No puede iniciar sesión (`authorize` devuelve `null`)
  - No puede ejecutar server actions aunque conserve un JWT activo (el helper consulta `isActive` en DB en cada acción: assets, users, bids, guarantees)
- Todas las acciones requieren rol `ADMINISTRATIVO` y usuario activo
- `resetUserPasswordAction` usa el mismo hashing de `lib/auth.ts` (bcrypt); un admin puede restablecer contraseñas de cualquier rol

## Auditoría

Nuevos eventos `AuditEvent`: `USER_CREATED`, `USER_ROLE_CHANGED`, `USER_ACTIVATED`, `USER_DEACTIVATED`, `PASSWORD_RESET`.

## Criterio de aceptación

- [x] Admin lista todos los usuarios (correo, nombre, rol, estado)
- [x] Admin cambia el rol de un usuario
- [x] Admin activa/desactiva cuentas; desactivada no puede iniciar sesión ni pujar
- [x] Admin crea usuarios de cualquier rol
- [x] Admin restablece contraseña de cualquier usuario
- [x] Admin no puede desactivarse ni degradarse a sí mismo
