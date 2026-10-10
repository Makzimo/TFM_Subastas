# Health Checks (Liveness & Readiness)

## Propuesta de Endpoints

| Endpoint | Propósito | Cache | Uso |
|---|---|---|---|
| `GET /api/health` | **Health general** (app + dependencias críticas) | No cachear | Monitoreo, alertas, manual. |
| `GET /api/healthz` (alternativo) | Liveness simple (app viva) | No cachear | LB/K8s liveness (liviano). |
| `GET /api/readyz` (alternativo) | Readiness (deps listas para tráfico) | No cachear | LB/K8s readiness (con checks DB). |

**Recomendación inicial:** `/api/health` combinado (separar liveness/readiness si orquestador lo requiere).

## Checks Incluidos (Readiness Crítico)

| Check | OK Condición | Severidad Fallo | Notas |
|---|---|---|---|
| **App** | Proceso responde, versión build accesible | Crítico | Versión `vX.Y.Z` (build). |
| **DB (Prisma)** | `SELECT 1` / ping exitoso (< timeout) | **Crítico** | Conexión válida, pool OK. |
| **Latencia DB** | < umbral definido | Warning/Crítico | Detecta lentitud. |
| **Migraciones (opcional)** | Pendientes controladas (no bloquear liveness) | Info/Warning | **NO bloquear tráfico** por migraciones pendientes salvo criterio explícito. Preferible readiness separa. |
| **Dependencias externas críticas** | Health si imprescindibles | Según criticidad | Solo si bloqueo tráfico directo. Evitar checks pesados. |

## Comportamiento HTTP
- **Liveness (app viva):** `200 OK` si proceso corre. **No** chequear DB pesado (evitar reinicios cascada).
- **Readiness (listo recibir tráfico):** `200 OK` si **todas dependencias críticas** listas. `503 Service Unavailable` si no listo.
- **Respuestas mínimas:** JSON compacto. **No exponer detalles internos** en prod (stack, credenciales, DSN). Ej. `{ status:"ok", version:"v1.2.3", checks:{db:"ok"}, ts:"..." }` vs 503 con `checks:{db:"fail",detail:"timeout"}` (detalle interno solo logs).

## Configuración Probes
- **Liveness:** Intervalo razonable, `failureThreshold` para evitar flapping.
- **Readiness:** Más sensible (cambia tráfico). Timeout corto.
- **Startup probe** (si cold start): Útil para evitar matar app antes warm-up.

## Seguridad
- No exponer health público sensible si no necesario. Restringir por IP/Network si LB interno (opcional). Endpoint técnico.

## Checklist
- [ ] `/api/health` implementado/verificado Preprod
- [ ] Liveness/readiness separados si aplica orquestador
- [ ] Fail scenarios probados (DB down) → readiness 503
- [ ] Logs correlacionados en fallos
- [ ] Usado por monitoreo/alertas (3 fallos consecutivos)