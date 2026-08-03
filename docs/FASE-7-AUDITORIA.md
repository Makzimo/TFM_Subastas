# FASE 7 — Auditoría y Seguridad

> **Estado:** ✅ Completada (2026-07-18)
> **Dependencias:** FASE 3

## Objetivo

Trazabilidad completa de acciones críticas, manejo centralizado de errores y hardening de la aplicación.

## Tareas

| #  | Tarea | Estado |
|----|-------|--------|
| 7.1 | Implementar `lib/audit.ts` — logging de acciones | ✅ |
| 7.2 | Registrar cada puja en `AuditLog` | ✅ |
| 7.3 | Registrar cierre de remate en `AuditLog` | ✅ |
| 7.4 | Registrar acciones admin en `AuditLog` | ✅ |
| 7.5 | Implementar `lib/errors.ts` — manejo centralizado de errores | ✅ |
| 7.6 | Rate limiting en endpoints de puja | ✅ |
| 7.7 | Validación server-side reforzada | ✅ (ya existente) |
| 7.8 | Página admin de logs de auditoría | ✅ |

## Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `src/lib/audit.ts` | Funciones: logAction(), getLogsByEntity(), getLogsByUser(), getAllLogs() |
| `src/lib/errors.ts` | Clases de error custom + handleActionError() |
| `src/lib/rate-limit.ts` | Rate limiting en memoria (Map) |
| `src/app/admin/audit/page.tsx` | Página de logs de auditoría con badges |

## Criterio de aceptación

- [x] Toda puja queda registrada en `AuditLog` con usuario y timestamp
- [x] Cierre de remate registrado en `AuditLog`
- [x] Acciones admin (crear activo) registradas
- [x] Errores manejados centralmente con clases custom
- [x] Rate limiting activo en pujas (max 10/min por usuario)
- [x] Logs de auditoría consultables por admin
- [x] Sin información sensible en logs (no registrar passwords, tokens)

## Eventos de auditoría

| Evento | EntityId | Details |
|--------|----------|---------|
| `BID_PLACED` | assetId | `{ amount, bidderId }` |
| `AUCTION_CLOSED` | assetId | `{ status, winnerId?, totalBids }` |
| `ASSET_CREATED` | assetId | `{ description, basePrice }` |

## Rate Limiting

- **Regla:** Máximo 10 pujas por usuario por minuto
- **Implementación:** Map en memoria con ventana deslizante
- **Respuesta:** Error con tiempo de espera en segundos

## Notas de implementación

- `AuditLog` existe en el schema Prisma (creado en Fase 0)
- `lib/audit.ts` encapsula inserción con try/catch silencioso (nunca rompe el flujo)
- Errores custom permiten respuestas consistentes al cliente
- Rate limiting básico con Map en memoria (suficiente para un solo servidor)
- Para escalar: migrar a Redis para rate limiting distribuido
