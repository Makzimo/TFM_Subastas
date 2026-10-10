# Pre-Flight Deploy (Antes de Producción)

## Checklist Obligatorio - 100% Completado para GO

### Preparación
- [ ] **Feature Freeze** confirmado. Solo fixes críticos aprobados bajo freeze.
- [ ] Rama `release/vX.Y.Z` creada, congelada salvo fixes autorizados.
- [ ] **Análisis de Impacto** cumplido para cambios bajo RC (consumidores listados + fronteras RSC).
- [ ] Equipo **On-Call** confirmado + responsables por rol.
- [ ] **Ventana mantenimiento** definida (inicio-fin TZ clara). Comunicado stakeholders.

### Versionado, Docs & Changelog
- [ ] `CHANGELOG.md` actualizado (Keep a Changelog, **orden cronológico inverso**). Cambios categorizados correctamente.
- [ ] Versión SemVer correcta (`vX.Y.Z`). **Tag propuesto** listo.
- [ ] Decisiones arquitectónicas registradas en `/docs`.
- [ ] Release Notes preparados (desde Changelog).

### Calidad, Seguridad, Build
- [ ] `pnpm check` (tsc --noEmit + eslint src/) → **0 errores**
- [ ] `pnpm test` → Suites críticas OK
- [ ] `pnpm build` → Exitoso
- [ ] `pnpm audit --audit-level=high` → **0 High/Critical**
- [ ] `pnpm prisma validate` → OK. Schema consistente.

### Base de Datos
- [ ] Migraciones Prisma **revisadas** (SQL generado). Sin operaciones destructivas no justificadas.
- [ ] Migraciones aplicadas **exitosamente** en Preprod (idénticas a Prod).
- [ ] **Backup Prod REALIZADO y VERIFICADO RESTORABLE** (restore de prueba válido registrado).
- [ ] Procedimiento rollback DB documentado/viable por migraciones críticas.
- [ ] Índices/performance validados Preprod (EXPLAIN si aplica).

### Validación Funcional (Preprod)
- [ ] **Smoke tests**: rutas afectadas **+ TODOS sus consumidores** OK (6.4).
- [ ] **Regresión mínima** RC OK (6.2).
- [ ] **Bugs críticos** verificados (6.3). 0 bloqueantes.
- [ ] **Lógica subasta:** garantías, cierre manual, TX, race conditions OK.
- [ ] **Serialización RSC:** fronteras Server→Client + `data:` actions OK (sin `Decimal/Date`).
- [ ] **RBAC:** validación servidor OK.

### Infra, Observabilidad, Rollback
- [ ] Variables/env Prod validadas (secrets OK, `.env.example` actualizado).
- [ ] **Health checks** `/api/health` probados Preprod.
- [ ] Logs estructurados, alertas, dashboards activos.
- [ ] **Plan Rollback** revisado. **DRY-RUN EXITOSO** (app + DB si aplica) documentado (fechas/times).
- [ ] **Kill Switch** probado (habilitar/deshabilitar pujas) en Preprod.
- [ ] Feature flags configurados por entorno.

### Aprobación Final
- [ ] **Go/No-Go** votado/aprobado por Tech Lead + responsables.
- [ ] Criterios 1.3b **TODOS** en OK.
- [ ] Acta/registro de aprobación guardado (referencia en release).

**Bloqueante:** Si **cualquier** ítem obligatorio queda sin marcar → **NO-GO**.