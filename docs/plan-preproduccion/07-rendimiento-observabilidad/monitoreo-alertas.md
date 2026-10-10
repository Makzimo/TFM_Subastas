# Monitoreo y Alertas

## SLOs/SLA (Propuesta Base)

| SLO | Objetivo | Medida |
|---|---|---|
| Disponibilidad (Uptime) | ≥ 99.9% | Health checks / uptime |
| Latencia puja (p95) | < 300ms | Server Actions TX |
| Tasa 5xx | < 0.1% (ventana 5m) | HTTP/Logs |
| Rechazos negocio anómalos | Baseline estable | Ratio vs histórico |

## Alertas Críticas (On-Call)

| Métrica/Evento | Umbral | Severidad | Canal | Acción (Runbook Ref.) |
|---|---|---|---|---|
| **5xx sostenidos** | > 2-5% 5m (o incremento súbito) | **P0** | Pager/On-Call | Investigar logs. Si creciente → evaluar Rollback (10). |
| **Healthcheck fail** | 3 fallos consecutivos (readiness/liveness) | **P0** | Paging | Ver infra, activar Kill Switch si afecta mutaciones, considerar Rollback. |
| **Errores TX Prisma** | Incremento súbito vs baseline (spike) | **P0** | Paging | Integridad DB. Revisar race conditions. |
| **Pujas fallidas masivas** | Pico anómalo sostenido (razón no abuso esperado) | **P1/P0** | Alert/On-Call | Revisar garantías/estados. Posible regresión. |
| **Latencia puja p95** | > 500ms sostenido 5-10m | **P1** | Alert | DB/TX, locks, índices. |
| **Pool DB conexiones** | > 80% sostenido | **P1** | Alert | Escalar, leaks, queries lentas. |
| **Realtime lag (sala)** | Latencia sostenida alta | **P1** | Alert | SSE/WebSocket, backpressure, conexiones. |
| **Denegos RBAC masivos** | Pico anómalo | **P1** | Alert | Posible intento abuso o bug authz. |

## Dashboards Recomendados
- **Negocio:** Subastas activas, pujas/min, lotes, precios últimos.
- **Técnico:** 5xx/latencia, errores TX, conexiones DB, health.
- **Seguridad/Operaciones:** Alertas activas, correlación requestId.

## Reglas
- **Alertar por síntoma (impacto)** > ruido.
- **Runbook por alerta** (acción clara). Referenciar `09-lanzamiento-operaciones/runbook-lanzamiento.md` y `10-rollback-contingencia/plan-rollback.md`.
- **Silencios justificados** (mantenimiento) documentados.
- **Alert fatigue**: ajustar umbrales con baseline Preprod/Prod inicial.

## Checklist Monitoreo Pre-Prod
- [ ] Dashboards cargan + datos fluyen
- [ ] Alertas configuradas (test alert no invasivo)
- [ ] Health checks probados (fail scenarios)
- [ ] Correlación (requestId) visible en logs/alertas