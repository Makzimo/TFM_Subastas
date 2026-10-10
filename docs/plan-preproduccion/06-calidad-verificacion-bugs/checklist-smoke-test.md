# Checklist Smoke Test (Pre/Post-Lanzamiento)

## Regla de Oro (AGENTS.md §5)
Si se toca cualquier componente/acción: probar **ruta editada Y TODOS sus consumidores**. Listar consumidores **obligatorio**.

## Smoke Test - Pre-Lanzamiento (Preprod, Obligatorio)

| Ruta/Pantalla | Consumidores (Listar obligatoriamente) | Acción Smoke | Resultado Esperado | Verificado (Sí/No) | Responsable |
|---|---|---|---|---|---|
| `/admin` / Panel Admin | Componentes usados (forms/tables) | Carga + navegación + acciones básicas | OK, authz OK, sin errores consola | ☐ | QA/Dev |
| `/martillero` / Panel Martillero | Consumidores (p.ej. `EditAssetForm`, gestión activos/lotes) | Gestión lotes, navegación | OK + permisos correctos | ☐ | QA/Dev |
| Gestión Activos (Admin + Martillero) | **Todos consumidores** `EditAssetForm` | Crear/Editar activo, validaciones | Contrato props estable. Sin romper rutas | ☐ | QA/Dev |
| Sala de Remate (`AuctionRoom`) | `BidControls`, `AuctionTimer`, componentes relacionados | Carga, render precios, estado conexión | Precios correctos. Sin loops/re-renders excesivos | ☐ | QA/Dev |
| Flujo Puja Completo | Room + BidControls + Server Actions | Puja válida → precio actualiza | TX OK, estado consistente, realtime OK | ☐ | QA/Dev |
| Garantías (`GuaranteePrompt`) | Consumidores (Postor + rutas que lo usan) | Estado `isPaid`, prompt | Bloquea puja si no pagada. Permite si pagada | ☐ | QA/Dev |
| `/postor` / Panel Postor | Rutas/acciones usadas | Acceso + listado subastas | Authz OK | ☐ | QA/Dev |
| Cierre Manual (MARTILLERO) | Acción cierre + consumidores room | Cerrar lote válido | Estado cambia, auditado, notifica room | ☐ | QA/Dev |
| Rutas críticas tocadas (lista dinámica) | **TODOS sus consumidores** (rellenar) | Según impacto | Sin regresiones | ☐ | QA/Dev |
| **Health Check** | Infra | `GET /api/health` (propuesto) | `200 OK`, DB OK, checks críticos OK | ☐ | DevOps |

## Smoke Test - Post-Deploy (Prod, Mínimo Crítico)

| Ruta/Pantalla | Acción Mínima | Esperado | Verificado | Responsable |
|---|---|---|---|---|
| `/api/health` (o readiness) | 3-5 requests sucesivos | 200 estable, sin flapping | ☐ | DevOps/On-Call |
| Sala de Remate (ruta crítica) | Carga página + estado | Carga OK, sin 5xx | ☐ | On-Call/QA |
| Puja válida (smoke controlado) | Caso feliz mínimo (no ensayo masivo) | Éxito + precio actualiza | ☐ | On-Call+QA (controlado) |
| Cierre manual (si habilitado ventana) | Solo si requerido/test controlado | OK idempotente | ☐ | Martillero+Tech |
| Login + RBAC básico | Acceso roles críticos | OK | ☐ | On-Call |

## Notas
- **Listado de consumidores debe rellenarse explícitamente** por cada ítem (no genérico). Evidencia en PR/ejecución.
- Cualquier fallo bloqueante → **NO lanzar** o **activar Rollback** (según fase).