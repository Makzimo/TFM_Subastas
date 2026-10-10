# Plan de Rollback y Contingencia

## Principios
- **Rápido y reversible** cuando procede.
- **Decisión basada en criterios** (no emocional).
- **Kill Switch** disponible para mutaciones críticas (pujas).
- **DB rollback destructivo = último recurso** con aprobación explícita.

## Criterios para Ejecutar Rollback

| Situación | Severidad | Acción Inmediata |
|---|---|---|
| Health checks fallan consecutivos (≥3) tras deploy | **P0** | Rollback App (prioritario). Evaluar Kill Switch. |
| Spike 5xx sostenido tras switch tráfico | **P0** | Rollback App. Investigar. |
| Errores TX Prisma masivos / integridad sospechada | **P0** | **Kill Switch** (bloquear pujas). Evaluar rollback app/DB. |
| Smoke post-deploy crítico falla | **P0** | **NO habilitar flags amplios**. Rollback App. |
| Migración falla durante aplicación | **P0** | Seguir 10.3 (migración rollback/restore). |
| Regresión funcional crítica detectada | **P0** | Kill Switch + Rollback según alcance. |

## 10.1 Cadena de Autorización
- **On-Call (P0):** Activar incidencia, ejecutar Kill Switch si riesgo inminente.
- **Tech Lead:** Aprobar decisión rollback global + aprobación **rollback DB destructivo**.
- **DevOps/DBA:** Ejecutar app/DB rollback.
- **QA:** Validar smoke post-rollback.

## 10.2 Rollback de Aplicación (Código)

### Blue-Green
1. Switch tráfico a **versión anterior** (`vX.Y.Z-1`, target blue/green previo).
2. Verificar health checks target anterior (200 estable).
3. Invalidar caches si necesario (no cachear sala remate).
4. Smoke crítico post-rollback.

### Rolling
1. Retroceder réplicas a imagen/tag anterior estable.
2. Monitorear readiness/liveness por réplica.
3. Verificar estabilidad tras rollback completo.

### Requisitos
- Rollback a **tag/artefacto verificado** (`vX.Y.Z-1`). Mantener histórico de releases desplegables.
- Tiempo objetivo rollback app: **< 5-10 minutos** (ideal). Medir real.

## 10.3 Rollback de Base de Datos

### Principios
- **Migraciones aditivas**: Generalmente **NO requieren rollback DB destructivo** (forward-only). Riesgo menor.
- **Migraciones destructivas** (`DROP`, `TRUNCATE`, `DELETE` masivo, `ALTER DROP`, datos perdidos): **Difícil/reversible con pérdida**. Requiere evaluación rigurosa.
- **Down-migrations**: Solo si documentadas, probadas en Preprod y **viables** sin corrupción.
- **Restore desde backup:** **Último recurso**. Implica downtime mayor + posible pérdida datos entre backup y fallo (depende RPO).

### Procedimiento (Evaluación Obligatoria)
1. **Clasificar migración**: ¿Destructiva? ¿Down-script probado?
2. **Evaluar impacto/pérdida**: Datos escritos post-migrate? RPO aceptable?
3. **Aprobación explícita Tech Lead + DBA** (obligatoria si destructivo/restore).
4. **Si down-migration viable y probado:** Ejecutar con extremo cuidado + verificación.
5. **Si NO viable:** **Considerar restore backup**. Documentar trade-offs + ventana extendida.
6. **Post-rollback DB:** Integridad verificada + smoke + auditoría.

> **Nunca ejecutar rollback DB automático.** Siempre humano aprobado con evidencia.

## 10.4 Kill Switch (Emergencia)

**Objetivo:** Bloquear **mutaciones críticas** inmediatamente (pujas, cierre manual) sin rollback completo si lectura segura.

### Activación
- **Autorizado:** On-Call P0 (sin esperar aprobación completa si riesgo crítico inminente).
- **Acción:** Desactivar flag `AUCTIONS_PUJA_ENABLED` (y otros escritura). Separar lectura/escritura.
- **Verificación:** Intento puja → rechazado por kill switch. Sala lectura sigue operativa si seguro.
- **Registro:** Timestamp, quién, razón, efecto.

### Desactivación
- Solo tras causa mitigada + validación + aprobación Tech Lead.

## 10.5 Procedimiento de Ejecución Rollback Completo

| # | Acción | Responsable | Verificación |
|---|---|---|---|
| **1. Detección** | Alertas P0 / health/smoke fail | On-Call | Confirmado (no falso positivo). Impacto evaluado. |
| **2. Incidencia** | Abrir canal + status page + comunicar interno | On-Call | Equipo notificado. Plantilla 9.2 #4/#5 preparada. |
| **3. Decisión** | Ejecutar rollback según criterios | Tech Lead + On-Call | Aprobado. Alcance (App/DB) definido. |
| **4. Kill Switch** | Bloquear mutaciones si aplica | On-Call | Verificado efectivo. |
| **5. Rollback App** | Revert a `vX.Y.Z-1` (Blue-Green/Rolling) | DevOps | Health anterior OK. Tráfico switch completo. |
| **6. Rollback DB** | **SOLO si necesario + aprobado** (10.3) | DevOps/DBA | Integridad OK. Auditoría cambios. |
| **7. Health Checks Post-Rollback** | Readiness/liveness + DB | DevOps | `200 OK` estable ≥ 2-3 min. |
| **8. Smoke Crítico Post-Rollback** | Funcionalidad esencial | QA | 0 bloqueantes. Sala remate OK. |
| **9. Monitoreo Estabilización** | 30-60 min | On-Call | Sin P0. Métricas retorno baseline. |
| **10. Comunicación Cierre** | Rollback ejecutado + estable | Tech Lead/PM | Plantilla 9.2 #5 enviada. Status actualizado. |
| **11. Post-Mortem** | RCA + acciones correctivas | Tech Lead | Crear entrada `docs/incidencias/` + seguimiento issues. |

## 10.6 Dry-Run Obligatorio

- **Realizar dry-run** en **Preprod** ANTES de Prod.
- Simular: Rollback App (switch), Kill Switch, validación health+smoke.
- **DB dry-run**: Si hay migraciones destructivas → simular procedimiento (o restore test documentado). No sobre prod.
- Documentar: **Tiempos reales**, pasos, cuellos botella, responsables, resultado.
- **Gate Go/No-Go:** Dry-run exitoso **OBLIGATORIO** (ver 3.3b).

## Post-Mortem Requerido
Tras cualquier rollback: **Root Cause Analysis** breve, impacto, tiempo total, qué falló, lecciones, acciones correctivas con owner + fecha objetivo. Guardar en `docs/incidencias/YYYY-MM-DD-vX.Y.Z-rollback.md` (crear carpeta si no existe).