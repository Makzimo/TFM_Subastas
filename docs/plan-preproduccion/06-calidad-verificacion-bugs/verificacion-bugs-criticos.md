# Verificación de Bugs Críticos (Lanzamiento)

## Checklist Verificación Funcional Crítica

| Área | Casos a Verificar | Método | Esperado | OK |
|---|---|---|---|---|
| **Motor Subasta (`auction-engine.ts`)** | Incrementos, mínimo superior, comparación montos, valor libre | Unit + Integration | Única fuente verdad. Rechazos correctos. | ☐ |
| **Garantías** | `isPaid: true/false/null`, intento sin pago | Integration (TX) | Rechazo servidor + mensaje seguro. | ☐ |
| **Cierre Manual (MARTILLERO)** | Válido, doble cierre, estado lote inválido | Integration | Controlado, idempotente, auditado. | ☐ |
| **Race Condition** | 2 pujas simultáneas | Integration | Solo 1 válida, 2ª rechazada (precio actualizado o denegado). | ☐ |
| **Serialización RSC** | Props Server→Client, `data:` Server Actions | Revisión + runtime | Planos (`number/ISO`). Sin `Decimal/Date`. | ☐ |
| **Validación Servidor** | Bypass cliente (monto manipulado) | E2E negativo | Siempre rechazada en servidor. | ☐ |
| **Transacciones** | Fallo intermedio | Integration | Rollback. Estado consistente. | ☐ |
| **RBAC** | POSTOR intenta cerrar. MARTILLERO intenta pujar (si prohibido). | Integration | 403/denegado servidor. | ☐ |
| **Transiciones Estado** | Inválida entre estados subasta/lote | Integration | Bloqueada. | ☐ |
| **Manejo Errores** | Try/catch, sin leak stack, correlación | Manual+Integration | Genéricos cliente. Detallados logs internos. | ☐ |
| **Realtime (SSE/WebSocket)** | Precio actualiza tras puja válida | E2E | Actualización correcta. Sin loops. | ☐ |
| **BidControls** | Incrementos rápidos + valor libre | E2E | UX correcto + validación servidor. | ☐ |

## Criterio Aceptación
- **100%** ítems críticos marcados OK.
- Cualquier **NO** = bloqueante a menos excepción registrada/aprobada.

## Evidencia
Adjuntar logs/tests/revisión para cada crítico en checklist ejecución.