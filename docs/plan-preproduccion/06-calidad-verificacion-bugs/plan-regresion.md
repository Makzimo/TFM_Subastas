# Plan de Regresión

## Alcance
Basado en **Análisis de Impacto Obligatorio**: rutas afectadas **+ TODOS sus consumidores** (componentes/páginas que importan/usan). No limitar a ruta editada.

## Suite Mínima de Regresión (Release Candidate)

| Flujo | Escenarios | Tipo | Criticidad |
|---|---|---|---|
| **Remate completo** | Crear lote → abrir → pujar (incrementos + valor libre) → precio actualiza → cierre manual MARTILLERO | E2E+Integration | P0 |
| **Garantías** | POSTOR sin `isPaid:true` → intento puja → **bloqueado**. POSTOR con garantía pagada → puja OK. | Integration | P0 |
| **Incrementos** | +1.000.000, +100.000, +50.000 + valor libre. Monto inferior → rechazado. | Unit+Integration | P0 |
| **Race condition** | 2 pujas simultáneas mismo lote | Integration | P0 |
| **Cierre manual** | Válido, doble cierre, lote en estado incorrecto → rechazado. Idempotente. | Integration+E2E | P0 |
| **RBAC** | POSTOR intenta cerrar → 403. MARTILLERO restricciones (si aplica). ADMIN vs roles. | Integration | P0 |
| **Serialización RSC** | Server→Client + `data:` actions. Sin `Decimal/Date` en cliente. | Revisión+Runtime | P0 |
| **Validación servidor** | Bypass cliente (monto manipulado front) → **rechazado servidor**. | E2E negativo | P0 |
| **Transacciones** | Fallo intermedio → rollback + estado consistente. | Integration | P0 |
| **Consumidores críticos** | Probar formularios usados por múltiples rutas (p.ej. `EditAssetForm`) en **Admin Y Martillero**. | Smoke+Integration | P0 |

## Ejecución
- **Automatizada:** CI en RC (gates bloqueantes).
- **Manual:** Casos críticos tiempo real + UX + rutas consumidores no cubiertos por automatismos.
- **Smoke Pre/Post-Deploy:** Obligatorio (ver 6.4).

## Criterio de Salida
- **0 bugs bloqueantes.** Bugs críticos conocidos: **solo** con mitigación documentada, issue abierto, aprobación Tech Lead y **NO impiden Go** únicamente en casos excepcionales (raro). Preferible NO-GO.

## Matriz Cobertura Consumidores
Por cada componente editado: listar consumidores → marcar verificado (checklist). **Obligatorio** antes de merge a release.